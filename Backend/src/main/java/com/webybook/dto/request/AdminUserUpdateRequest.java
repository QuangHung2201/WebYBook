package com.webybook.dto.request;

import com.webybook.enums.UserRole;
import com.webybook.enums.UserStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminUserUpdateRequest(
        @NotBlank @Size(min = 2, max = 80) String fullName,
        @Pattern(regexp = "^(?:\\+84|0)(?:2[0-9]|3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9])\\d{7}$")
        String phone,
        @NotNull UserRole role,
        @NotNull UserStatus status
) {
}
