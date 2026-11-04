package com.webybook.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AdminReviewStatusRequest(
        @NotBlank
        @Pattern(regexp = "approved|rejected", message = "Trạng thái phải là approved hoặc rejected")
        String status
) {
}
