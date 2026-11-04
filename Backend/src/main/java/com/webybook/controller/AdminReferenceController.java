package com.webybook.controller;

import com.webybook.dto.request.AdminNamedResourceRequest;
import com.webybook.dto.response.ApiResponse;
import com.webybook.service.AdminReferenceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminReferenceController {

    private static final List<String> RESOURCES = List.of("categories", "authors", "publishers");
    private final AdminReferenceService service;

    public AdminReferenceController(AdminReferenceService service) {
        this.service = service;
    }

    @GetMapping("/{resource}")
    public ApiResponse<List<Map<String, Object>>> list(
            @PathVariable String resource, @RequestParam(defaultValue = "") String search
    ) {
        validate(resource);
        return ApiResponse.success("Lấy danh sách thành công", service.list(resource, search));
    }

    @GetMapping("/{resource}/{id}")
    public ApiResponse<Map<String, Object>> get(@PathVariable String resource, @PathVariable long id) {
        validate(resource);
        return ApiResponse.success("Lấy chi tiết thành công", service.get(resource, id));
    }

    @PostMapping("/{resource}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(
            @PathVariable String resource, @Valid @RequestBody AdminNamedResourceRequest request
    ) {
        validate(resource);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo dữ liệu thành công", service.create(resource, request)));
    }

    @PutMapping("/{resource}/{id}")
    public ApiResponse<Map<String, Object>> update(
            @PathVariable String resource, @PathVariable long id,
            @Valid @RequestBody AdminNamedResourceRequest request
    ) {
        validate(resource);
        return ApiResponse.success("Cập nhật dữ liệu thành công", service.update(resource, id, request));
    }

    @DeleteMapping("/{resource}/{id}")
    public ApiResponse<Void> delete(@PathVariable String resource, @PathVariable long id) {
        validate(resource);
        service.delete(resource, id);
        return ApiResponse.success("Xóa dữ liệu thành công");
    }

    private void validate(String resource) {
        if (!RESOURCES.contains(resource)) {
            throw new com.webybook.exception.BadRequestException("Tài nguyên quản trị không hợp lệ");
        }
    }
}
