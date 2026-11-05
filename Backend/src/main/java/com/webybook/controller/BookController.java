package com.webybook.controller;

import com.webybook.dto.response.AdminBookResponse;
import com.webybook.dto.response.ApiResponse;
import com.webybook.dto.response.PageResponse;
import com.webybook.service.AdminCatalogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/books")
public class BookController {

    private final AdminCatalogService service;

    public BookController(AdminCatalogService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<PageResponse<AdminBookResponse>> list(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit
    ) {
        return ApiResponse.success("Lấy danh sách sách thành công",
                service.listBooks(search, categoryId, page, limit));
    }

    @GetMapping("/{id}")
    public ApiResponse<AdminBookResponse> get(@PathVariable long id) {
        return ApiResponse.success("Lấy chi tiết sách thành công", service.getBook(id));
    }

    @GetMapping("/{id}/related")
    public ApiResponse<PageResponse<AdminBookResponse>> related(
            @PathVariable long id,
            @RequestParam(defaultValue = "4") int limit
    ) {
        service.getBook(id);
        return ApiResponse.success("Lấy sách liên quan thành công",
                service.listBooks("", null, 1, Math.min(Math.max(limit, 1), 20)));
    }
}
