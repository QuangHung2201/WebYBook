package com.webybook.repository;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class AdminReferenceRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public AdminReferenceRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> list(String resource, String search) {
        String table = table(resource);
        String columns = switch (resource) {
            case "categories" -> "id, name, description, created_at, updated_at";
            case "authors" -> "id, name, biography, created_at, updated_at";
            case "publishers" -> "id, name, address, phone, email, created_at, updated_at";
            default -> throw new IllegalArgumentException("Tài nguyên không hợp lệ");
        };
        return jdbc.queryForList("SELECT " + columns + " FROM " + table
                        + " WHERE LOWER(name) LIKE LOWER(:search) ORDER BY name LIMIT 200",
                new MapSqlParameterSource("search", "%" + (search == null ? "" : search.trim()) + "%"));
    }

    public Map<String, Object> get(String resource, long id) {
        return jdbc.queryForMap("SELECT * FROM " + table(resource) + " WHERE id=:id",
                new MapSqlParameterSource("id", id));
    }

    public long create(String resource, MapSqlParameterSource params) {
        String sql = switch (resource) {
            case "categories" -> "INSERT INTO categories(name, description) VALUES(:name, :description)";
            case "authors" -> "INSERT INTO authors(name, biography) VALUES(:name, :biography)";
            case "publishers" -> "INSERT INTO publishers(name, address, phone, email) VALUES(:name, :address, :phone, :email)";
            default -> throw new IllegalArgumentException("Tài nguyên không hợp lệ");
        };
        jdbc.update(sql, params);
        return jdbc.getJdbcOperations().queryForObject("SELECT LAST_INSERT_ID()", Long.class);
    }

    public void update(String resource, long id, MapSqlParameterSource params) {
        String sql = switch (resource) {
            case "categories" -> "UPDATE categories SET name=:name, description=:description WHERE id=:id";
            case "authors" -> "UPDATE authors SET name=:name, biography=:biography WHERE id=:id";
            case "publishers" -> "UPDATE publishers SET name=:name, address=:address, phone=:phone, email=:email WHERE id=:id";
            default -> throw new IllegalArgumentException("Tài nguyên không hợp lệ");
        };
        jdbc.update(sql, params.addValue("id", id));
    }

    public void delete(String resource, long id) {
        jdbc.update("DELETE FROM " + table(resource) + " WHERE id=:id", new MapSqlParameterSource("id", id));
    }

    private String table(String resource) {
        return switch (resource) {
            case "categories", "authors", "publishers" -> resource;
            default -> throw new IllegalArgumentException("Tài nguyên không hợp lệ");
        };
    }
}
