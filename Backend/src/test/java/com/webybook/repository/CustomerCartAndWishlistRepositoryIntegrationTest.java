package com.webybook.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import com.webybook.exception.BadRequestException;
import com.webybook.exception.ResourceNotFoundException;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:cart_wishlist_it;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE")
@ActiveProfiles("test")
class CustomerCartAndWishlistRepositoryIntegrationTest {

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private CustomerCommerceRepository cartRepository;

    @Autowired
    private WishlistRepository wishlistRepository;

    @BeforeEach
    void setUp() {
        jdbc.execute("CREATE TABLE IF NOT EXISTS categories (id BIGINT PRIMARY KEY, name VARCHAR(120) NOT NULL)");
        jdbc.execute("CREATE TABLE IF NOT EXISTS authors (id BIGINT PRIMARY KEY, name VARCHAR(120) NOT NULL)");
        jdbc.execute("CREATE TABLE IF NOT EXISTS book_authors (book_id BIGINT NOT NULL, author_id BIGINT NOT NULL, UNIQUE(book_id, author_id))");
        jdbc.execute("CREATE TABLE IF NOT EXISTS publishers (id BIGINT PRIMARY KEY, name VARCHAR(120) NOT NULL)");
        jdbc.execute("CREATE TABLE IF NOT EXISTS books (id BIGINT PRIMARY KEY, publisher_id BIGINT NOT NULL, category_id BIGINT NOT NULL, isbn VARCHAR(64), title VARCHAR(200) NOT NULL, description VARCHAR(500), price DECIMAL(12,2) NOT NULL, original_price DECIMAL(12,2) NOT NULL, page_count INT, stock_quantity INT NOT NULL, cover_image VARCHAR(500), status VARCHAR(32) NOT NULL)");
        jdbc.execute("CREATE TABLE IF NOT EXISTS carts (id BIGINT AUTO_INCREMENT PRIMARY KEY, user_id BIGINT NOT NULL, status VARCHAR(20) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
        jdbc.execute("CREATE TABLE IF NOT EXISTS cart_items (id BIGINT AUTO_INCREMENT PRIMARY KEY, cart_id BIGINT NOT NULL, book_id BIGINT NOT NULL, quantity INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(cart_id, book_id))");
        jdbc.execute("CREATE TABLE IF NOT EXISTS reviews (id BIGINT AUTO_INCREMENT PRIMARY KEY, book_id BIGINT NOT NULL, rating INT NOT NULL, status VARCHAR(32) NOT NULL)");

        jdbc.update("DELETE FROM cart_items");
        jdbc.update("DELETE FROM carts");
        jdbc.update("DELETE FROM wishlist_items");
        jdbc.update("DELETE FROM wishlists");
        jdbc.update("DELETE FROM reviews");
        jdbc.update("DELETE FROM book_authors");
        jdbc.update("DELETE FROM books");
        jdbc.update("DELETE FROM authors");
        jdbc.update("DELETE FROM categories");
        jdbc.update("DELETE FROM publishers");
        jdbc.update("INSERT INTO categories(id, name) VALUES (1, 'Văn học')");
        jdbc.update("INSERT INTO authors(id, name) VALUES (1, 'Nguyễn Nhật Ánh')");
        jdbc.update("INSERT INTO publishers(id, name) VALUES (1, 'NXB Trẻ')");
        jdbc.update("INSERT INTO books(id, publisher_id, category_id, isbn, title, description, price, original_price, page_count, stock_quantity, cover_image, status) VALUES (1, 1, 1, 'ISBN-1', 'Tuổi thơ', 'Mô tả', 85000, 100000, 200, 2, 'cover.jpg', 'active'), (2, 1, 1, 'ISBN-2', 'Sách ngừng bán', 'Mô tả', 50000, 50000, 100, 4, '', 'inactive')");
        jdbc.update("INSERT INTO book_authors(book_id, author_id) VALUES (1, 1)");
        jdbc.update("INSERT INTO reviews(book_id, rating, status) VALUES (1, 5, 'approved')");
    }

    @Test
    void cart_addsOnlyOneLineAndUsesCurrentBookData() {
        cartRepository.addCart(7L, 1L, 1);
        Map<String, Object> result = cartRepository.addCart(7L, 1L, 1);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) result.get("items");
        assertEquals(1, items.size());
        assertEquals(2, ((Number) items.get(0).get("qty")).intValue());
        assertEquals("Nguyễn Nhật Ánh", items.get(0).get("authorNames"));
        assertEquals("Văn học", items.get(0).get("categoryName"));
        assertEquals(new BigDecimal("170000.00"), result.get("subtotal"));
        assertEquals(2, result.get("count"));
    }

    @Test
    void cart_rejectsUnavailableBooksAndQuantitiesAboveStock() {
        assertThrows(ResourceNotFoundException.class, () -> cartRepository.addCart(7L, 2L, 1));
        assertThrows(BadRequestException.class, () -> cartRepository.addCart(7L, 1L, 3));
        cartRepository.addCart(7L, 1L, 1);
        assertThrows(BadRequestException.class, () -> cartRepository.updateCart(7L, 1L, 3));
    }

    @Test
    void wishlist_isIdempotentAndRemovalIsScopedToOwner() {
        wishlistRepository.add(7L, 1L);
        wishlistRepository.add(7L, 1L);

        assertEquals(1, wishlistRepository.list(7L).size());
        assertEquals("Nguyễn Nhật Ánh", wishlistRepository.list(7L).get(0).get("authorNames"));
        assertEquals(0, wishlistRepository.list(8L).size());

        wishlistRepository.remove(8L, 1L);
        assertEquals(1, wishlistRepository.list(7L).size());
        wishlistRepository.remove(7L, 1L);
        assertEquals(0, wishlistRepository.list(7L).size());
    }
}
