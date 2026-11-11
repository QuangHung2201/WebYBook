package com.webybook.repository;

import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class StoreBookRepositoryIntegrationTest {

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private StoreBookRepository repository;

    @BeforeEach
    void setUp() {
        jdbc.execute("CREATE TABLE IF NOT EXISTS books (id BIGINT PRIMARY KEY, category_id BIGINT NOT NULL, status VARCHAR(32) NOT NULL)");
        jdbc.update("DELETE FROM books");
        jdbc.update("INSERT INTO books(id, category_id, status) VALUES (1, 10, 'active'), (2, 10, 'inactive'), (3, 20, 'active')");
    }

    @Test
    void countActiveBooksByCategory_excludesUnavailableBooks() {
        assertEquals(Map.of(10L, 1L, 20L, 1L), repository.countActiveBooksByCategory());
    }
}
