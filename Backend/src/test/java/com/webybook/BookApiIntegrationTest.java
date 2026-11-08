package com.webybook;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.webybook.dto.response.PageResponse;
import com.webybook.dto.response.StoreBookResponse;
import com.webybook.exception.BadRequestException;
import com.webybook.exception.ResourceNotFoundException;
import com.webybook.service.AdminReferenceService;
import com.webybook.service.StoreBookService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BookApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StoreBookService storeBookService;

    @MockitoBean
    private AdminReferenceService adminReferenceService;

    private StoreBookResponse sampleBook(long id, String title) {
        return new StoreBookResponse(
                id, 1L, 1L, "NXB Trẻ", "Địa chỉ NXB", "0123456789", "nxb@test.vn",
                1L, "Văn học", "ISBN-123456", title, "Mô tả sách",
                BigDecimal.valueOf(85000), BigDecimal.valueOf(120000), 200, 25, "cover.jpg", "active",
                List.of("Nguyễn Nhật Ánh"), BigDecimal.valueOf(4.8), 15L, 100L,
                "Chương 1: Mở đầu", "Đọc thử trang 1...", 5, LocalDateTime.now()
        );
    }

    @Test
    void listBooks_guestAccess_returns200() throws Exception {
        StoreBookResponse book = sampleBook(1L, "Cho tôi xin một vé đi tuổi thơ");
        when(storeBookService.listBooks(anyString(), any(), any(), any(), any(), any(), any(), any(), anyString(), anyInt(), anyInt()))
                .thenReturn(PageResponse.of(List.of(book), 1, 12, 1));

        mockMvc.perform(get("/api/v1/books")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items[0].title").value("Cho tôi xin một vé đi tuổi thơ"))
                .andExpect(jsonPath("$.data.items[0].authorId").value(1))
                .andExpect(jsonPath("$.data.items[0].publisherName").value("NXB Trẻ"))
                .andExpect(jsonPath("$.data.total").value(1));
    }

    @Test
    void listBooks_withFilterParams_returns200() throws Exception {
        StoreBookResponse book = sampleBook(1L, "Cho tôi xin một vé đi tuổi thơ");
        when(storeBookService.listBooks(eq("tuổi thơ"), eq(1L), eq(1L), eq(1L),
                eq(BigDecimal.valueOf(50000)), eq(BigDecimal.valueOf(100000)), eq(BigDecimal.valueOf(4.0)),
                eq("active"), eq("newest"), eq(1), eq(12)))
                .thenReturn(PageResponse.of(List.of(book), 1, 12, 1));

        mockMvc.perform(get("/api/v1/books")
                        .param("search", "tuổi thơ")
                        .param("categoryId", "1")
                        .param("authorId", "1")
                        .param("publisherId", "1")
                        .param("minPrice", "50000")
                        .param("maxPrice", "100000")
                        .param("minRating", "4.0")
                        .param("status", "active")
                        .param("sort", "newest")
                        .param("page", "1")
                        .param("limit", "12")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items[0].id").value(1));
    }

    @Test
    void listBooks_invalidPriceRange_returns400() throws Exception {
        when(storeBookService.listBooks(anyString(), any(), any(), any(),
                eq(BigDecimal.valueOf(200000)), eq(BigDecimal.valueOf(100000)), any(), any(), anyString(), anyInt(), anyInt()))
                .thenThrow(new BadRequestException("Giá thấp nhất không được lớn hơn giá cao nhất"));

        mockMvc.perform(get("/api/v1/books")
                        .param("minPrice", "200000")
                        .param("maxPrice", "100000")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Giá thấp nhất không được lớn hơn giá cao nhất"));
    }

    @Test
    void bestsellers_returns200() throws Exception {
        StoreBookResponse book = sampleBook(2L, "Đắc Nhân Tâm");
        when(storeBookService.listBooks("", null, null, null, null, null, null, "active", "bestseller", 1, 12))
                .thenReturn(PageResponse.of(List.of(book), 1, 12, 1));

        mockMvc.perform(get("/api/v1/books/bestsellers")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items[0].title").value("Đắc Nhân Tâm"));
    }

    @Test
    void newest_returns200() throws Exception {
        StoreBookResponse book = sampleBook(1L, "Cho tôi xin một vé đi tuổi thơ");
        when(storeBookService.listBooks("", null, null, null, null, null, null, "active", "newest", 1, 12))
                .thenReturn(PageResponse.of(List.of(book), 1, 12, 1));

        mockMvc.perform(get("/api/v1/books/newest")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items[0].title").value("Cho tôi xin một vé đi tuổi thơ"));
    }

    @Test
    void getBook_success_returns200() throws Exception {
        StoreBookResponse book = sampleBook(1L, "Cho tôi xin một vé đi tuổi thơ");
        when(storeBookService.getBook(1L, null)).thenReturn(book);

        mockMvc.perform(get("/api/v1/books/1")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Cho tôi xin một vé đi tuổi thơ"))
                .andExpect(jsonPath("$.data.authorId").value(1))
                .andExpect(jsonPath("$.data.tableOfContents").value("Chương 1: Mở đầu"))
                .andExpect(jsonPath("$.data.previewContent").value("Đọc thử trang 1..."))
                .andExpect(jsonPath("$.data.previewPageCount").value(5));
    }

    @Test
    void getBook_notFound_returns404() throws Exception {
        when(storeBookService.getBook(999L, null)).thenThrow(new ResourceNotFoundException("Không tìm thấy sách"));

        mockMvc.perform(get("/api/v1/books/999")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Không tìm thấy sách"));
    }

    @Test
    void relatedBooks_returns200() throws Exception {
        StoreBookResponse book = sampleBook(2L, "Sách liên quan");
        when(storeBookService.relatedBooks(1L, 4)).thenReturn(List.of(book));

        mockMvc.perform(get("/api/v1/books/1/related")
                        .param("limit", "4")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items[0].id").value(2));
    }

    @Test
    void referenceBooks_categoryBooks_returns200() throws Exception {
        StoreBookResponse book = sampleBook(1L, "Sách Văn học");
        when(storeBookService.listBooks("", 1L, null, null, null, null, null, "active", "newest", 1, 12))
                .thenReturn(PageResponse.of(List.of(book), 1, 12, 1));

        mockMvc.perform(get("/api/v1/categories/1/books")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items[0].title").value("Sách Văn học"));
    }

    @Test
    void referenceBooks_authorBooks_returns200() throws Exception {
        StoreBookResponse book = sampleBook(1L, "Sách của tác giả");
        when(storeBookService.listBooks("", null, 2L, null, null, null, null, "active", "newest", 1, 12))
                .thenReturn(PageResponse.of(List.of(book), 1, 12, 1));

        mockMvc.perform(get("/api/v1/authors/2/books")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items[0].title").value("Sách của tác giả"));
    }

    @Test
    void categories_includeActiveBookCounts() throws Exception {
        when(adminReferenceService.list("categories", ""))
                .thenReturn(List.of(Map.of("id", 1L, "name", "Văn học")));
        when(storeBookService.countActiveBooksByCategory()).thenReturn(Map.of(1L, 2L));

        mockMvc.perform(get("/api/v1/categories").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].bookCount").value(2));
    }
}
