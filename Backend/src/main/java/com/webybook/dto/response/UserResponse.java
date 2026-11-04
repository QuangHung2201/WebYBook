package com.webybook.dto.response;

import com.webybook.enums.UserRole;
import com.webybook.enums.UserStatus;
import com.webybook.entity.User;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        UserRole role,
        UserStatus status
) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getStatus()
        );
    }
}
