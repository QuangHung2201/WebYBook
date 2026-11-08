package com.webybook.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminNamedResourceRequest(
        @NotBlank @Size(max = 255) String name,
        @Size(max = 500) String address,
        @Size(max = 30) String phone,
        @Size(max = 255) String email,
        String biography,
        String description
) {
}
