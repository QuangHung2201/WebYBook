package com.webybook.repository;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.webybook.dto.response.StoreBookResponse;

/**
 * Truy vấn sách cho khu vực khách hàng. Không thay thế
 * {@link AdminCatalogRepository}: endpoint admin vẫn dùng repository cũ để bảo
 * toàn hành vi quản trị (bao gồm cả sách inactive/deleted).
 */
@Repository
public class StoreBookRepository {

    private static final String SELECT_COLUMNS = """
            b.id, MIN(ba.author_id) authorId, b.publisher_id publisherId, p.name publisherName, p.address publisherAddress,
            p.phone publisherPhone, p.email publisherEmail,
            b.category_id categoryId, c.name categoryName,
            b.isbn, b.title, b.description, b.price, b.original_price originalPrice,
            b.page_count pageCount, b.stock_quantity stockQuantity,
            b.cover_image coverImage, b.status,
            COALESCE(GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', '), '') authorNames,
            ROUND(COALESCE(AVG(r.rating), 0), 1) averageRating,
            COUNT(DISTINCT r.id) reviewCount,
            COALESCE((
                SELECT SUM(oi.quantity)
                FROM order_items oi
                JOIN orders o ON o.id = oi.order_id
                WHERE oi.book_id = b.id
                  AND o.status IN ('confirmed', 'processing', 'shipping', 'delivered')
            ), 0) sold,
            bp.table_of_contents tableOfContents,
            bp.preview_content previewContent,
            bp.preview_page_count previewPageCount,
            b.created_at createdAt
            """;

    private static final String FROM_JOINS = """
            FROM books b
            JOIN publishers p ON p.id = b.publisher_id
            JOIN categories c ON c.id = b.category_id
            LEFT JOIN book_authors ba ON ba.book_id = b.id
            LEFT JOIN authors a ON a.id = ba.author_id
            LEFT JOIN reviews r ON r.book_id = b.id AND r.status = 'approved'
            LEFT JOIN book_previews bp ON bp.book_id = b.id
            """;

    private static final String GROUP_BY = """
            GROUP BY b.id, b.publisher_id, p.name, p.address, p.phone, p.email,
                     b.category_id, c.name, b.isbn, b.title, b.description, b.price,
                     b.original_price, b.page_count, b.stock_quantity, b.cover_image, b.status,
                     bp.table_of_contents, bp.preview_content, bp.preview_page_count, b.created_at
            """;

    private static final String FILTERS = """
            WHERE (:status IS NULL OR b.status = :status)
              AND (:categoryId IS NULL OR b.category_id = :categoryId)
              AND (:publisherId IS NULL OR b.publisher_id = :publisherId)
              AND (:authorId IS NULL OR EXISTS (
                  SELECT 1 FROM book_authors baFilter
                  JOIN authors aFilter ON aFilter.id = baFilter.author_id
                  WHERE baFilter.book_id = b.id AND baFilter.author_id = :authorId))
              AND (:minPrice IS NULL OR b.price >= :minPrice)
              AND (:maxPrice IS NULL OR b.price <= :maxPrice)
              AND (:search = '' OR LOWER(b.title) LIKE LOWER(:likeSearch)
                   OR b.isbn LIKE :likeSearch
                   OR LOWER(c.name) LIKE LOWER(:likeSearch)
                   OR LOWER(p.name) LIKE LOWER(:likeSearch)
                   OR EXISTS (
                       SELECT 1 FROM book_authors baSearch
                       JOIN authors aSearch ON aSearch.id = baSearch.author_id
                       WHERE baSearch.book_id = b.id
                         AND LOWER(aSearch.name) LIKE LOWER(:likeSearch)))
            """;

    private static final String RATING_FILTER = """
            HAVING (:minRating IS NULL OR ROUND(COALESCE(AVG(r.rating), 0), 1) >= :minRating)
            """;

    private final NamedParameterJdbcTemplate jdbc;

    public StoreBookRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
        // Bảng bổ sung cho mục lục/đọc thử. Không dùng khóa ngoại để repository
        // vẫn khởi tạo an toàn trong môi trường test H2 (business tables do JPA
        // không tạo). MySQL vẫn có thể bổ sung FK trong schema.sql.
        jdbc.getJdbcOperations().execute("""
                CREATE TABLE IF NOT EXISTS book_previews (
                  book_id BIGINT NOT NULL PRIMARY KEY,
                  table_of_contents TEXT,
                  preview_content TEXT,
                  preview_page_count INT,
                  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """);
    }

    public List<StoreBookResponse> findBooks(
            String search,
            Long categoryId,
            Long authorId,
            Long publisherId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            BigDecimal minRating,
            String status,
            String sort,
            int limit,
            int offset
    ) {
        String sql = "SELECT " + SELECT_COLUMNS + FROM_JOINS + FILTERS + GROUP_BY + RATING_FILTER
                + orderBy(sort) + " LIMIT :limit OFFSET :offset";
        MapSqlParameterSource params = params(search, categoryId, authorId, publisherId,
                minPrice, maxPrice, minRating, status)
                .addValue("limit", limit)
                .addValue("offset", offset);
        return jdbc.query(sql, params, this::mapBook);
    }

    public long countBooks(
            String search,
            Long categoryId,
            Long authorId,
            Long publisherId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            BigDecimal minRating,
            String status
    ) {
        String sql = "SELECT COUNT(*) FROM (SELECT b.id " + FROM_JOINS + FILTERS + GROUP_BY
                + RATING_FILTER + ") grouped_books";
        Long count = jdbc.queryForObject(sql,
                params(search, categoryId, authorId, publisherId, minPrice, maxPrice, minRating, status),
                Long.class);
        return count == null ? 0 : count;
    }

    public Map<Long, Long> countActiveBooksByCategory() {
        return jdbc.query("""
                SELECT category_id, COUNT(*) bookCount
                FROM books
                WHERE status = 'active'
                GROUP BY category_id
                """, rs -> {
            Map<Long, Long> counts = new HashMap<>();
            while (rs.next()) {
                counts.put(rs.getLong("category_id"), rs.getLong("bookCount"));
            }
            return counts;
        });
    }

    public Optional<StoreBookResponse> findBook(long id, String status) {
        String sql = "SELECT " + SELECT_COLUMNS + FROM_JOINS
                + " WHERE b.id = :id AND (:status IS NULL OR b.status = :status) " + GROUP_BY;
        List<StoreBookResponse> books = jdbc.query(sql,
                new MapSqlParameterSource().addValue("id", id).addValue("status", normalizeStatus(status)),
                this::mapBook);
        return books.stream().findFirst();
    }

    private MapSqlParameterSource params(
            String search,
            Long categoryId,
            Long authorId,
            Long publisherId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            BigDecimal minRating,
            String status
    ) {
        String normalized = search == null ? "" : search.trim();
        return new MapSqlParameterSource()
                .addValue("search", normalized)
                .addValue("likeSearch", "%" + normalized + "%")
                .addValue("categoryId", categoryId)
                .addValue("authorId", authorId)
                .addValue("publisherId", publisherId)
                .addValue("minPrice", minPrice)
                .addValue("maxPrice", maxPrice)
                .addValue("minRating", minRating)
                .addValue("status", normalizeStatus(status));
    }

    private static String normalizeStatus(String status) {
        return status == null || status.isBlank() ? null : status.trim().toLowerCase();
    }

    private static String orderBy(String sort) {
        return switch (sort == null ? "" : sort.trim().toLowerCase()) {
            case "bestseller" -> " ORDER BY sold DESC, b.created_at DESC, b.id DESC";
            case "price-asc" -> " ORDER BY b.price ASC, b.id DESC";
            case "price-desc" -> " ORDER BY b.price DESC, b.id DESC";
            case "rating" -> " ORDER BY averageRating DESC, reviewCount DESC, b.created_at DESC";
            default -> " ORDER BY b.created_at DESC, b.id DESC";
        };
    }

    private StoreBookResponse mapBook(ResultSet rs, int row) throws SQLException {
        BigDecimal averageRating = rs.getBigDecimal("averageRating");
        Object authorIdObj = rs.getObject("authorId");
        Long authorId = authorIdObj == null ? null : ((Number) authorIdObj).longValue();
        Object pageCountObj = rs.getObject("pageCount");
        Integer pageCount = pageCountObj == null ? null : ((Number) pageCountObj).intValue();
        Object previewPageCountObj = rs.getObject("previewPageCount");
        Integer previewPageCount = previewPageCountObj == null ? null : ((Number) previewPageCountObj).intValue();

        return new StoreBookResponse(
                rs.getLong("id"),
                authorId,
                rs.getLong("publisherId"),
                rs.getString("publisherName"),
                rs.getString("publisherAddress"),
                rs.getString("publisherPhone"),
                rs.getString("publisherEmail"),
                rs.getLong("categoryId"),
                rs.getString("categoryName"),
                rs.getString("isbn"),
                rs.getString("title"),
                rs.getString("description"),
                rs.getBigDecimal("price"),
                rs.getBigDecimal("originalPrice"),
                pageCount,
                rs.getInt("stockQuantity"),
                rs.getString("coverImage"),
                rs.getString("status"),
                splitAuthors(rs.getString("authorNames")),
                averageRating == null ? BigDecimal.ZERO : averageRating,
                rs.getLong("reviewCount"),
                rs.getLong("sold"),
                rs.getString("tableOfContents"),
                rs.getString("previewContent"),
                previewPageCount,
                rs.getTimestamp("createdAt") == null ? null : rs.getTimestamp("createdAt").toLocalDateTime()
        );
    }

    private static List<String> splitAuthors(String authors) {
        if (authors == null || authors.isBlank()) {
            return List.of();
        }
        return Arrays.stream(authors.split(", "))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .collect(Collectors.toList());
    }
}
