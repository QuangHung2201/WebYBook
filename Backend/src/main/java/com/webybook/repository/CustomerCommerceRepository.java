package com.webybook.repository;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.webybook.dto.request.ContactRequest;
import com.webybook.dto.request.CreateOrderRequest;
import com.webybook.dto.request.CreateReviewRequest;
import com.webybook.exception.BadRequestException;
import com.webybook.exception.ResourceNotFoundException;
import com.webybook.util.ContactNormalizer;

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
                  message TEXT NOT NULL, user_id BIGINT UNSIGNED NULL,
                  status VARCHAR(20) NOT NULL DEFAULT 'pending',
                  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """);
        ensureContactColumn("user_id", "BIGINT NULL");
        ensureContactColumn("status", "VARCHAR(20) NOT NULL DEFAULT 'pending'");
    }

    public Map<String, Object> cart(long userId) {
        List<Map<String, Object>> items = jdbc.queryForList("""
                SELECT ci.book_id bookId, ci.quantity qty, b.title, b.cover_image coverImage,
                       b.price, b.original_price originalPrice, b.stock_quantity stock,
                       b.status, category.name categoryName,
                       COALESCE((SELECT GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', ')
                                 FROM book_authors ba JOIN authors a ON a.id=ba.author_id
                                 WHERE ba.book_id=b.id), '') authorNames
                FROM carts cart
                JOIN cart_items ci ON ci.cart_id=cart.id
                JOIN books b ON b.id=ci.book_id
                JOIN categories category ON category.id=b.category_id
                WHERE cart.user_id=:userId AND cart.status='active'
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
        if (qty <= 0) {
            throw new BadRequestException("Số lượng không hợp lệ");
        }
        Map<String, Object> book = activeBook(bookId);
        int stock = ((Number) book.get("stock")).intValue();
        Long cartId = activeCart(userId);
        Integer current = jdbc.queryForObject("""
                SELECT COALESCE((SELECT quantity FROM cart_items
                                 WHERE cart_id=:cartId AND book_id=:bookId), 0)
                """, new MapSqlParameterSource().addValue("cartId", cartId)
                .addValue("bookId", bookId), Integer.class);
        int currentQty = current == null ? 0 : current;
        if ((long) currentQty + qty > stock) {
            throw new BadRequestException("Sách chỉ còn " + stock + " cuốn trong kho");
        }
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
            Map<String, Object> book = activeBook(bookId);
            int stock = ((Number) book.get("stock")).intValue();
            if (qty > stock) {
                throw new BadRequestException("Sách chỉ còn " + stock + " cuốn trong kho");
            }
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

    public List<Map<String, Object>> availableVouchers(BigDecimal subtotal) {
        return jdbc.queryForList("""
                SELECT id, code, name, description,
                       discount_type discountType, discount_value discountValue,
                       minimum_order_amount minimumOrderAmount,
                       maximum_discount maximumDiscount,
                       usage_limit usageLimit, used_count usedCount,
                       start_date startDate, end_date endDate, status
                FROM vouchers
                WHERE status = 'active'
                  AND start_date <= NOW() AND end_date >= NOW()
                  AND (usage_limit IS NULL OR used_count < usage_limit)
                  AND (:subtotal IS NULL OR minimum_order_amount <= :subtotal)
                ORDER BY minimum_order_amount ASC, end_date ASC, id DESC
                """, new MapSqlParameterSource("subtotal", subtotal));
    }

    public List<Map<String, Object>> voucherCatalog(Long userId) {
        return jdbc.queryForList("""
                SELECT v.id, v.code, v.name, v.description,
                       v.discount_type discountType, v.discount_value discountValue,
                       v.minimum_order_amount minimumOrderAmount, v.maximum_discount maximumDiscount,
                       v.usage_limit usageLimit, v.used_count usedCount,
                       v.start_date startDate, v.end_date endDate, v.status,
                       CASE WHEN v.status <> 'active' THEN 'INACTIVE'
                            WHEN v.start_date > NOW() THEN 'UPCOMING'
                            WHEN v.end_date < NOW() THEN 'EXPIRED'
                            WHEN v.usage_limit IS NOT NULL AND v.used_count >= v.usage_limit THEN 'EXHAUSTED'
                            WHEN :userId IS NOT NULL AND EXISTS (
                                SELECT 1 FROM orders used_order
                                WHERE used_order.user_id=:userId AND used_order.voucher_id=v.id
                            ) THEN 'USED'
                            ELSE 'AVAILABLE' END lifecycleStatus
                FROM vouchers v ORDER BY v.start_date DESC, v.id DESC
                """, new MapSqlParameterSource("userId", userId));
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
            @SuppressWarnings("unchecked")
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

    public Map<String, Object> orders(long userId, String status, int page, int pageSize) {
        MapSqlParameterSource queryParams = new MapSqlParameterSource().addValue("userId", userId)
                .addValue("status", status == null ? "" : status.toLowerCase());
        Integer count = jdbc.queryForObject("""
                SELECT COUNT(*) FROM orders o
                WHERE o.user_id=:userId AND (:status='' OR o.status=:status)
                """, queryParams, Integer.class);
        int total = count == null ? 0 : count;
        int offset = (page - 1) * pageSize;
        List<Map<String, Object>> rows = jdbc.queryForList("""
                SELECT o.id, o.user_id userId, o.recipient_name customerName, o.recipient_phone phone,
                       o.shipping_address address, o.subtotal, o.discount_amount discount,
                       o.shipping_fee shippingFee, o.total_amount total, o.status,
                       o.created_at createdAt, o.updated_at updatedAt, v.code voucherCode,
                       (SELECT p.payment_method FROM payments p WHERE p.order_id=o.id ORDER BY p.id DESC LIMIT 1) paymentMethod,
                       (SELECT p.payment_status FROM payments p WHERE p.order_id=o.id ORDER BY p.id DESC LIMIT 1) paymentStatus,
                       sm.name shippingMethod
                FROM orders o
                LEFT JOIN vouchers v ON v.id = o.voucher_id
                LEFT JOIN shipping_methods sm ON sm.id=o.shipping_method_id
                WHERE o.user_id=:userId AND (:status='' OR o.status=:status)
                ORDER BY o.created_at DESC
                LIMIT :limit OFFSET :offset
                """, queryParams.addValue("limit", pageSize).addValue("offset", offset));
        attachItems(rows);
        return Map.of("items", rows, "total", total, "page", page, "pageSize", pageSize,
                "totalPages", Math.max(1, (int) Math.ceil(total / (double) pageSize)));
    }

    public Map<String, Object> order(long id, long userId) {
        Map<String, Object> result;
        try {
            result = jdbc.queryForMap("""
                SELECT o.id, o.user_id userId, o.recipient_name customerName, o.recipient_phone phone,
                       o.shipping_address address, o.subtotal, o.discount_amount discount,
                       o.shipping_fee shippingFee, o.total_amount total, o.status,
                       o.created_at createdAt, o.updated_at updatedAt, v.code voucherCode,
                       (SELECT p.payment_method FROM payments p WHERE p.order_id=o.id ORDER BY p.id DESC LIMIT 1) paymentMethod,
                       (SELECT p.payment_status FROM payments p WHERE p.order_id=o.id ORDER BY p.id DESC LIMIT 1) paymentStatus,
                       sm.name shippingMethod
                FROM orders o
                LEFT JOIN vouchers v ON v.id = o.voucher_id
                LEFT JOIN shipping_methods sm ON sm.id=o.shipping_method_id
                WHERE o.id=:id AND o.user_id=:userId
                """, new MapSqlParameterSource().addValue("id", id).addValue("userId", userId));
        } catch (EmptyResultDataAccessException exception) {
            throw new ResourceNotFoundException("Không tìm thấy đơn hàng");
        }
        result.put("items", jdbc.queryForList("""
                SELECT oi.book_id bookId, b.title, b.cover_image coverImage,
                       oi.unit_price price, oi.quantity qty
                FROM order_items oi JOIN books b ON b.id=oi.book_id
                WHERE oi.order_id=:id
                ORDER BY oi.id
                """, new MapSqlParameterSource("id", id)));
        result.put("history", jdbc.queryForList("""
                SELECT h.id, h.old_status oldStatus, h.new_status newStatus, h.note,
                       h.created_at createdAt, u.full_name changedByName
                FROM order_status_history h
                LEFT JOIN users u ON u.id = h.changed_by
                WHERE h.order_id=:id
                ORDER BY h.created_at ASC, h.id ASC
                """, new MapSqlParameterSource("id", id)));
        return result;
    }

    @Transactional
    public void cancelOrder(long id, long userId) {
        Map<String, Object> current;
        try {
            current = jdbc.queryForMap("""
                    SELECT status FROM orders WHERE id=:id AND user_id=:userId
                    """, new MapSqlParameterSource().addValue("id", id).addValue("userId", userId));
        } catch (EmptyResultDataAccessException exception) {
            throw new BadRequestException("Đơn hàng không thể hủy");
        }
        String oldStatus = String.valueOf(current.get("status"));
        if (!"pending".equals(oldStatus) && !"confirmed".equals(oldStatus)) {
            throw new BadRequestException("Đơn hàng không thể hủy");
        }
        Integer paidOnline = jdbc.queryForObject("""
                SELECT COUNT(*) FROM payments WHERE order_id=:id AND payment_status='paid'
                  AND UPPER(payment_method) NOT IN ('COD','CASH_ON_DELIVERY')
                """, new MapSqlParameterSource("id", id), Integer.class);
        if (paidOnline != null && paidOnline > 0) {
            throw new BadRequestException("Đơn hàng đã thanh toán trực tuyến; vui lòng liên hệ hỗ trợ để xử lý hủy và hoàn tiền");
        }
        int updated = jdbc.update("""
                UPDATE orders SET status='cancelled'
                WHERE id=:id AND user_id=:userId AND status=:oldStatus
                """, new MapSqlParameterSource().addValue("id", id).addValue("userId", userId)
                .addValue("oldStatus", oldStatus));
        if (updated == 0) {
            throw new BadRequestException("Đơn hàng không thể hủy");
        }
        jdbc.update("""
                INSERT INTO order_status_history(order_id, old_status, new_status, changed_by, note)
                VALUES (:id, :oldStatus, 'cancelled', :userId, 'Khách hàng hủy đơn')
                """, new MapSqlParameterSource().addValue("id", id).addValue("oldStatus", oldStatus)
                .addValue("userId", userId));
    }

    private void attachItems(List<Map<String, Object>> orders) {
        if (orders.isEmpty()) {
            return;
        }
        List<Long> orderIds = orders.stream()
                .map(order -> ((Number) order.get("id")).longValue())
                .toList();
        List<Map<String, Object>> itemRows = jdbc.queryForList("""
                SELECT oi.order_id orderId, oi.book_id bookId, b.title, b.cover_image coverImage,
                       oi.unit_price price, oi.quantity qty
                FROM order_items oi JOIN books b ON b.id=oi.book_id
                WHERE oi.order_id IN (:orderIds)
                ORDER BY oi.id
                """, new MapSqlParameterSource("orderIds", orderIds));
        Map<Long, List<Map<String, Object>>> grouped = new HashMap<>();
        for (Map<String, Object> item : itemRows) {
            Long orderId = ((Number) item.get("orderId")).longValue();
            grouped.computeIfAbsent(orderId, key -> new ArrayList<>()).add(item);
        }
        for (Map<String, Object> order : orders) {
            Long orderId = ((Number) order.get("id")).longValue();
            order.put("items", grouped.getOrDefault(orderId, List.of()));
        }
    }

    public List<Map<String, Object>> reviews(long bookId) {
        return jdbc.queryForList("""
                SELECT r.id, r.user_id userId, u.full_name userName, r.rating, r.comment,
                       r.status, r.created_at createdAt, r.updated_at updatedAt
                FROM reviews r JOIN users u ON u.id=r.user_id
                WHERE r.book_id=:bookId AND r.status='approved'
                ORDER BY r.created_at DESC
                """, new MapSqlParameterSource("bookId", bookId));
    }

    public Map<String, Object> myReview(long userId, long bookId) {
        List<Map<String, Object>> reviews = jdbc.queryForList("""
                SELECT r.id, r.user_id userId, r.book_id bookId, r.rating, r.comment,
                       r.status, r.created_at createdAt, r.updated_at updatedAt
                FROM reviews r
                WHERE r.user_id=:userId AND r.book_id=:bookId
                LIMIT 1
                """, new MapSqlParameterSource().addValue("userId", userId)
                .addValue("bookId", bookId));
        return reviews.isEmpty() ? null : reviews.get(0);
    }

    @Transactional
    public Map<String, Object> createReview(long userId, long bookId, CreateReviewRequest request) {
        List<Long> orderIds = jdbc.query("""
                SELECT o.id FROM orders o
                JOIN order_items oi ON oi.order_id=o.id
                WHERE o.user_id=:userId AND oi.book_id=:bookId AND o.status='delivered'
                ORDER BY o.id DESC LIMIT 1
                """, new MapSqlParameterSource().addValue("userId", userId)
                .addValue("bookId", bookId), (rs, row) -> rs.getLong(1));
        if (orderIds.isEmpty()) {
            throw new BadRequestException("Bạn chỉ có thể đánh giá sách đã mua và đã giao");
        }
        long orderId = orderIds.get(0);
        List<Map<String, Object>> existing = jdbc.queryForList("""
                SELECT id FROM reviews WHERE user_id=:userId AND book_id=:bookId
                """, new MapSqlParameterSource().addValue("userId", userId)
                .addValue("bookId", bookId));
        if (!existing.isEmpty()) {
            long reviewId = ((Number) existing.get(0).get("id")).longValue();
            jdbc.update("""
                    UPDATE reviews
                    SET order_id=:orderId, rating=:rating, comment=:comment,
                        status='pending', updated_at=NOW()
                    WHERE id=:id AND user_id=:userId
                    """, new MapSqlParameterSource().addValue("id", reviewId)
                    .addValue("userId", userId).addValue("orderId", orderId)
                    .addValue("rating", request.rating()).addValue("comment", request.comment()));
            return Map.of("id", reviewId, "rating", request.rating(),
                    "comment", request.comment(), "status", "pending");
        }
        jdbc.update("""
                INSERT INTO reviews(user_id,book_id,order_id,rating,comment,status)
                VALUES (:userId,:bookId,:orderId,:rating,:comment,'pending')
                """, new MapSqlParameterSource().addValue("userId", userId)
                .addValue("bookId", bookId).addValue("orderId", orderId)
                .addValue("rating", request.rating()).addValue("comment", request.comment()));
        Long reviewId = jdbc.getJdbcOperations().queryForObject("SELECT LAST_INSERT_ID()", Long.class);
        return Map.of("id", reviewId, "rating", request.rating(),
                "comment", request.comment(), "status", "pending");
    }

    @Transactional
    public Map<String, Object> updateReview(long userId, long reviewId, CreateReviewRequest request) {
        int updated = jdbc.update("""
                UPDATE reviews
                SET rating=:rating, comment=:comment, status='pending', updated_at=NOW()
                WHERE id=:id AND user_id=:userId
                """, new MapSqlParameterSource().addValue("id", reviewId)
                .addValue("userId", userId).addValue("rating", request.rating())
                .addValue("comment", request.comment()));
        if (updated == 0) {
            throw new ResourceNotFoundException("Không tìm thấy đánh giá");
        }
        return Map.of("id", reviewId, "rating", request.rating(),
                "comment", request.comment(), "status", "pending");
    }

    @Transactional
    public void removeReview(long userId, long reviewId) {
        int deleted = jdbc.update("DELETE FROM reviews WHERE id=:id AND user_id=:userId",
                new MapSqlParameterSource().addValue("id", reviewId).addValue("userId", userId));
        if (deleted == 0) {
            throw new ResourceNotFoundException("Không tìm thấy đánh giá");
        }
    }

    public List<Map<String, Object>> myContacts(long userId) {
        return jdbc.queryForList("""
                SELECT id, subject, message, status, created_at createdAt
                FROM contact_messages
                WHERE user_id=:userId
                ORDER BY created_at DESC, id DESC
                """, new MapSqlParameterSource("userId", userId));
    }

    public void saveContact(Long userId, ContactRequest request) {
        String phone = ContactNormalizer.normalizePhone(request.phone());
        if (phone != null && phone.isBlank()) {
            phone = null;
        }
        jdbc.update("""
                INSERT INTO contact_messages(name,email,phone,subject,message,user_id,status)
                VALUES (:name,:email,:phone,:subject,:message,:userId,'pending')
                """, new MapSqlParameterSource()
                .addValue("name", request.name().trim())
                .addValue("email", ContactNormalizer.normalizeEmail(request.email()))
                .addValue("phone", phone)
                .addValue("subject", request.subject().trim())
                .addValue("message", request.message().trim())
                .addValue("userId", userId));
    }

    private void ensureContactColumn(String columnName, String definition) {
        Boolean exists = jdbc.getJdbcOperations().execute((ConnectionCallback<Boolean>) connection -> {
            var metadata = connection.getMetaData();
            String[] tableNames = { "contact_messages", "CONTACT_MESSAGES" };
            for (String tableName : tableNames) {
                try (ResultSet columns = metadata.getColumns(connection.getCatalog(), null, tableName, null)) {
                    while (columns.next()) {
                        if ("contact_messages".equalsIgnoreCase(columns.getString("TABLE_NAME"))
                                && columnName.equalsIgnoreCase(columns.getString("COLUMN_NAME"))) {
                            return true;
                        }
                    }
                }
            }
            return false;
        });
        if (!Boolean.TRUE.equals(exists)) {
            jdbc.getJdbcOperations().execute("ALTER TABLE contact_messages ADD COLUMN " + columnName + " " + definition);
        }
    }

    private Long activeCart(long userId) {
        List<Long> ids = jdbc.query("SELECT id FROM carts WHERE user_id=:userId AND status='active' LIMIT 1",
                new MapSqlParameterSource("userId", userId), (rs, row) -> rs.getLong(1));
        if (!ids.isEmpty()) return ids.get(0);
        jdbc.update("INSERT INTO carts(user_id,status) VALUES (:userId,'active')", new MapSqlParameterSource("userId", userId));
        return jdbc.getJdbcOperations().queryForObject("SELECT LAST_INSERT_ID()", Long.class);
    }

    private Map<String, Object> activeBook(long bookId) {
        List<Map<String, Object>> books = jdbc.queryForList("""
                SELECT price, stock_quantity stock FROM books
                WHERE id=:id AND status='active'
                FOR UPDATE
                """, new MapSqlParameterSource("id", bookId));
        if (books.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy sách");
        }
        return books.get(0);
    }
}
