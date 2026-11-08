package com.webybook.repository;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class AdminReviewRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public AdminReviewRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> list(String status, String search) {
        return jdbc.queryForList("""
                SELECT r.id, r.user_id, u.full_name, r.book_id, b.title,
                       r.order_id, r.rating, r.comment, r.status, r.created_at, r.updated_at
                FROM reviews r
                JOIN users u ON u.id = r.user_id
                JOIN books b ON b.id = r.book_id
                WHERE (:status = '' OR r.status = :status)
                  AND (:search = '' OR LOWER(b.title) LIKE LOWER(:searchLike)
                       OR LOWER(u.full_name) LIKE LOWER(:searchLike)
                       OR LOWER(COALESCE(r.comment, '')) LIKE LOWER(:searchLike))
                ORDER BY r.created_at DESC
                LIMIT 200
                """, new MapSqlParameterSource()
                .addValue("status", status == null ? "" : status.trim())
                .addValue("search", search == null ? "" : search.trim())
                .addValue("searchLike", "%" + (search == null ? "" : search.trim()) + "%"));
    }

    public Map<String, Object> get(long id) {
        return jdbc.queryForMap("""
                SELECT r.id, r.user_id, u.full_name, r.book_id, b.title,
                       r.order_id, r.rating, r.comment, r.status, r.created_at, r.updated_at
                FROM reviews r
                JOIN users u ON u.id = r.user_id
                JOIN books b ON b.id = r.book_id
                WHERE r.id = :id
                """, new MapSqlParameterSource("id", id));
    }

    public void updateStatus(long id, String status) {
        jdbc.update("UPDATE reviews SET status = :status WHERE id = :id",
                new MapSqlParameterSource().addValue("id", id).addValue("status", status));
    }

    public void delete(long id) {
        jdbc.update("DELETE FROM reviews WHERE id = :id", new MapSqlParameterSource("id", id));
    }
}
