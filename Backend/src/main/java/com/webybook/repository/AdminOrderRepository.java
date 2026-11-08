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
        return jdbc.queryForList("""
                SELECT o.id, o.user_id, u.email, o.recipient_name, o.recipient_phone,
                       o.subtotal, o.discount_amount, o.shipping_fee, o.total_amount,
                       o.status, o.created_at, o.updated_at
                FROM orders o JOIN users u ON u.id=o.user_id
                WHERE (:status = '' OR o.status=:status)
                ORDER BY o.created_at DESC LIMIT 500
                """, new MapSqlParameterSource("status", status == null ? "" : status));
    }

    public Map<String, Object> get(long id) {
        return jdbc.queryForMap("SELECT * FROM orders WHERE id=:id", new MapSqlParameterSource("id", id));
    }

    public List<Map<String, Object>> items(long id) {
        return jdbc.queryForList("""
                SELECT oi.id, oi.book_id, b.title, oi.quantity, oi.unit_price, oi.subtotal
                FROM order_items oi JOIN books b ON b.id=oi.book_id WHERE oi.order_id=:id
                """, new MapSqlParameterSource("id", id));
    }

    public void updateStatus(long id, String oldStatus, String newStatus, String note, Long changedBy) {
        int updated = jdbc.update("UPDATE orders SET status=:newStatus WHERE id=:id AND status=:oldStatus",
                new MapSqlParameterSource().addValue("id", id).addValue("oldStatus", oldStatus)
                        .addValue("newStatus", newStatus));
        if (updated != 1) {
            throw new BadRequestException("Trạng thái đơn hàng đã thay đổi, vui lòng tải lại");
        }
        jdbc.update("""
                INSERT INTO order_status_history(order_id, old_status, new_status, changed_by, note)
                VALUES(:id, :oldStatus, :newStatus, :changedBy, :note)
                """, new MapSqlParameterSource().addValue("id", id).addValue("oldStatus", oldStatus)
                .addValue("newStatus", newStatus).addValue("changedBy", changedBy).addValue("note", note));
    }

    public List<Map<String, Object>> history(long id) {
        return jdbc.queryForList("SELECT * FROM order_status_history WHERE order_id=:id ORDER BY created_at",
                new MapSqlParameterSource("id", id));
    }
}
