package com.webybook.controller;

import com.webybook.dto.request.AdminVoucherRequest;
import com.webybook.dto.response.ApiResponse;
import com.webybook.service.AdminVoucherService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/vouchers")
public class AdminVoucherController {

    private final AdminVoucherService service;

    public AdminVoucherController(AdminVoucherService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> list(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String status
    ) {
        return ApiResponse.success("Lấy danh sách voucher thành công", service.list(search, status));
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> get(@PathVariable long id) {
        return ApiResponse.success("Lấy voucher thành công", service.get(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@Valid @RequestBody AdminVoucherRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo voucher thành công", service.create(request)));
    }

    @PutMapping("/{id}")
    public ApiResponse<Map<String, Object>> update(
            @PathVariable long id, @Valid @RequestBody AdminVoucherRequest request
    ) {
        return ApiResponse.success("Cập nhật voucher thành công", service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> disable(@PathVariable long id) {
        service.disable(id);
        return ApiResponse.success("Đã vô hiệu hóa voucher");
    }
}
