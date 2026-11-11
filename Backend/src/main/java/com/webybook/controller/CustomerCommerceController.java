package com.webybook.controller;

import com.webybook.dto.request.*;
import com.webybook.dto.response.ApiResponse;
import com.webybook.security.CustomUserDetails;
import com.webybook.service.CustomerCommerceService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;
import com.webybook.service.VnpayService;
import org.springframework.http.ResponseEntity;
import java.net.URI;

@RestController
public class CustomerCommerceController {
    private final CustomerCommerceService service;
    private final VnpayService vnpayService;
    public CustomerCommerceController(CustomerCommerceService service, VnpayService vnpayService) {
        this.service = service;
        this.vnpayService = vnpayService;
    }

    @GetMapping("/api/v1/cart")
    public ApiResponse<?> cart(Authentication a) { return ApiResponse.success("Lấy giỏ hàng thành công", service.cart(uid(a))); }
    @PostMapping("/api/v1/cart/items")
    public ApiResponse<?> add(Authentication a, @Valid @RequestBody CartItemRequest request) {
        int qty = request.qty() == null ? 1 : request.qty();
        return ApiResponse.success("Đã thêm vào giỏ hàng", service.addCart(uid(a), request.bookId(), qty));
    }
    @PutMapping("/api/v1/cart/items/{book}")
    public ApiResponse<?> update(Authentication a, @PathVariable long book, @Valid @RequestBody CartQuantityRequest request) {
        return ApiResponse.success("Đã cập nhật giỏ hàng", service.updateCart(uid(a), book, request.qty()));
    }
    @DeleteMapping("/api/v1/cart/items/{book}")
    public ApiResponse<?> remove(Authentication a, @PathVariable long book) { return ApiResponse.success("Đã xóa sản phẩm", service.updateCart(uid(a), book, 0)); }
    @DeleteMapping("/api/v1/cart")
    public ApiResponse<?> clear(Authentication a) { return ApiResponse.success("Đã xóa giỏ hàng", service.clearCart(uid(a))); }

    @PostMapping("/api/v1/orders")
    public ApiResponse<?> createOrder(Authentication a, @Valid @RequestBody CreateOrderRequest r) { return ApiResponse.success("Đặt hàng thành công", service.createOrder(uid(a), r)); }
    @GetMapping("/api/v1/orders/{id}/vnpay-url")
    public ApiResponse<String> vnpayUrl(Authentication a, @PathVariable long id, HttpServletRequest request) {
        return ApiResponse.success("Tạo liên kết thanh toán VNPay thành công",
                vnpayService.createPaymentUrl(id, uid(a), request));
    }
    @GetMapping("/api/v1/payments/vnpay-return")
    public ResponseEntity<Void> vnpayReturn(@RequestParam Map<String, String> params) {
        boolean paid = vnpayService.handleCallback(params);
        String orderId = params.getOrDefault("vnp_TxnRef", "");
        return ResponseEntity.status(302)
                .location(URI.create("http://localhost:5173/payment/vnpay-return?status="
                        + (paid ? "PAID" : "FAILED") + "&orderId=" + orderId))
                .build();
    }
    @GetMapping("/api/v1/orders")
    public ApiResponse<?> orders(
            Authentication a,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize
    ) {
        int safePage = Math.max(1, page);
        int safeSize = Math.min(50, Math.max(1, pageSize));
        return ApiResponse.success(
                "Lấy đơn hàng thành công",
                service.orders(uid(a), status, safePage, safeSize)
        );
    }
    @GetMapping("/api/v1/orders/{id}")
    public ApiResponse<?> order(Authentication a, @PathVariable long id) { return ApiResponse.success("Lấy chi tiết đơn hàng thành công", service.order(id, uid(a))); }
    @PostMapping("/api/v1/orders/{id}/cancel")
    public ApiResponse<Void> cancel(Authentication a, @PathVariable long id) { service.cancelOrder(id, uid(a)); return ApiResponse.success("Đã hủy đơn hàng"); }

    @GetMapping("/api/v1/books/{book}/reviews")
    public ApiResponse<?> reviews(@PathVariable long book) { return ApiResponse.success("Lấy đánh giá thành công", service.reviews(book)); }
    @GetMapping("/api/v1/books/{book}/reviews/mine")
    public ApiResponse<?> myReview(Authentication a, @PathVariable long book) { return ApiResponse.success("Lấy đánh giá của bạn thành công", service.myReview(uid(a), book)); }
    @PostMapping("/api/v1/books/{book}/reviews")
    public ApiResponse<?> review(Authentication a, @PathVariable long book, @Valid @RequestBody CreateReviewRequest r) { return ApiResponse.success("Đã gửi đánh giá", service.createReview(customerUid(a), book, r)); }
    @PutMapping("/api/v1/reviews/{id}")
    public ApiResponse<?> updateReview(Authentication a, @PathVariable long id, @Valid @RequestBody CreateReviewRequest r) { return ApiResponse.success("Đã cập nhật đánh giá", service.updateReview(customerUid(a), id, r)); }
    @DeleteMapping("/api/v1/reviews/{id}")
    public ApiResponse<Void> deleteReview(Authentication a, @PathVariable long id) { service.removeReview(customerUid(a), id); return ApiResponse.success("Đã xóa đánh giá"); }

    @GetMapping("/api/v1/vouchers")
    public ApiResponse<?> vouchers(@RequestParam(required = false) BigDecimal subtotal,
                                   @RequestParam(defaultValue="false") boolean includeUnavailable,
                                   Authentication authentication) {
        if (includeUnavailable) {
            Long userId = authentication != null && authentication.getPrincipal() instanceof CustomUserDetails user
                    ? user.getId() : null;
            return ApiResponse.success("Lấy danh sách voucher thành công", service.voucherCatalog(userId));
        }
        return ApiResponse.success("Lấy danh sách voucher thành công", service.availableVouchers(subtotal));
    }
    @PostMapping("/api/v1/vouchers/validate")
    public ApiResponse<?> voucher(@Valid @RequestBody VoucherValidationRequest r) { return ApiResponse.success("Voucher hợp lệ", service.validateVoucher(r.code(), r.subtotal())); }
    @PostMapping("/api/v1/contacts")
    public ApiResponse<Void> contact(Authentication a, @Valid @RequestBody ContactRequest r) {
        Long userId = a != null && a.getPrincipal() instanceof CustomUserDetails user ? user.getId() : null;
        service.saveContact(userId, r);
        return ApiResponse.success("Gửi liên hệ thành công");
    }
    @GetMapping("/api/v1/contacts/mine")
    public ApiResponse<?> myContacts(Authentication a) {
        return ApiResponse.success("Lấy lịch sử liên hệ thành công", service.myContacts(uid(a)));
    }
    private long uid(Authentication a) { return ((CustomUserDetails) a.getPrincipal()).getId(); }
    private long customerUid(Authentication a) {
        if (a == null || !(a.getPrincipal() instanceof CustomUserDetails user)
                || user.getRole() != com.webybook.enums.UserRole.CUSTOMER) {
            throw new AccessDeniedException("Chỉ Customer mới được thao tác đánh giá");
        }
        return user.getId();
    }
}
