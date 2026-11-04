package com.webybook.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminVoucherRequest(
        @NotBlank String code,
        @NotBlank String discountType,
        @NotNull @DecimalMin("0.00") BigDecimal discountValue,
        @NotNull @DecimalMin("0.00") BigDecimal minimumOrderAmount,
        @DecimalMin("0.00") BigDecimal maximumDiscount,
        @PositiveOrZero Integer usageLimit,
        @NotNull LocalDateTime startDate,
        @NotNull LocalDateTime endDate,
        @NotBlank String status
) {
}
