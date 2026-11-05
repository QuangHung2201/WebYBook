package com.webybook.repository;

import com.webybook.dto.request.ContactRequest;
import com.webybook.dto.request.CreateOrderRequest;
import com.webybook.dto.request.CreateReviewRequest;
import com.webybook.exception.BadRequestException;
import com.webybook.exception.ResourceNotFoundException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public class CustomerCommerceRepository {
    private final NamedParameterJdbcTemplate jdbc;

    public CustomerCommerceRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
        jdbc.getJdbcOperations().execute("""
                CREATE TABLE IF NOT EXISTS contact_messages (
                  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                  name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL,
                  phone VARCHAR(30), subject VARCHAR(255) NOT NULL,
                  message TEXT NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """);
    }

    public Map<String, Object> cart(long userId) {
        List<Map<String, Object>> items = jdbc.queryForList("""
                SELECT ci.book_id bookId, ci.quantity qty, b.title, b.cover_image coverImage,
                       b.price, b.original_price originalPrice, b.stock_quantity stock
                FROM carts c JOIN cart_items ci ON ci.cart_id=c.id JOIN books b ON b.id=ci.book_id
                WHERE c.user_id=:userId AND c.status='active'
                ORDER BY ci.created_at
                """, new MapSqlParameterSource("userId", userId));
        BigDecimal subtotal = items.stream().map(i -> {
            BigDecimal price = (BigDecimal) i.get("price");
            return price.multiply(BigDecimal.valueOf(((Number) i.get("qty")).longValue()));
        }).reduce(BigDecimal.ZERO, BigDecimal::add);
        return Map.of("items", items, "subtotal", subtotal, "count",
                items.stream().mapToInt(i -> ((Number) i.get("qty")).intValue()).sum());
    }

    @Transactional
    public Map<String, Object> addCart(long userId, long bookId, int qty) {
        ensureBook(bookId);
        Long cartId = activeCart(userId);
        jdbc.update("""
                INSERT INTO cart_items(cart_id, book_id, quantity) VALUES (:cartId,:bookId,:qty)
                ON DUPLICATE KEY UPDATE quantity=quantity+:qty
                """, new MapSqlParameterSource().addValue("cartId", cartId).addValue("bookId", bookId).addValue("qty", qty));
        return cart(userId);
    }

    @Transactional
    public Map<String, Object> updateCart(long userId, long bookId, int qty) {
        Long cartId = activeCart(userId);
        if (qty <= 0) {
            jdbc.update("DELETE FROM cart_items WHERE cart_id=:cartId AND book_id=:bookId",
                    new MapSqlParameterSource().addValue("cartId", cartId).addValue("bookId", bookId));
        } else {
            jdbc.update("UPDATE cart_items SET quantity=:qty WHERE cart_id=:cartId AND book_id=:bookId",
                    new MapSqlParameterSource().addValue("cartId", cartId).addValue("bookId", bookId).addValue("qty", qty));
        }
        return cart(userId);
    }

    @Transactional
    public Map<String, Object> clearCart(long userId) {
        jdbc.update("DELETE ci FROM cart_items ci JOIN carts c ON c.id=ci.cart_id WHERE c.user_id=:userId AND c.status='active'",
                new MapSqlParameterSource("userId", userId));
        return cart(userId);
    }

    public Map<String, Object> validateVoucher(String code, BigDecimal subtotal) {
        Map<String, Object> voucher;
        try {
            voucher = jdbc.queryForMap("""
                SELECT * FROM vouchers WHERE UPPER(code)=UPPER(:code) AND status='active'
                  AND start_date<=NOW() AND end_date>=NOW()
                  AND minimum_order_amount<=:subtotal
                  AND (usage_limit IS NULL OR used_count<usage_limit)
                """, new MapSqlParameterSource().addValue("code", code.trim()).addValue("subtotal", subtotal));
        } catch (EmptyResultDataAccessException exception) {
            throw new BadRequestException("Mã giảm giá không hợp lệ hoặc đã hết hạn");
        }
        BigDecimal value = (BigDecimal) voucher.get("discount_value");
        BigDecimal discount = "percentage".equals(voucher.get("discount_type"))
                ? subtotal.multiply(value).divide(BigDecimal.valueOf(100))
                : value;
        Object max = voucher.get("maximum_discount");
        if (max != null) discount = discount.min((BigDecimal) max);
        return Map.of("voucher", voucher, "discount", discount);
    }

    @Transactional
    public Map<String, Object> createOrder(long userId, CreateOrderRequest request) {
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CreateOrderRequest.Item item : request.items()) {
            Map<String, Object> book = jdbc.queryForMap("SELECT price, stock_quantity FROM books WHERE id=:id AND status='active'",
                    new MapSqlParameterSource("id", item.bookId()));
            if (((Number) book.get("stock_quantity")).intValue() < item.qty()) {
                throw new BadRequestException("Sách không đủ tồn kho");
            }
            subtotal = subtotal.add(((BigDecimal) book.get("price")).multiply(BigDecimal.valueOf(item.qty())));
        }
        BigDecimal shipping = "EXPRESS".equalsIgnoreCase(request.shippingMethod())
                ? BigDecimal.valueOf(30000) : BigDecimal.valueOf(20000);
        BigDecimal discount = BigDecimal.ZERO;
        Long voucherId = null;
        if (request.voucherCode() != null && !request.voucherCode().isBlank()) {
            Map<String, Object> validated = validateVoucher(request.voucherCode(), subtotal);
            Map<String, Object> voucher = (Map<String, Object>) validated.get("voucher");
            voucherId = ((Number) voucher.get("id")).longValue();
            discount = (BigDecimal) validated.get("discount");
        }
        List<Long> shippingIds = jdbc.query("SELECT id FROM shipping_methods WHERE status='active' ORDER BY id LIMIT 1",
                new MapSqlParameterSource(), (rs, row) -> rs.getLong(1));
        if (shippingIds.isEmpty()) {
            jdbc.update("""
                    INSERT INTO shipping_methods(name,description,shipping_fee,estimated_days,status)
                    VALUES ('Standard','Giao hàng tiêu chuẩn',20000,5,'active')
                    """, new MapSqlParameterSource());
            shippingIds = jdbc.query("SELECT id FROM shipping_methods WHERE status='active' ORDER BY id LIMIT 1",
                    new MapSqlParameterSource(), (rs, row) -> rs.getLong(1));
        }
        Long shippingId = shippingIds.get(0);
        BigDecimal total = subtotal.add(shipping).subtract(discount).max(BigDecimal.ZERO);
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("userId", userId).addValue("shippingId", shippingId).addValue("voucherId", voucherId)
                .addValue("name", request.customerName()).addValue("phone", request.phone())
                .addValue("address", request.address()).addValue("subtotal", subtotal)
                .addValue("discount", discount).addValue("shipping", shipping).addValue("total", total);
        jdbc.update("""
                INSERT INTO orders(user_id,shipping_method_id,voucher_id,recipient_name,recipient_phone,
                shipping_address,shipping_ward,shipping_district,shipping_city,subtotal,discount_amount,
                shipping_fee,total_amount,status) VALUES (:userId,:shippingId,:voucherId,:name,:phone,
                :address,'','','',:subtotal,:discount,:shipping,:total,'pending')
                """, params);
        Long orderId = jdbc.getJdbcOperations().queryForObject("SELECT LAST_INSERT_ID()", Long.class);
        for (CreateOrderRequest.Item item : request.items()) {
            Map<String, Object> book = jdbc.queryForMap("SELECT price FROM books WHERE id=:id",
                    new MapSqlParameterSource("id", item.bookId()));
            BigDecimal line = ((BigDecimal) book.get("price")).multiply(BigDecimal.valueOf(item.qty()));
            jdbc.update("INSERT INTO order_items(order_id,book_id,quantity,unit_price,subtotal) VALUES (:orderId,:bookId,:qty,:price,:line)",
                    new MapSqlParameterSource().addValue("orderId", orderId).addValue("bookId", item.bookId())
                            .addValue("qty", item.qty()).addValue("price", book.get("price")).addValue("line", line));
            jdbc.update("UPDATE books SET stock_quantity=stock_quantity-:qty WHERE id=:id",
                    new MapSqlParameterSource().addValue("qty", item.qty()).addValue("id", item.bookId()));
        }
        if (voucherId != null) jdbc.update("UPDATE vouchers SET used_count=used_count+1 WHERE id=:id",
                new MapSqlParameterSource("id", voucherId));
        clearCart(userId);
        return order(orderId, userId);
    }

    public List<Map<String, Object>> orders(long userId, String status) {
        return jdbc.queryForList("SELECT id, user_id userId, recipient_name customerName, recipient_phone phone, shipping_address address, subtotal, discount_amount discount, shipping_fee shippingFee, total_amount total, status, created_at createdAt FROM orders WHERE user_id=:userId AND (:status='' OR status=:status) ORDER BY created_at DESC",
                new MapSqlParameterSource().addValue("userId", userId).addValue("status", status == null ? "" : status.toLowerCase()));
    }

    public Map<String, Object> order(long id, long userId) {
        Map<String, Object> result = jdbc.queryForMap("SELECT id, user_id userId, recipient_name customerName, recipient_phone phone, shipping_address address, subtotal, discount_amount discount, shipping_fee shippingFee, total_amount total, status, created_at createdAt FROM orders WHERE id=:id AND user_id=:userId",
                new MapSqlParameterSource().addValue("id", id).addValue("userId", userId));
        result.put("items", jdbc.queryForList("SELECT oi.book_id bookId,b.title,b.cover_image coverImage,oi.unit_price price,oi.quantity qty FROM order_items oi JOIN books b ON b.id=oi.book_id WHERE oi.order_id=:id",
                new MapSqlParameterSource("id", id)));
        return result;
    }

    @Transactional
    public void cancelOrder(long id, long userId) {
        int updated = jdbc.update("UPDATE orders SET status='cancelled' WHERE id=:id AND user_id=:userId AND status IN ('pending','confirmed')",
                new MapSqlParameterSource().addValue("id", id).addValue("userId", userId));
        if (updated == 0) throw new BadRequestException("Đơn hàng không thể hủy");
    }

    public List<Map<String, Object>> reviews(long bookId) {
        return jdbc.queryForList("SELECT r.id,r.user_id userId,u.full_name userName,r.rating,r.comment,r.status,r.created_at createdAt FROM reviews r JOIN users u ON u.id=r.user_id WHERE r.book_id=:bookId AND r.status='approved' ORDER BY r.created_at DESC",
                new MapSqlParameterSource("bookId", bookId));
    }

    @Transactional
    public Map<String, Object> createReview(long userId, long bookId, CreateReviewRequest request) {
        Long orderId = jdbc.queryForObject("SELECT o.id FROM orders o JOIN order_items oi ON oi.order_id=o.id WHERE o.user_id=:userId AND oi.book_id=:bookId AND o.status='delivered' LIMIT 1",
                new MapSqlParameterSource().addValue("userId", userId).addValue("bookId", bookId), Long.class);
        jdbc.update("INSERT INTO reviews(user_id,book_id,order_id,rating,comment,status) VALUES (:userId,:bookId,:orderId,:rating,:comment,'pending')",
                new MapSqlParameterSource().addValue("userId", userId).addValue("bookId", bookId).addValue("orderId", orderId)
                        .addValue("rating", request.rating()).addValue("comment", request.comment()));
        return Map.of("rating", request.rating(), "comment", request.comment(), "status", "pending");
    }

    public void removeReview(long userId, long reviewId) {
        jdbc.update("DELETE FROM reviews WHERE id=:id AND user_id=:userId",
                new MapSqlParameterSource().addValue("id", reviewId).addValue("userId", userId));
    }

    public void saveContact(ContactRequest request) {
        jdbc.update("INSERT INTO contact_messages(name,email,phone,subject,message) VALUES (:name,:email,:phone,:subject,:message)",
                new MapSqlParameterSource().addValue("name", request.name()).addValue("email", request.email())
                        .addValue("phone", request.phone()).addValue("subject", request.subject()).addValue("message", request.message()));
    }

    private Long activeCart(long userId) {
        List<Long> ids = jdbc.query("SELECT id FROM carts WHERE user_id=:userId AND status='active' LIMIT 1",
                new MapSqlParameterSource("userId", userId), (rs, row) -> rs.getLong(1));
        if (!ids.isEmpty()) return ids.get(0);
        jdbc.update("INSERT INTO carts(user_id,status) VALUES (:userId,'active')", new MapSqlParameterSource("userId", userId));
        return jdbc.getJdbcOperations().queryForObject("SELECT LAST_INSERT_ID()", Long.class);
    }

    private void ensureBook(long bookId) {
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM books WHERE id=:id AND status='active'",
                new MapSqlParameterSource("id", bookId), Integer.class);
        if (count == null || count == 0) throw new ResourceNotFoundException("Không tìm thấy sách");
    }
}
