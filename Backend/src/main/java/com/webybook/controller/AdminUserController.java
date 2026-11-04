package com.webybook.controller;

import com.webybook.dto.request.AdminUserUpdateRequest;
import com.webybook.dto.response.ApiResponse;
import com.webybook.service.AdminUserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/users")
public class AdminUserController {

    private final AdminUserService service;

    public AdminUserController(AdminUserService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> list(@RequestParam(defaultValue = "") String search) {
        return ApiResponse.success("Lấy danh sách người dùng thành công", service.list(search));
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> get(@PathVariable long id) {
        return ApiResponse.success("Lấy người dùng thành công", service.get(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<Map<String, Object>> update(
            @PathVariable long id, @Valid @RequestBody AdminUserUpdateRequest request
    ) {
        return ApiResponse.success("Cập nhật người dùng thành công", service.update(id, request));
    }

}
