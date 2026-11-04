package com.webybook.repository;

import com.webybook.dto.request.AdminBookRequest;
import com.webybook.dto.response.AdminBookResponse;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class AdminCatalogRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public AdminCatalogRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<AdminBookResponse> findBooks(String search, Long categoryId, int limit, int offset) {
        String sql = """
                SELECT b.id, b.publisher_id, p.name publisher_name, b.category_id, c.name category_name,
                       b.isbn, b.title, b.description, b.price, b.original_price, b.page_count,
                       b.stock_quantity, b.cover_image, b.status,
                       COALESCE(GROUP_CONCAT(a.name ORDER BY a.name SEPARATOR ', '), '') authors
                FROM books b
                JOIN publishers p ON p.id = b.publisher_id
                JOIN categories c ON c.id = b.category_id
                LEFT JOIN book_authors ba ON ba.book_id = b.id
                LEFT JOIN authors a ON a.id = ba.author_id
                WHERE (:search = '' OR LOWER(b.title) LIKE LOWER(:likeSearch) OR b.isbn LIKE :likeSearch)
                  AND (:categoryId IS NULL OR b.category_id = :categoryId)
                GROUP BY b.id, b.publisher_id, p.name, b.category_id, c.name, b.isbn, b.title,
                         b.description, b.price, b.original_price, b.page_count, b.stock_quantity,
                         b.cover_image, b.status
                ORDER BY b.created_at DESC
                LIMIT :limit OFFSET :offset
                """;
        MapSqlParameterSource params = baseBookParams(search, categoryId)
                .addValue("limit", limit).addValue("offset", offset);
        return jdbc.query(sql, params, (rs, row) -> new AdminBookResponse(
                rs.getLong("id"), rs.getLong("publisher_id"), rs.getString("publisher_name"),
                rs.getLong("category_id"), rs.getString("category_name"), rs.getString("isbn"),
                rs.getString("title"), rs.getString("description"), rs.getBigDecimal("price"),
                rs.getBigDecimal("original_price"), (Integer) rs.getObject("page_count"),
                rs.getInt("stock_quantity"), rs.getString("cover_image"), rs.getString("status"),
                splitAuthors(rs.getString("authors"))));
    }

    public long countBooks(String search, Long categoryId) {
        return jdbc.queryForObject("""
                SELECT COUNT(*) FROM books
                WHERE (:search = '' OR LOWER(title) LIKE LOWER(:likeSearch) OR isbn LIKE :likeSearch)
                  AND (:categoryId IS NULL OR category_id = :categoryId)
                """, baseBookParams(search, categoryId), Long.class);
    }

    public Optional<AdminBookResponse> findBook(long id) {
        return findBooksById(id).stream().findFirst();
    }

    private List<AdminBookResponse> findBooksById(long id) {
        String sql = """
                SELECT b.id, b.publisher_id, p.name publisher_name, b.category_id, c.name category_name,
                       b.isbn, b.title, b.description, b.price, b.original_price, b.page_count,
                       b.stock_quantity, b.cover_image, b.status,
                       COALESCE(GROUP_CONCAT(a.name ORDER BY a.name SEPARATOR ', '), '') authors
                FROM books b JOIN publishers p ON p.id=b.publisher_id JOIN categories c ON c.id=b.category_id
                LEFT JOIN book_authors ba ON ba.book_id=b.id LEFT JOIN authors a ON a.id=ba.author_id
                WHERE b.id=:id
                GROUP BY b.id, b.publisher_id, p.name, b.category_id, c.name, b.isbn, b.title,
                         b.description, b.price, b.original_price, b.page_count, b.stock_quantity,
                         b.cover_image, b.status
                """;
        return jdbc.query(sql, new MapSqlParameterSource("id", id), (rs, row) -> new AdminBookResponse(
                rs.getLong("id"), rs.getLong("publisher_id"), rs.getString("publisher_name"),
                rs.getLong("category_id"), rs.getString("category_name"), rs.getString("isbn"),
                rs.getString("title"), rs.getString("description"), rs.getBigDecimal("price"),
                rs.getBigDecimal("original_price"), (Integer) rs.getObject("page_count"),
                rs.getInt("stock_quantity"), rs.getString("cover_image"), rs.getString("status"),
                splitAuthors(rs.getString("authors"))));
    }

    public long insertBook(AdminBookRequest request) {
        jdbc.update("""
                INSERT INTO books (publisher_id, category_id, isbn, title, description, price,
                    original_price, page_count, stock_quantity, cover_image, status)
                VALUES (:publisherId, :categoryId, :isbn, :title, :description, :price,
                    :originalPrice, :pageCount, :stockQuantity, :coverImage, :status)
                """, bookParams(request));
        return jdbc.getJdbcOperations().queryForObject("SELECT LAST_INSERT_ID()", Long.class);
    }

    public void updateBook(long id, AdminBookRequest request) {
        jdbc.update("""
                UPDATE books SET publisher_id=:publisherId, category_id=:categoryId, isbn=:isbn,
                    title=:title, description=:description, price=:price, original_price=:originalPrice,
                    page_count=:pageCount, stock_quantity=:stockQuantity, cover_image=:coverImage,
                    status=:status WHERE id=:id
                """, bookParams(request).addValue("id", id));
    }

    public void replaceAuthors(long bookId, List<Long> authorIds) {
        jdbc.update("DELETE FROM book_authors WHERE book_id=:bookId",
                new MapSqlParameterSource("bookId", bookId));
        if (authorIds != null && !authorIds.isEmpty()) {
            jdbc.batchUpdate("INSERT INTO book_authors(book_id, author_id) VALUES (:bookId, :authorId)",
                    authorIds.stream().distinct().map(authorId -> new MapSqlParameterSource()
                            .addValue("bookId", bookId).addValue("authorId", authorId)).toArray(MapSqlParameterSource[]::new));
        }
    }

    public void softDeleteBook(long id) {
        jdbc.update("UPDATE books SET status='deleted' WHERE id=:id", new MapSqlParameterSource("id", id));
    }

    private MapSqlParameterSource bookParams(AdminBookRequest r) {
        return new MapSqlParameterSource()
                .addValue("publisherId", r.publisherId()).addValue("categoryId", r.categoryId())
                .addValue("isbn", r.isbn()).addValue("title", r.title()).addValue("description", r.description())
                .addValue("price", r.price()).addValue("originalPrice", r.originalPrice())
                .addValue("pageCount", r.pageCount()).addValue("stockQuantity", r.stockQuantity())
                .addValue("coverImage", r.coverImage()).addValue("status", r.status());
    }

    private MapSqlParameterSource baseBookParams(String search, Long categoryId) {
        String normalized = search == null ? "" : search.trim();
        return new MapSqlParameterSource().addValue("search", normalized)
                .addValue("likeSearch", "%" + normalized + "%").addValue("categoryId", categoryId);
    }

    private static List<String> splitAuthors(String authors) {
        return authors == null || authors.isBlank() ? List.of() :
                Arrays.stream(authors.split(", ")).collect(Collectors.toList());
    }
}
