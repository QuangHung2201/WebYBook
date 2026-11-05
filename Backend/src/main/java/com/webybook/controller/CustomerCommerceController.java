package com.webybook.controller;

import com.webybook.dto.request.*;
import com.webybook.dto.response.ApiResponse;
import com.webybook.security.CustomUserDetails;
import com.webybook.service.CustomerCommerceService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
public class CustomerCommerceController {
    private final CustomerCommerceService service;
    public CustomerCommerceController(CustomerCommerceService service) { this.service = service; }

    @GetMapping("/api/v1/cart")
    public ApiResponse<?> cart(Authentication a) { return ApiResponse.success("Lấy giỏ hàng thành công", service.cart(uid(a))); }
    @PostMapping("/api/v1/cart/items")
    public ApiResponse<?> add(Authentication a, @RequestBody Map<String,Object> b) {
        return ApiResponse.success("Đã thêm vào giỏ hàng", service.addCart(uid(a), Long.parseLong(b.get("bookId").toString()), Integer.parseInt(b.getOrDefault("qty",1).toString())));
    }
    @PutMapping("/api/v1/cart/items/{book}")
    public ApiResponse<?> update(Authentication a, @PathVariable long book, @RequestBody Map<String,Object> b) {
        return ApiResponse.success("Đã cập nhật giỏ hàng", service.updateCart(uid(a), book, Integer.parseInt(b.getOrDefault("qty",1).toString())));
    }
    @DeleteMapping("/api/v1/cart/items/{book}")
    public ApiResponse<?> remove(Authentication a, @PathVariable long book) { return ApiResponse.success("Đã xóa sản phẩm", service.updateCart(uid(a), book, 0)); }
    @DeleteMapping("/api/v1/cart")
    public ApiResponse<?> clear(Authentication a) { return ApiResponse.success("Đã xóa giỏ hàng", service.clearCart(uid(a))); }

    @PostMapping("/api/v1/orders")
    public ApiResponse<?> createOrder(Authentication a, @Valid @RequestBody CreateOrderRequest r) { return ApiResponse.success("Đặt hàng thành công", service.createOrder(uid(a), r)); }
    @GetMapping("/api/v1/orders")
    public ApiResponse<?> orders(Authentication a, @RequestParam(defaultValue="") String status) { return ApiResponse.success("Lấy đơn hàng thành công", service.orders(uid(a), status)); }
    @GetMapping("/api/v1/orders/{id}")
    public ApiResponse<?> order(Authentication a, @PathVariable long id) { return ApiResponse.success("Lấy chi tiết đơn hàng thành công", service.order(id, uid(a))); }
    @PostMapping("/api/v1/orders/{id}/cancel")
    public ApiResponse<Void> cancel(Authentication a, @PathVariable long id) { service.cancelOrder(id, uid(a)); return ApiResponse.success("Đã hủy đơn hàng"); }

    @GetMapping("/api/v1/books/{book}/reviews")
    public ApiResponse<?> reviews(@PathVariable long book) { return ApiResponse.success("Lấy đánh giá thành công", service.reviews(book)); }
    @PostMapping("/api/v1/books/{book}/reviews")
    public ApiResponse<?> review(Authentication a, @PathVariable long book, @Valid @RequestBody CreateReviewRequest r) { return ApiResponse.success("Đã gửi đánh giá", service.createReview(uid(a), book, r)); }
    @DeleteMapping("/api/v1/reviews/{id}")
    public ApiResponse<Void> deleteReview(Authentication a, @PathVariable long id) { service.removeReview(uid(a), id); return ApiResponse.success("Đã xóa đánh giá"); }

    @PostMapping("/api/v1/vouchers/validate")
    public ApiResponse<?> voucher(@Valid @RequestBody VoucherValidationRequest r) { return ApiResponse.success("Voucher hợp lệ", service.validateVoucher(r.code(), r.subtotal())); }
    @PostMapping("/api/v1/contacts")
    public ApiResponse<Void> contact(@Valid @RequestBody ContactRequest r) { service.saveContact(r); return ApiResponse.success("Gửi liên hệ thành công"); }
    private long uid(Authentication a) { return ((CustomUserDetails) a.getPrincipal()).getId(); }
}
