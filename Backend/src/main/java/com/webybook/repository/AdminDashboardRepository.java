package com.webybook.repository;

import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class AdminDashboardRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public AdminDashboardRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Map<String, Object> summary() {
        return jdbc.queryForMap("""
                SELECT
                  (SELECT COUNT(*) FROM books WHERE status <> 'deleted') total_books,
                  (SELECT COUNT(*) FROM orders) total_orders,
                  (SELECT COUNT(*) FROM users) total_users,
                  (SELECT COUNT(*) FROM users WHERE status = 'ACTIVE') active_users,
                  (SELECT COALESCE(SUM(total_amount), 0) FROM orders
                   WHERE status NOT IN ('cancelled', 'canceled')) total_revenue,
                  (SELECT COUNT(*) FROM orders WHERE status = 'pending') pending_orders,
                  (SELECT COUNT(*) FROM books WHERE status <> 'deleted' AND stock_quantity <= 5) low_stock_books
                """, Map.of());
    }

    public List<Map<String, Object>> ordersByStatus() {
        return jdbc.queryForList("SELECT status, COUNT(*) total FROM orders GROUP BY status ORDER BY status", Map.of());
    }

    public List<Map<String, Object>> topBooks() {
        return jdbc.queryForList("""
                SELECT b.id, b.title, SUM(oi.quantity) quantity_sold
                FROM order_items oi JOIN books b ON b.id=oi.book_id
                JOIN orders o ON o.id=oi.order_id
                WHERE o.status NOT IN ('cancelled', 'canceled')
                GROUP BY b.id, b.title ORDER BY quantity_sold DESC LIMIT 10
                """, Map.of());
    }

    public List<Map<String, Object>> lowStock() {
        return jdbc.queryForList("""
                SELECT id, title, stock_quantity, status FROM books
                WHERE status <> 'deleted' AND stock_quantity <= 5
                ORDER BY stock_quantity ASC, title LIMIT 100
                """, Map.of());
    }

    public List<Map<String, Object>> revenueByDay(LocalDate from, LocalDate to) {
        return jdbc.queryForList(revenueQuery("""
                SELECT DATE(created_at) revenue_date, COALESCE(SUM(total_amount), 0) revenue,
                       COUNT(*) order_count
                FROM orders
                WHERE status NOT IN ('cancelled', 'canceled')
                GROUP BY DATE(created_at)
                ORDER BY revenue_date
                """, from, to), dateParams(from, to));
    }

    public List<Map<String, Object>> revenueByWeek(LocalDate from, LocalDate to) {
        return jdbc.queryForList(revenueQuery("""
                SELECT DATE_SUB(DATE(created_at), INTERVAL WEEKDAY(created_at) DAY) week_start,
                       COALESCE(SUM(total_amount), 0) revenue,
                       COUNT(*) order_count
                FROM orders
                WHERE status NOT IN ('cancelled', 'canceled')
                GROUP BY DATE_SUB(DATE(created_at), INTERVAL WEEKDAY(created_at) DAY)
                ORDER BY week_start
                """, from, to), dateParams(from, to));
    }

    private String revenueQuery(String query, LocalDate from, LocalDate to) {
        return query.replace(
                "GROUP BY",
                (from == null ? "" : " AND created_at >= :fromDate") +
                        (to == null ? "" : " AND created_at < DATE_ADD(:toDate, INTERVAL 1 DAY)") +
                        " GROUP BY"
        );
    }

    private Map<String, Object> dateParams(LocalDate from, LocalDate to) {
        Map<String, Object> params = new HashMap<>();
        if (from != null) {
            params.put("fromDate", Date.valueOf(from));
        }
        if (to != null) {
            params.put("toDate", Date.valueOf(to));
        }
        return params;
    }
}
