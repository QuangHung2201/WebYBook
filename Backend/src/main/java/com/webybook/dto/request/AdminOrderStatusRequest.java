package com.webybook.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AdminOrderStatusRequest(@NotBlank String status, String note) {
}
