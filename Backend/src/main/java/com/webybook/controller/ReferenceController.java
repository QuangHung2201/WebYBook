package com.webybook.controller;

import com.webybook.dto.response.ApiResponse;
import com.webybook.service.AdminReferenceService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class ReferenceController {

    private static final List<String> RESOURCES = List.of("categories", "authors", "publishers");
    private final AdminReferenceService service;

    public ReferenceController(AdminReferenceService service) {
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

    private void validate(String resource) {
        if (!RESOURCES.contains(resource)) {
            throw new com.webybook.exception.BadRequestException("Tài nguyên không hợp lệ");
        }
    }
}
