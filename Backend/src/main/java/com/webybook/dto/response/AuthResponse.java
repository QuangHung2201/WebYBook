package com.webybook.dto.response;

public record AuthResponse(
        String token,
        String tokenType,
        UserResponse user
) {
}
