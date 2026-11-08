package com.webybook.repository;

import com.webybook.dto.request.AdminUserUpdateRequest;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class AdminUserRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public AdminUserRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> list(String search) {
        return jdbc.queryForList("""
                SELECT u.id, u.full_name, u.email, u.phone, u.status, u.created_at, u.updated_at,
                       r.id role_id, r.name role
                FROM users u JOIN roles r ON r.id=u.role_id
                WHERE LOWER(u.full_name) LIKE LOWER(:search)
                   OR LOWER(u.email) LIKE LOWER(:search)
                   OR COALESCE(u.phone, '') LIKE :search
                ORDER BY u.created_at DESC LIMIT 500
                """, new MapSqlParameterSource("search", "%" + (search == null ? "" : search.trim()) + "%"));
    }

    public Map<String, Object> get(long id) {
        return jdbc.queryForMap("""
                SELECT u.id, u.full_name, u.email, u.phone, u.status, u.created_at, u.updated_at,
                       r.id role_id, r.name role
                FROM users u JOIN roles r ON r.id=u.role_id WHERE u.id=:id
                """, new MapSqlParameterSource("id", id));
    }

    public void update(long id, AdminUserUpdateRequest request) {
        jdbc.update("""
                UPDATE users u JOIN roles r ON r.name=:role
                SET u.full_name=:fullName, u.phone=:phone, u.role_id=r.id, u.status=:status WHERE u.id=:id
                """, new MapSqlParameterSource()
                .addValue("id", id).addValue("fullName", request.fullName())
                .addValue("phone", request.phone()).addValue("role", request.role().name())
                .addValue("status", request.status().name()));
    }

}
