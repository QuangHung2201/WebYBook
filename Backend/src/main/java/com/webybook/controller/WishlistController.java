package com.webybook.controller;

import com.webybook.dto.request.WishlistItemRequest;
import com.webybook.dto.response.ApiResponse;
import com.webybook.security.CustomUserDetails;
import com.webybook.service.WishlistService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/wishlist")
public class WishlistController {

    private final WishlistService service;

    public WishlistController(WishlistService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<?> list(Authentication authentication) {
        return ApiResponse.success("Lấy danh sách yêu thích thành công",
                service.list(userId(authentication)));
    }

    @PostMapping
    public ApiResponse<Void> add(
            Authentication authentication,
            @Valid @RequestBody WishlistItemRequest request
    ) {
        service.add(userId(authentication), request.bookId());
        return ApiResponse.success("Đã thêm sách vào danh sách yêu thích");
    }

    @DeleteMapping("/{bookId}")
    public ApiResponse<Void> remove(Authentication authentication, @PathVariable long bookId) {
        service.remove(userId(authentication), bookId);
        return ApiResponse.success("Đã xóa sách khỏi danh sách yêu thích");
    }

    private long userId(Authentication authentication) {
        return ((CustomUserDetails) authentication.getPrincipal()).getId();
    }
}
