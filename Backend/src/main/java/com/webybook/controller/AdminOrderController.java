package com.webybook.controller;

import com.webybook.dto.request.AdminOrderStatusRequest;
import com.webybook.dto.response.ApiResponse;
import com.webybook.service.AdminOrderService;
import com.webybook.security.CustomUserDetails;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/orders")
public class AdminOrderController {

    private final AdminOrderService service;

    public AdminOrderController(AdminOrderService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> list(@RequestParam(defaultValue = "") String status) {
        return ApiResponse.success("Lấy danh sách đơn hàng thành công", service.list(status));
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> detail(@PathVariable long id) {
        return ApiResponse.success("Lấy chi tiết đơn hàng thành công", service.detail(id));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<Map<String, Object>> updateStatus(
            @PathVariable long id, @Valid @RequestBody AdminOrderStatusRequest request,
            Authentication authentication
    ) {
        return ApiResponse.success("Cập nhật trạng thái đơn hàng thành công",
                service.updateStatus(id, request, currentUserId(authentication)));
    }

    @PutMapping("/{id}/payment/confirm")
    public ApiResponse<Map<String, Object>> confirmPayment(@PathVariable long id) {
        return ApiResponse.success("Đã xác nhận thu tiền COD", service.confirmCodPayment(id));
    }

    @GetMapping("/{id}/history")
    public ApiResponse<List<Map<String, Object>>> history(@PathVariable long id) {
        return ApiResponse.success("Lấy lịch sử đơn hàng thành công", service.history(id));
    }

    private Long currentUserId(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        return principal instanceof CustomUserDetails userDetails ? userDetails.getId() : null;
    }
}
