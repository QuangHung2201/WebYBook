package com.webybook.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record VoucherValidationRequest(@NotBlank String code, @PositiveOrZero BigDecimal subtotal) {}
