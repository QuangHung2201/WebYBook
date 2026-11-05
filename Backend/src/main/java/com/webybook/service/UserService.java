package com.webybook.service;

import com.webybook.dto.response.UserResponse;
import com.webybook.entity.User;
import com.webybook.enums.UserStatus;
import com.webybook.exception.AccountInactiveException;
import com.webybook.exception.InvalidCredentialsException;
import com.webybook.exception.ResourceNotFoundException;
import com.webybook.repository.UserRepository;
import com.webybook.util.ContactNormalizer;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken
                || authentication.getName() == null) {
            throw new InvalidCredentialsException();
        }

        String email = ContactNormalizer.normalizeEmail(authentication.getName());
        return UserResponse.from(requireCurrentUser(authentication));
    }

    public User requireCurrentUser(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken
                || authentication.getName() == null) {
            throw new InvalidCredentialsException();
        }
        String email = ContactNormalizer.normalizeEmail(authentication.getName());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new AccountInactiveException();
        }
        return user;
    }
}
