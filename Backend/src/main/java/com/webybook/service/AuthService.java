package com.webybook.service;

import com.webybook.dto.request.LoginRequest;
import com.webybook.dto.request.RegisterRequest;
import com.webybook.dto.response.AuthResponse;
import com.webybook.dto.response.UserResponse;
import com.webybook.entity.User;
import com.webybook.enums.UserRole;
import com.webybook.enums.UserStatus;
import com.webybook.exception.AccountInactiveException;
import com.webybook.exception.BadRequestException;
import com.webybook.exception.DuplicateResourceException;
import com.webybook.exception.InvalidCredentialsException;
import com.webybook.repository.UserRepository;
import com.webybook.security.JwtService;
import com.webybook.util.ContactNormalizer;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserService userService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            UserService userService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userService = userService;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String fullName = request.getFullName() == null ? "" : request.getFullName().trim();
        String email = ContactNormalizer.normalizeEmail(request.getEmail());
        String phone = ContactNormalizer.normalizePhone(request.getPhone());
        String password = request.getPassword();
        String confirmPassword = request.getConfirmPassword();

        if (fullName.length() < 2 || fullName.length() > 80) {
            throw new BadRequestException("Họ và tên phải có từ 2 đến 80 ký tự");
        }
        if (email == null || email.isBlank() || phone == null || phone.isBlank()) {
            throw new BadRequestException("Thiếu thông tin bắt buộc");
        }
        if (password == null || password.length() < 6 || password.length() > 72) {
            throw new BadRequestException("Mật khẩu phải có từ 6 đến 72 ký tự");
        }
        if (!password.equals(confirmPassword)) {
            throw new BadRequestException("Mật khẩu xác nhận không khớp");
        }
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email đã được sử dụng");
        }
        if (userRepository.existsByPhone(phone)) {
            throw new DuplicateResourceException("Số điện thoại đã được sử dụng");
        }

        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPhone(phone);
        user.setPassword(passwordEncoder.encode(password));
        // Role and status are assigned by the server, never by the client.
        user.setRole(UserRole.CUSTOMER);
        user.setStatus(UserStatus.ACTIVE);

        try {
            userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException exception) {
            // Covers a race between the duplicate pre-check and the INSERT.
            throw new DuplicateResourceException("Email hoặc số điện thoại đã được sử dụng");
        }

        return UserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = ContactNormalizer.normalizeEmail(request.getEmail());
        String rawPassword = request.getPassword();

        if (email == null || email.isBlank() || rawPassword == null || rawPassword.isBlank()) {
            throw new BadRequestException("Email và mật khẩu không được để trống");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        // Check the status only after the password is verified, so a locked
        // account cannot be detected by guessing its email alone.
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new AccountInactiveException();
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, "Bearer", UserResponse.from(user));
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Authentication authentication) {
        return userService.getCurrentUser(authentication);
    }
}
