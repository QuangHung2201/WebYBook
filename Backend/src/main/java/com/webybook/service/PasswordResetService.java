package com.webybook.service;

import com.webybook.dto.request.ResetPasswordRequest;
import com.webybook.entity.PasswordResetToken;
import com.webybook.entity.User;
import com.webybook.enums.UserStatus;
import com.webybook.exception.AccountInactiveException;
import com.webybook.exception.BadRequestException;
import com.webybook.exception.InvalidTokenException;
import com.webybook.repository.PasswordResetTokenRepository;
import com.webybook.repository.UserRepository;
import com.webybook.util.ContactNormalizer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int TOKEN_BYTES = 32;

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final long tokenTtlMinutes;
    private final String resetUrl;

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            @Value("${app.password-reset.token-ttl-minutes:15}") long tokenTtlMinutes,
            @Value("${app.password-reset.reset-url:http://localhost:5173/reset-password}") String resetUrl
    ) {
        if (tokenTtlMinutes <= 0) {
            throw new IllegalStateException("PASSWORD_RESET_TOKEN_TTL_MINUTES phải lớn hơn 0");
        }
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.tokenTtlMinutes = tokenTtlMinutes;
        this.resetUrl = resetUrl;
    }

    /**
     * Always behaves the same way from the caller's point of view, whether or
     * not the email exists, so the endpoint cannot be used to enumerate users.
     */
    @Transactional
    public void requestPasswordReset(String rawEmail) {
        String email = ContactNormalizer.normalizeEmail(rawEmail);
        if (email == null || email.isBlank()) {
            return;
        }

        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            log.debug("Bỏ qua yêu cầu quên mật khẩu cho email không tồn tại");
            return;
        }

        User user = optionalUser.get();
        if (user.getStatus() != UserStatus.ACTIVE) {
            log.debug("Bỏ qua yêu cầu quên mật khẩu cho tài khoản không hoạt động");
            return;
        }

        // A new request invalidates every previous unused token.
        tokenRepository.invalidateAllByUserId(user.getId());

        String rawToken = generateRawToken();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setTokenHash(hashToken(rawToken));
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(tokenTtlMinutes));
        resetToken.setUsed(false);
        tokenRepository.save(resetToken);

        String resetLink = UriComponentsBuilder.fromUriString(resetUrl)
                .queryParam("token", rawToken)
                .build()
                .toUriString();

        try {
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetLink, tokenTtlMinutes);
        } catch (RuntimeException exception) {
            // Do not leak account information or SMTP details to the caller.
            log.error("Không thể gửi email đặt lại mật khẩu cho {}", user.getEmail(), exception);
        }
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (request.getToken() == null || request.getToken().isBlank()) {
            throw new InvalidTokenException("Token đặt lại mật khẩu không hợp lệ");
        }
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6
                || request.getNewPassword().length() > 72) {
            throw new BadRequestException("Mật khẩu phải có từ 6 đến 72 ký tự");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Mật khẩu xác nhận không khớp");
        }

        String tokenHash = hashToken(request.getToken().trim());
        PasswordResetToken resetToken = tokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidTokenException("Token đặt lại mật khẩu không hợp lệ"));

        if (resetToken.isUsed()) {
            throw new InvalidTokenException("Token đặt lại mật khẩu đã được sử dụng");
        }
        if (!resetToken.getExpiresAt().isAfter(LocalDateTime.now())) {
            throw new InvalidTokenException("Token đặt lại mật khẩu đã hết hạn");
        }

        User user = resetToken.getUser();
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new AccountInactiveException();
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
        tokenRepository.invalidateAllByUserId(user.getId());
    }

    private String generateRawToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("Không thể tạo hash token", exception);
        }
    }
}
