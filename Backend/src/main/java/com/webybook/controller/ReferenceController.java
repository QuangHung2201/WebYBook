package com.webybook.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.webybook.dto.response.ApiResponse;
import com.webybook.dto.response.PageResponse;
import com.webybook.dto.response.StoreBookResponse;
import com.webybook.exception.BadRequestException;
import com.webybook.service.AdminReferenceService;
import com.webybook.service.StoreBookService;

@RestController
@RequestMapping("/api/v1")
public class ReferenceController {

    private static final List<String> RESOURCES = List.of("categories", "authors", "publishers");
    private final AdminReferenceService service;
    private final StoreBookService storeBookService;

    public ReferenceController(AdminReferenceService service, StoreBookService storeBookService) {
        this.service = service;
        this.storeBookService = storeBookService;
    }

    @GetMapping("/{resource}")
    public ApiResponse<List<Map<String, Object>>> list(
            @PathVariable String resource, @RequestParam(defaultValue = "") String search
    ) {
        validate(resource);
        List<Map<String, Object>> resources = service.list(resource, search);
        if ("categories".equals(resource)) {
            Map<Long, Long> bookCounts = storeBookService.countActiveBooksByCategory();
            resources = resources.stream().map(category -> {
                Map<String, Object> enriched = new HashMap<>(category);
                Object id = category.get("id");
                if (id instanceof Number categoryId) {
                    enriched.put("bookCount", bookCounts.getOrDefault(categoryId.longValue(), 0L));
                }
                return enriched;
            }).toList();
        }
        return ApiResponse.success("Lấy danh sách thành công", resources);
    }

    @GetMapping("/{resource}/{id:[0-9]+}")
    public ApiResponse<Map<String, Object>> get(@PathVariable String resource, @PathVariable long id) {
        validate(resource);
        return ApiResponse.success("Lấy chi tiết thành công", service.get(resource, id));
    }

    @GetMapping("/{resource}/{id:[0-9]+}/books")
    public ApiResponse<PageResponse<StoreBookResponse>> books(
            @PathVariable String resource,
            @PathVariable long id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit,
            @RequestParam(defaultValue = "newest") String sort
    ) {
        validate(resource);
        Long categoryId = "categories".equals(resource) ? id : null;
        Long authorId = "authors".equals(resource) ? id : null;
        Long publisherId = "publishers".equals(resource) ? id : null;
        return ApiResponse.success("Lấy danh sách sách thành công",
                storeBookService.listBooks("", categoryId, authorId, publisherId,
                        null, null, null, "active", sort, page, limit));
    }

    private void validate(String resource) {
        if (!RESOURCES.contains(resource)) {
            throw new BadRequestException("Tài nguyên không hợp lệ");
        }
    }
}
