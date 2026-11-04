package com.webybook.controller;

import com.webybook.dto.request.AdminShippingMethodRequest;
import com.webybook.dto.response.ApiResponse;
import com.webybook.service.AdminShippingMethodService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/shipping-methods")
public class AdminShippingMethodController {

    private final AdminShippingMethodService service;

    public AdminShippingMethodController(AdminShippingMethodService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> list(@RequestParam(defaultValue = "") String search) {
        return ApiResponse.success("Lấy danh sách phương thức giao hàng thành công", service.list(search));
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> get(@PathVariable long id) {
        return ApiResponse.success("Lấy phương thức giao hàng thành công", service.get(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(
            @Valid @RequestBody AdminShippingMethodRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo phương thức giao hàng thành công", service.create(request)));
    }

    @PutMapping("/{id}")
    public ApiResponse<Map<String, Object>> update(
            @PathVariable long id, @Valid @RequestBody AdminShippingMethodRequest request
    ) {
        return ApiResponse.success("Cập nhật phương thức giao hàng thành công", service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> disable(@PathVariable long id) {
        service.disable(id);
        return ApiResponse.success("Đã vô hiệu hóa phương thức giao hàng");
    }
}
