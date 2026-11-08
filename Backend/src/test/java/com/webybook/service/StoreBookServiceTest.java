package com.webybook.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.webybook.dto.response.PageResponse;
import com.webybook.dto.response.StoreBookResponse;
import com.webybook.exception.BadRequestException;
import com.webybook.exception.ResourceNotFoundException;
import com.webybook.repository.StoreBookRepository;

@ExtendWith(MockitoExtension.class)
class StoreBookServiceTest {

    @Mock
    private StoreBookRepository repository;

    private StoreBookService service;

    @BeforeEach
    void setUp() {
        service = new StoreBookService(repository);
    }

    private StoreBookResponse sampleBook(long id, String title, BigDecimal price) {
        return new StoreBookResponse(
                id, 1L, 1L, "NXB Trẻ", "Địa chỉ NXB", "0123456789", "nxb@test.vn",
                1L, "Văn học", "ISBN-123456", title, "Mô tả sách",
                price, price.add(BigDecimal.valueOf(20000)), 200, 15, "cover.jpg", "active",
                List.of("Nguyễn Nhật Ánh"), BigDecimal.valueOf(4.5), 10L, 50L,
                "Chương 1", "Đọc thử", 5, LocalDateTime.now()
        );
    }

    @Test
    void listBooks_success_returnsPagedBooks() {
        StoreBookResponse book = sampleBook(1L, "Cho tôi xin một vé đi tuổi thơ", BigDecimal.valueOf(80000));
        when(repository.countBooks(eq("tuổi thơ"), eq(1L), eq(2L), eq(3L), any(), any(), any(), eq("active")))
                .thenReturn(1L);
        when(repository.findBooks(eq("tuổi thơ"), eq(1L), eq(2L), eq(3L), any(), any(), any(), eq("active"), eq("newest"), eq(12), eq(0)))
                .thenReturn(List.of(book));

        PageResponse<StoreBookResponse> result = service.listBooks(
                "  tuổi thơ  ", 1L, 2L, 3L,
                BigDecimal.valueOf(50000), BigDecimal.valueOf(100000),
                BigDecimal.valueOf(4.0), "active", "newest", 1, 12);

        assertNotNull(result);
        assertEquals(1, result.items().size());
        assertEquals("Cho tôi xin một vé đi tuổi thơ", result.items().get(0).title());
        assertEquals(1L, result.total());
    }

    @Test
    void listBooks_pageBeyondLastPage_clampsToLastPage() {
        StoreBookResponse book = sampleBook(1L, "Cho tôi xin một vé đi tuổi thơ", BigDecimal.valueOf(80000));
        when(repository.countBooks(anyString(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(1L);
        when(repository.findBooks(anyString(), any(), any(), any(), any(), any(), any(), any(),
                eq("newest"), eq(12), eq(0)))
                .thenReturn(List.of(book));

        PageResponse<StoreBookResponse> result = service.listBooks(
                "", null, null, null, null, null, null, "active", "newest", 2, 12);

        assertEquals(1, result.page());
        assertEquals(1, result.items().size());
    }

    @Test
    void listBooks_invalidPriceRange_throwsBadRequest() {
        BadRequestException exception = assertThrows(BadRequestException.class, () ->
                service.listBooks("", null, null, null,
                        BigDecimal.valueOf(200000), BigDecimal.valueOf(100000),
                        null, "active", "newest", 1, 12));

        assertEquals("Giá thấp nhất không được lớn hơn giá cao nhất", exception.getMessage());
    }

    @Test
    void listBooks_negativeMinPrice_throwsBadRequest() {
        BadRequestException exception = assertThrows(BadRequestException.class, () ->
                service.listBooks("", null, null, null,
                        BigDecimal.valueOf(-1000), BigDecimal.valueOf(100000),
                        null, "active", "newest", 1, 12));

        assertEquals("Giá thấp nhất không được âm", exception.getMessage());
    }

    @Test
    void listBooks_negativeMaxPrice_throwsBadRequest() {
        BadRequestException exception = assertThrows(BadRequestException.class, () ->
                service.listBooks("", null, null, null,
                        BigDecimal.valueOf(10000), BigDecimal.valueOf(-500),
                        null, "active", "newest", 1, 12));

        assertEquals("Giá cao nhất không được âm", exception.getMessage());
    }

    @Test
    void listBooks_invalidMinRating_throwsBadRequest() {
        BadRequestException exception = assertThrows(BadRequestException.class, () ->
                service.listBooks("", null, null, null,
                        null, null,
                        BigDecimal.valueOf(5.5), "active", "newest", 1, 12));

        assertEquals("Điểm đánh giá phải từ 0 đến 5 sao", exception.getMessage());
    }

    @Test
    void getBook_success_returnsBook() {
        StoreBookResponse book = sampleBook(1L, "Đắc Nhân Tâm", BigDecimal.valueOf(100000));
        when(repository.findBook(1L, "active")).thenReturn(Optional.of(book));

        StoreBookResponse result = service.getBook(1L, "active");

        assertNotNull(result);
        assertEquals(1L, result.id());
        assertEquals("Đắc Nhân Tâm", result.title());
    }

    @Test
    void getBook_notFound_throwsResourceNotFound() {
        when(repository.findBook(999L, "active")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getBook(999L, "active"));
    }

    @Test
    void getBook_invalidId_throwsBadRequest() {
        assertThrows(BadRequestException.class, () -> service.getBook(0L, "active"));
        assertThrows(BadRequestException.class, () -> service.getBook(-5L, "active"));
    }

    @Test
    void relatedBooks_success_excludesCurrentBook() {
        StoreBookResponse currentBook = sampleBook(1L, "Sách hiện tại", BigDecimal.valueOf(80000));
        StoreBookResponse relatedBook1 = sampleBook(2L, "Sách liên quan 1", BigDecimal.valueOf(90000));
        StoreBookResponse relatedBook2 = sampleBook(3L, "Sách liên quan 2", BigDecimal.valueOf(95000));

        when(repository.findBook(1L, null)).thenReturn(Optional.of(currentBook));
        when(repository.findBooks(anyString(), eq(currentBook.categoryId()), any(), any(),
                any(), any(), any(), eq("active"), eq("bestseller"), anyInt(), anyInt()))
                .thenReturn(List.of(currentBook, relatedBook1, relatedBook2));

        List<StoreBookResponse> results = service.relatedBooks(1L, 4);

        assertEquals(2, results.size());
        assertEquals(2L, results.get(0).id());
        assertEquals(3L, results.get(1).id());
    }
}
