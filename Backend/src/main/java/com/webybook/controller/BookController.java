package com.webybook.controller;

import java.math.BigDecimal;

import com.webybook.dto.response.ApiResponse;
import com.webybook.dto.response.PageResponse;
import com.webybook.dto.response.StoreBookResponse;
import com.webybook.service.StoreBookService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/books")
public class BookController {

    private final StoreBookService service;

    public BookController(StoreBookService service) {
        this.service = service;
    }

    /**
     * Danh sách sách công khai. Các tham số lọc đều tùy chọn để không phá vỡ
     * màn hình admin hiện đang dùng chung endpoint này (khi không truyền
     * status, endpoint trả về mọi trạng thái như trước đây).
     */
    @GetMapping
    public ApiResponse<PageResponse<StoreBookResponse>> list(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long authorId,
            @RequestParam(required = false) Long publisherId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit
    ) {
        return ApiResponse.success("Lấy danh sách sách thành công",
                service.listBooks(search, categoryId, authorId, publisherId, minPrice, maxPrice,
                        minRating, status, sort, page, limit));
    }

    @GetMapping("/bestsellers")
    public ApiResponse<PageResponse<StoreBookResponse>> bestsellers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit
    ) {
        return ApiResponse.success("Lấy danh sách sách bán chạy thành công",
                service.listBooks("", null, null, null, null, null, null, "active", "bestseller", page, limit));
    }

    @GetMapping("/newest")
    public ApiResponse<PageResponse<StoreBookResponse>> newest(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit
    ) {
        return ApiResponse.success("Lấy danh sách sách mới thành công",
                service.listBooks("", null, null, null, null, null, null, "active", "newest", page, limit));
    }

    @GetMapping("/{id:[0-9]+}")
    public ApiResponse<StoreBookResponse> get(
            @PathVariable long id,
            @RequestParam(required = false) String status
    ) {
        return ApiResponse.success("Lấy chi tiết sách thành công", service.getBook(id, status));
    }

    @GetMapping("/{id:[0-9]+}/related")
    public ApiResponse<PageResponse<StoreBookResponse>> related(
            @PathVariable long id,
            @RequestParam(defaultValue = "4") int limit
    ) {
        var books = service.relatedBooks(id, limit);
        return ApiResponse.success("Lấy sách liên quan thành công",
                PageResponse.of(books, 1, Math.min(Math.max(limit, 1), 20), books.size()));
    }
}
