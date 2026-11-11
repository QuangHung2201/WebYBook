package com.webybook.repository;

import java.util.List;
import java.util.Map;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.webybook.exception.ResourceNotFoundException;
import com.webybook.exception.BadRequestException;

/**
 * Danh sách sách yêu thích của khách hàng. Dùng lại hai bảng wishlists /
 * wishlist_items đã có trong schema, không thay đổi cấu trúc nghiệp vụ hiện
 * tại. Các bảng được tạo ở chế độ IF NOT EXISTS (không FK) để môi trường H2
 * vẫn khởi động được nếu bảng chưa tồn tại.
 */
@Repository
public class WishlistRepository {

    private static final String DEFAULT_WISHLIST_NAME = "Sản phẩm yêu thích";

    private final NamedParameterJdbcTemplate jdbc;

    public WishlistRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
        jdbc.getJdbcOperations().execute("""
                CREATE TABLE IF NOT EXISTS wishlists (
                  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                  user_id BIGINT NOT NULL,
                  name VARCHAR(150) NOT NULL,
                  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  UNIQUE (user_id, name)
                )
                """);
        jdbc.getJdbcOperations().execute("""
                CREATE TABLE IF NOT EXISTS wishlist_items (
                  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                  wishlist_id BIGINT NOT NULL,
                  book_id BIGINT NOT NULL,
                  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  UNIQUE (wishlist_id, book_id)
                )
                """);
    }

    public List<Map<String, Object>> list(long userId) {
        return jdbc.queryForList("""
                SELECT b.id, b.publisher_id publisherId, p.name publisherName,
                       b.category_id categoryId, c.name categoryName, b.isbn, b.title,
                       b.description, b.price, b.original_price originalPrice,
                       b.page_count pageCount, b.stock_quantity stockQuantity,
                       b.cover_image coverImage, b.status,
                       COALESCE(GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', '), '') authorNames,
                       ROUND(COALESCE((
                           SELECT AVG(r.rating) FROM reviews r
                           WHERE r.book_id = b.id AND r.status = 'approved'
                       ), 0), 1) averageRating,
                       (SELECT COUNT(*) FROM reviews r
                        WHERE r.book_id = b.id AND r.status = 'approved') reviewCount,
                       wi.created_at addedAt
                FROM wishlists w
                JOIN wishlist_items wi ON wi.wishlist_id = w.id
                JOIN books b ON b.id = wi.book_id
                JOIN publishers p ON p.id = b.publisher_id
                JOIN categories c ON c.id = b.category_id
                LEFT JOIN book_authors ba ON ba.book_id = b.id
                LEFT JOIN authors a ON a.id = ba.author_id
                WHERE w.user_id = :userId
                GROUP BY b.id, b.publisher_id, p.name, b.category_id, c.name, b.isbn, b.title,
                         b.description, b.price, b.original_price, b.page_count,
                         b.stock_quantity, b.cover_image, b.status, wi.id, wi.created_at
                ORDER BY wi.created_at DESC, wi.id DESC
                """, new MapSqlParameterSource("userId", userId));
    }

    @Transactional
    public void add(long userId, long bookId) {
        if (userId <= 0 || bookId <= 0) {
            throw new BadRequestException("ID người dùng hoặc sách không hợp lệ");
        }
        ensureActiveBook(bookId);
        Long wishlistId = wishlistId(userId);
        Integer existing = jdbc.queryForObject("""
                SELECT COUNT(*) FROM wishlist_items
                WHERE wishlist_id = :wishlistId AND book_id = :bookId
                """, new MapSqlParameterSource().addValue("wishlistId", wishlistId)
                .addValue("bookId", bookId), Integer.class);
        if (existing != null && existing > 0) {
            return;
        }
        try {
            jdbc.update("""
                    INSERT INTO wishlist_items(wishlist_id, book_id)
                    VALUES (:wishlistId, :bookId)
                    """, new MapSqlParameterSource().addValue("wishlistId", wishlistId)
                    .addValue("bookId", bookId));
        } catch (DuplicateKeyException ignored) {
            // The unique key makes concurrent duplicate additions idempotent.
        }
    }

    @Transactional
    public void remove(long userId, long bookId) {
        jdbc.update("""
                DELETE FROM wishlist_items
                WHERE book_id = :bookId
                  AND wishlist_id IN (SELECT id FROM wishlists WHERE user_id = :userId)
                """, new MapSqlParameterSource().addValue("userId", userId)
                .addValue("bookId", bookId));
    }

    private Long wishlistId(long userId) {
        List<Long> ids = jdbc.query("""
                SELECT id FROM wishlists WHERE user_id = :userId ORDER BY id LIMIT 1
                """, new MapSqlParameterSource("userId", userId), (rs, row) -> rs.getLong(1));
        if (!ids.isEmpty()) {
            return ids.get(0);
        }
        try {
            jdbc.update("""
                    INSERT INTO wishlists(user_id, name) VALUES (:userId, :name)
                    """, new MapSqlParameterSource().addValue("userId", userId)
                    .addValue("name", DEFAULT_WISHLIST_NAME));
        } catch (DuplicateKeyException ignored) {
            // Một request đồng thời vừa tạo wishlist mặc định.
        }
        return jdbc.queryForObject("""
                SELECT id FROM wishlists WHERE user_id = :userId ORDER BY id LIMIT 1
                """, new MapSqlParameterSource("userId", userId), Long.class);
    }

    private void ensureActiveBook(long bookId) {
        Integer count = jdbc.queryForObject("""
                SELECT COUNT(*) FROM books WHERE id = :id AND status = 'active'
                """, new MapSqlParameterSource("id", bookId), Integer.class);
        if (count == null || count == 0) {
            throw new ResourceNotFoundException("Không tìm thấy sách");
        }
    }
}
