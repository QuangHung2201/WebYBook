package com.webybook.controller;

import com.webybook.dto.request.AdminReviewStatusRequest;
import com.webybook.dto.response.ApiResponse;
import com.webybook.service.AdminReviewService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/reviews")
public class AdminReviewController {

    private final AdminReviewService service;

    public AdminReviewController(AdminReviewService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> list(
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "") String search
    ) {
        return ApiResponse.success("Lấy danh sách đánh giá thành công", service.list(status, search));
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> get(@PathVariable long id) {
        return ApiResponse.success("Lấy đánh giá thành công", service.get(id));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<Map<String, Object>> updateStatus(
            @PathVariable long id, @Valid @RequestBody AdminReviewStatusRequest request
    ) {
        return ApiResponse.success("Cập nhật trạng thái đánh giá thành công", service.updateStatus(id, request.status()));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable long id) {
        service.delete(id);
        return ApiResponse.success("Đã xóa đánh giá");
    }
}
