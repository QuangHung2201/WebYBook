package com.webybook.repository;

import com.webybook.dto.request.AdminShippingMethodRequest;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class AdminShippingMethodRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public AdminShippingMethodRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> list(String search) {
        return jdbc.queryForList("""
                SELECT id, name, description, shipping_fee, estimated_days, status, created_at, updated_at
                FROM shipping_methods
                WHERE LOWER(name) LIKE LOWER(:search)
                ORDER BY name
                LIMIT 200
                """, new MapSqlParameterSource("search", "%" + (search == null ? "" : search.trim()) + "%"));
    }

    public Map<String, Object> get(long id) {
        return jdbc.queryForMap("SELECT * FROM shipping_methods WHERE id = :id",
                new MapSqlParameterSource("id", id));
    }

    public long create(AdminShippingMethodRequest request) {
        jdbc.update("""
                INSERT INTO shipping_methods(name, description, shipping_fee, estimated_days, status)
                VALUES(:name, :description, :shippingFee, :estimatedDays, :status)
                """, params(request));
        return jdbc.getJdbcOperations().queryForObject("SELECT LAST_INSERT_ID()", Long.class);
    }

    public void update(long id, AdminShippingMethodRequest request) {
        jdbc.update("""
                UPDATE shipping_methods
                SET name = :name, description = :description, shipping_fee = :shippingFee,
                    estimated_days = :estimatedDays, status = :status
                WHERE id = :id
                """, params(request).addValue("id", id));
    }

    public void disable(long id) {
        jdbc.update("UPDATE shipping_methods SET status = 'inactive' WHERE id = :id",
                new MapSqlParameterSource("id", id));
    }

    private MapSqlParameterSource params(AdminShippingMethodRequest request) {
        return new MapSqlParameterSource()
                .addValue("name", request.name())
                .addValue("description", request.description())
                .addValue("shippingFee", request.shippingFee())
                .addValue("estimatedDays", request.estimatedDays())
                .addValue("status", request.status() == null ? "active" : request.status());
    }
}
