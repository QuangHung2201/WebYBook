package com.webybook.controller;

import com.webybook.dto.request.AdminBookRequest;
import com.webybook.dto.response.AdminBookResponse;
import com.webybook.dto.response.ApiResponse;
import com.webybook.dto.response.PageResponse;
import com.webybook.service.AdminCatalogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/books")
public class AdminBookController {

    private final AdminCatalogService service;

    public AdminBookController(AdminCatalogService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<PageResponse<AdminBookResponse>> list(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return ApiResponse.success("Lấy danh sách sách thành công", service.listBooks(search, categoryId, page, limit));
    }

    @GetMapping("/{id}")
    public ApiResponse<AdminBookResponse> get(@PathVariable long id) {
        return ApiResponse.success("Lấy chi tiết sách thành công", service.getBook(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminBookResponse>> create(@Valid @RequestBody AdminBookRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm sách thành công", service.createBook(request)));
    }

    @PutMapping("/{id}")
    public ApiResponse<AdminBookResponse> update(
            @PathVariable long id, @Valid @RequestBody AdminBookRequest request
    ) {
        return ApiResponse.success("Cập nhật sách thành công", service.updateBook(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable long id) {
        service.deleteBook(id);
        return ApiResponse.success("Ẩn sách thành công");
    }
}
