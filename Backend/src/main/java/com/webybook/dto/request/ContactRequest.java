package com.webybook.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ContactRequest(
        @NotBlank String name,
        @NotBlank @Email String email,
        String phone,
        @NotBlank String subject,
        @NotBlank String message
) {}
