package com.webybook.service;

import com.webybook.dto.request.ResetPasswordRequest;
import com.webybook.entity.PasswordResetToken;
import com.webybook.entity.User;
import com.webybook.enums.UserRole;
import com.webybook.enums.UserStatus;
import com.webybook.exception.AccountInactiveException;
import com.webybook.exception.BadRequestException;
import com.webybook.exception.InvalidTokenException;
import com.webybook.repository.PasswordResetTokenRepository;
import com.webybook.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    private PasswordResetService passwordResetService;
    private User user;

    @BeforeEach
    void setUp() {
        passwordResetService = new PasswordResetService(
                userRepository,
                tokenRepository,
                passwordEncoder,
                emailService,
                15,
                "http://localhost:5173/reset-password"
        );

        user = new User();
        user.setId(1L);
        user.setFullName("Nguyen Van A");
        user.setEmail("user@example.com");
        user.setPhone("0912345678");
        user.setPassword("old-bcrypt-hash");
        user.setRole(UserRole.CUSTOMER);
        user.setStatus(UserStatus.ACTIVE);
    }

    @Test
    void requestReset_existingEmail_storesOnlyHashAndSendsLink() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(tokenRepository.save(any(PasswordResetToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        passwordResetService.requestPasswordReset("  User@Example.com  ");

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(tokenRepository).save(tokenCaptor.capture());

        ArgumentCaptor<String> linkCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendPasswordResetEmail(
                eq("user@example.com"),
                eq("Nguyen Van A"),
                linkCaptor.capture(),
                eq(15L)
        );

        String link = linkCaptor.getValue();
        String rawToken = UriComponentsBuilder.fromUriString(link).build()
                .getQueryParams()
                .getFirst("token");

        assertNotNull(rawToken);
        assertNotEquals(rawToken, tokenCaptor.getValue().getTokenHash());
        assertEquals(sha256(rawToken), tokenCaptor.getValue().getTokenHash());
        assertEquals(64, tokenCaptor.getValue().getTokenHash().length());
        assertFalse(tokenCaptor.getValue().isUsed());
        assertTrue(tokenCaptor.getValue().getExpiresAt().isAfter(LocalDateTime.now().plusMinutes(14)));
        verify(tokenRepository).invalidateAllByUserId(1L);
    }

    @Test
    void requestReset_unknownEmail_doesNotRevealOrCreateToken() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> passwordResetService.requestPasswordReset("missing@example.com"));

        verifyNoInteractions(tokenRepository, emailService);
    }

    @Test
    void requestReset_inactiveAccount_doesNotCreateToken() {
        user.setStatus(UserStatus.LOCKED);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        passwordResetService.requestPasswordReset("user@example.com");

        verifyNoInteractions(tokenRepository, emailService);
    }

    @Test
    void requestReset_mailFailure_stillReturnsNormally() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(tokenRepository.save(any(PasswordResetToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        doThrow(new RuntimeException("SMTP unavailable"))
                .when(emailService)
                .sendPasswordResetEmail(any(), any(), any(), anyLong());

        assertDoesNotThrow(() -> passwordResetService.requestPasswordReset("user@example.com"));
        verify(tokenRepository).save(any(PasswordResetToken.class));
    }

    @Test
    void resetPassword_success_hashesPasswordAndMarksTokenUsed() {
        String rawToken = "raw-token-value";
        PasswordResetToken resetToken = token(user, rawToken, LocalDateTime.now().plusMinutes(10), false);

        when(tokenRepository.findByTokenHash(sha256(rawToken))).thenReturn(Optional.of(resetToken));
        when(passwordEncoder.encode("newSecret1")).thenReturn("new-bcrypt-hash");

        passwordResetService.resetPassword(resetRequest(rawToken, "newSecret1", "newSecret1"));

        assertEquals("new-bcrypt-hash", user.getPassword());
        assertTrue(resetToken.isUsed());
        verify(userRepository).save(user);
        verify(tokenRepository).save(resetToken);
        verify(tokenRepository).invalidateAllByUserId(1L);
    }

    @Test
    void resetPassword_tokenCannotBeReused() {
        String rawToken = "one-time-token";
        PasswordResetToken resetToken = token(user, rawToken, LocalDateTime.now().plusMinutes(10), false);

        when(tokenRepository.findByTokenHash(sha256(rawToken))).thenReturn(Optional.of(resetToken));
        when(passwordEncoder.encode("newSecret1")).thenReturn("new-bcrypt-hash");

        passwordResetService.resetPassword(resetRequest(rawToken, "newSecret1", "newSecret1"));

        InvalidTokenException exception = assertThrows(
                InvalidTokenException.class,
                () -> passwordResetService.resetPassword(resetRequest(rawToken, "newSecret1", "newSecret1"))
        );

        assertEquals("Token đặt lại mật khẩu đã được sử dụng", exception.getMessage());
    }

    @Test
    void resetPassword_unknownToken_throwsInvalidToken() {
        String rawToken = "unknown-token";
        when(tokenRepository.findByTokenHash(sha256(rawToken))).thenReturn(Optional.empty());

        InvalidTokenException exception = assertThrows(
                InvalidTokenException.class,
                () -> passwordResetService.resetPassword(resetRequest(rawToken, "newSecret1", "newSecret1"))
        );

        assertEquals("Token đặt lại mật khẩu không hợp lệ", exception.getMessage());
    }

    @Test
    void resetPassword_expiredToken_throwsInvalidToken() {
        String rawToken = "expired-token";
        PasswordResetToken resetToken = token(user, rawToken, LocalDateTime.now().minusMinutes(1), false);
        when(tokenRepository.findByTokenHash(sha256(rawToken))).thenReturn(Optional.of(resetToken));

        InvalidTokenException exception = assertThrows(
                InvalidTokenException.class,
                () -> passwordResetService.resetPassword(resetRequest(rawToken, "newSecret1", "newSecret1"))
        );

        assertEquals("Token đặt lại mật khẩu đã hết hạn", exception.getMessage());
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    void resetPassword_inactiveUser_throwsForbidden() {
        user.setStatus(UserStatus.INACTIVE);
        String rawToken = "inactive-user-token";
        PasswordResetToken resetToken = token(user, rawToken, LocalDateTime.now().plusMinutes(10), false);
        when(tokenRepository.findByTokenHash(sha256(rawToken))).thenReturn(Optional.of(resetToken));

        assertThrows(
                AccountInactiveException.class,
                () -> passwordResetService.resetPassword(resetRequest(rawToken, "newSecret1", "newSecret1"))
        );
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void resetPassword_mismatchedConfirmation_throwsBadRequest() {
        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> passwordResetService.resetPassword(
                        resetRequest("some-token", "newSecret1", "different")
                )
        );

        assertEquals("Mật khẩu xác nhận không khớp", exception.getMessage());
        verifyNoInteractions(tokenRepository);
    }

    @Test
    void resetPassword_shortPassword_throwsBadRequest() {
        assertThrows(
                BadRequestException.class,
                () -> passwordResetService.resetPassword(resetRequest("some-token", "12345", "12345"))
        );
    }

    private PasswordResetToken token(User owner, String rawToken, LocalDateTime expiresAt, boolean used) {
        PasswordResetToken token = new PasswordResetToken();
        token.setId(100L);
        token.setUser(owner);
        token.setTokenHash(sha256(rawToken));
        token.setExpiresAt(expiresAt);
        token.setUsed(used);
        return token;
    }

    private ResetPasswordRequest resetRequest(String token, String newPassword, String confirmPassword) {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken(token);
        request.setNewPassword(newPassword);
        request.setConfirmPassword(confirmPassword);
        return request;
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }
}
