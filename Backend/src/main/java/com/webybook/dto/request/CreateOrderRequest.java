package com.webybook.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateOrderRequest(
        @NotBlank @Size(max = 255) String customerName,
        @NotBlank @Size(max = 30) String phone,
        @NotBlank @Size(max = 500) String address,
        String note,
        String paymentMethod,
        String shippingMethod,
        String voucherCode,
        @NotEmpty List<@Valid Item> items
) {
    public record Item(@Positive Long bookId, @Positive int qty) {}
}
