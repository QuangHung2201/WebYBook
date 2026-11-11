package com.webybook.repository;

import com.webybook.exception.BadRequestException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class AdminOrderRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public AdminOrderRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> list(String status) {
        ensureOrderPaymentColumns();
        return jdbc.queryForList("""
                SELECT o.id, o.user_id, u.email, o.recipient_name, o.recipient_phone,
                       o.subtotal, o.discount_amount, o.shipping_fee, o.total_amount,
                       o.order_status status, o.order_status orderStatus, o.payment_status paymentStatus,
                       (SELECT p.payment_method FROM payments p WHERE p.order_id=o.id ORDER BY p.id DESC LIMIT 1) paymentMethod,
                       o.created_at, o.updated_at
                FROM orders o JOIN users u ON u.id=o.user_id
                WHERE (:status = '' OR o.order_status=:status)
                ORDER BY o.created_at DESC LIMIT 500
                """, new MapSqlParameterSource("status", status == null ? "" : status));
    }

    public Map<String, Object> get(long id) {
        ensureOrderPaymentColumns();
        Map<String, Object> order = jdbc.queryForMap("""
                SELECT o.*, o.order_status status, o.order_status orderStatus, o.payment_status paymentStatus,
                       (SELECT p.payment_method FROM payments p WHERE p.order_id=o.id ORDER BY p.id DESC LIMIT 1) paymentMethod
                FROM orders o WHERE o.id=:id
                """, new MapSqlParameterSource("id", id));
        order.put("payment", jdbc.queryForMap("""
                SELECT payment_method paymentMethod, payment_status paymentStatus, amount, paid_at paidAt
                FROM payments WHERE order_id=:id ORDER BY id DESC LIMIT 1
                """, new MapSqlParameterSource("id", id)));
        return order;
    }

    public List<Map<String, Object>> items(long id) {
        return jdbc.queryForList("""
                SELECT oi.id, oi.book_id, b.title, oi.quantity, oi.unit_price, oi.subtotal
                FROM order_items oi JOIN books b ON b.id=oi.book_id WHERE oi.order_id=:id
                """, new MapSqlParameterSource("id", id));
    }

    private void ensureOrderPaymentColumns() {
        ensureColumn("orders", "order_status", "VARCHAR(20) NOT NULL DEFAULT 'pending'");
        ensureColumn("orders", "payment_status", "VARCHAR(20) NOT NULL DEFAULT 'unpaid'");
    }

    private void ensureColumn(String table, String column, String definition) {
        Integer count = jdbc.queryForObject("""
                SELECT COUNT(*) FROM information_schema.columns
                WHERE UPPER(table_name)=UPPER(:tableName) AND UPPER(column_name)=UPPER(:columnName)
                """, new MapSqlParameterSource().addValue("tableName", table).addValue("columnName", column), Integer.class);
        if (count != null && count == 0) {
            jdbc.getJdbcOperations().execute("ALTER TABLE " + table + " ADD COLUMN " + column + " " + definition);
        }
    }

    public void updateStatus(long id, String oldStatus, String newStatus, String note, Long changedBy) {
        int updated = jdbc.update("""
                UPDATE orders SET status=:newStatus, order_status=:newStatus
                WHERE id=:id AND order_status=:oldStatus
                """,
                new MapSqlParameterSource().addValue("id", id).addValue("oldStatus", oldStatus)
                        .addValue("newStatus", newStatus));
        if (updated != 1) {
            throw new BadRequestException("Trạng thái đơn hàng đã thay đổi, vui lòng tải lại");
        }

        if ("rejected".equals(newStatus)) {
            restoreStock(id);
        }

        jdbc.update("""
                INSERT INTO order_status_history(order_id, old_status, new_status, changed_by, note)
                VALUES(:id, :oldStatus, :newStatus, :changedBy, :note)
                """, new MapSqlParameterSource().addValue("id", id).addValue("oldStatus", oldStatus)
                .addValue("newStatus", newStatus).addValue("changedBy", changedBy).addValue("note", note));
    }

    private void restoreStock(long orderId) {
        List<Map<String, Object>> items = jdbc.queryForList("""
                SELECT book_id bookId, quantity
                FROM order_items
                WHERE order_id=:orderId
                """, new MapSqlParameterSource("orderId", orderId));
        for (Map<String, Object> item : items) {
            jdbc.update("""
                    UPDATE books SET stock_quantity=stock_quantity+:quantity
                    WHERE id=:bookId
                    """, new MapSqlParameterSource()
                    .addValue("quantity", item.get("quantity"))
                    .addValue("bookId", item.get("bookId")));
        }
    }

    public Map<String, Object> confirmCodPayment(long id) {
        int updated = jdbc.update("""
                UPDATE payments p JOIN orders o ON o.id=p.order_id
                SET p.payment_status='paid', p.paid_at=NOW(),
                    o.payment_status='paid'
                WHERE o.id=:id AND o.order_status='delivered'
                  AND p.payment_method='COD' AND p.payment_status='pending'
                """, new MapSqlParameterSource("id", id));
        if (updated != 2) {
            throw new BadRequestException("Chỉ có thể xác nhận thu tiền COD sau khi đơn đã được duyệt");
        }
        return get(id);
    }

    public List<Map<String, Object>> history(long id) {
        return jdbc.queryForList("SELECT * FROM order_status_history WHERE order_id=:id ORDER BY created_at",
                new MapSqlParameterSource("id", id));
    }
}
