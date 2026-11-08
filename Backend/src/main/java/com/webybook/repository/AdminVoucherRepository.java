package com.webybook.repository;

import com.webybook.dto.request.AdminVoucherRequest;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class AdminVoucherRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public AdminVoucherRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> list(String search, String status) {
        return jdbc.queryForList("""
                SELECT * FROM vouchers
                WHERE (:search='' OR LOWER(code) LIKE LOWER(:likeSearch))
                  AND (:status='' OR status=:status)
                ORDER BY created_at DESC LIMIT 500
                """, new MapSqlParameterSource().addValue("search", search == null ? "" : search.trim())
                .addValue("likeSearch", "%" + (search == null ? "" : search.trim()) + "%")
                .addValue("status", status == null ? "" : status));
    }

    public Map<String, Object> get(long id) {
        return jdbc.queryForMap("SELECT * FROM vouchers WHERE id=:id", new MapSqlParameterSource("id", id));
    }

    public long insert(AdminVoucherRequest r) {
        jdbc.update("""
                INSERT INTO vouchers(code, name, description, discount_type, discount_value, minimum_order_amount,
                    maximum_discount, usage_limit, start_date, end_date, status)
                VALUES(:code, :name, :description, :discountType, :discountValue, :minimumOrderAmount,
                    :maximumDiscount, :usageLimit, :startDate, :endDate, :status)
                """, params(r));
        return jdbc.getJdbcOperations().queryForObject("SELECT LAST_INSERT_ID()", Long.class);
    }

    public void update(long id, AdminVoucherRequest r) {
        jdbc.update("""
                UPDATE vouchers SET code=:code, name=:name, description=:description,
                    discount_type=:discountType, discount_value=:discountValue,
                    minimum_order_amount=:minimumOrderAmount, maximum_discount=:maximumDiscount,
                    usage_limit=:usageLimit, start_date=:startDate, end_date=:endDate, status=:status
                WHERE id=:id
                """, params(r).addValue("id", id));
    }

    public void disable(long id) {
        jdbc.update("UPDATE vouchers SET status='inactive' WHERE id=:id",
                new MapSqlParameterSource("id", id));
    }

    private MapSqlParameterSource params(AdminVoucherRequest r) {
        return new MapSqlParameterSource().addValue("code", r.code().trim().toUpperCase())
                .addValue("name", r.name().trim())
                .addValue("description", r.description() == null ? "" : r.description().trim())
                .addValue("discountType", r.discountType().toLowerCase())
                .addValue("discountValue", r.discountValue())
                .addValue("minimumOrderAmount", r.minimumOrderAmount())
                .addValue("maximumDiscount", r.maximumDiscount()).addValue("usageLimit", r.usageLimit())
                .addValue("startDate", r.startDate()).addValue("endDate", r.endDate())
                .addValue("status", r.status().toLowerCase());
    }
}
