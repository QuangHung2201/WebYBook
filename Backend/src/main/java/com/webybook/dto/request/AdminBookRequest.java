package com.webybook.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record AdminBookRequest(
        @NotNull Long publisherId,
        @NotNull Long categoryId,
        @NotBlank @Size(max = 20) String isbn,
        @NotBlank @Size(max = 500) String title,
        String description,
        @NotNull @DecimalMin("0.00") BigDecimal price,
        @NotNull @DecimalMin("0.00") BigDecimal originalPrice,
        @PositiveOrZero Integer pageCount,
        @PositiveOrZero int stockQuantity,
        @Size(max = 1000) String coverImage,
        @NotBlank String status,
        List<Long> authorIds
) {
}
