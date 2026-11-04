package com.webybook.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record AdminShippingMethodRequest(
        @NotBlank @Size(max = 150) String name,
        @Size(max = 500) String description,
        @DecimalMin(value = "0.00") BigDecimal shippingFee,
        @Min(1) Integer estimatedDays,
        @Pattern(regexp = "active|inactive", message = "Trạng thái phải là active hoặc inactive")
        String status
) {
}
