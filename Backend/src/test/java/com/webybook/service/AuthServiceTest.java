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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserService userService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setFullName("  Nguyen Van A  ");
        registerRequest.setEmail("  User@Example.com  ");
        registerRequest.setPhone("+84912345678");
        registerRequest.setPassword("secret123");
        registerRequest.setConfirmPassword("secret123");
    }

    @Test
    void register_success_encodesPasswordAndAssignsCustomerRole() {
        when(userRepository.existsByEmail("user@example.com")).thenReturn(false);
        when(userRepository.existsByPhone("0912345678")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("bcrypt-hash");
        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });

        UserResponse response = authService.register(registerRequest);

        assertEquals(1L, response.id());
        assertEquals("Nguyen Van A", response.fullName());
        assertEquals("user@example.com", response.email());
        assertEquals("0912345678", response.phone());
        assertEquals(UserRole.CUSTOMER, response.role());
        assertEquals(UserStatus.ACTIVE, response.status());

        verify(passwordEncoder).encode("secret123");
        verify(userRepository).saveAndFlush(any(User.class));
    }

    @Test
    void register_duplicateEmail_throwsConflict() {
        when(userRepository.existsByEmail("user@example.com")).thenReturn(true);

        DuplicateResourceException exception = assertThrows(
                DuplicateResourceException.class,
                () -> authService.register(registerRequest)
        );

        assertEquals("Email đã được sử dụng", exception.getMessage());
        verify(userRepository, never()).saveAndFlush(any(User.class));
    }

    @Test
    void register_duplicatePhone_throwsConflict() {
        when(userRepository.existsByEmail("user@example.com")).thenReturn(false);
        when(userRepository.existsByPhone("0912345678")).thenReturn(true);

        DuplicateResourceException exception = assertThrows(
                DuplicateResourceException.class,
                () -> authService.register(registerRequest)
        );

        assertEquals("Số điện thoại đã được sử dụng", exception.getMessage());
        verify(userRepository, never()).saveAndFlush(any(User.class));
    }

    @Test
    void register_passwordMismatch_throwsBadRequest() {
        registerRequest.setConfirmPassword("different");

        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> authService.register(registerRequest)
        );

        assertEquals("Mật khẩu xác nhận không khớp", exception.getMessage());
        verify(userRepository, never()).saveAndFlush(any(User.class));
    }

    @Test
    void register_shortPassword_throwsBadRequest() {
        registerRequest.setPassword("12345");
        registerRequest.setConfirmPassword("12345");

        assertThrows(BadRequestException.class, () -> authService.register(registerRequest));
    }

    @Test
    void register_databaseConstraintRace_throwsConflict() {
        when(userRepository.existsByEmail("user@example.com")).thenReturn(false);
        when(userRepository.existsByPhone("0912345678")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("bcrypt-hash");
        when(userRepository.saveAndFlush(any(User.class)))
                .thenThrow(new DataIntegrityViolationException("duplicate"));

        DuplicateResourceException exception = assertThrows(
                DuplicateResourceException.class,
                () -> authService.register(registerRequest)
        );

        assertEquals("Email hoặc số điện thoại đã được sử dụng", exception.getMessage());
    }

    @Test
    void login_success_returnsTokenAndUser() {
        User user = activeUser();
        LoginRequest request = loginRequest("  USER@example.com  ", "secret123");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret123", "bcrypt-hash")).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertEquals("jwt-token", response.token());
        assertEquals("Bearer", response.tokenType());
        assertEquals(1L, response.user().id());
        assertEquals("user@example.com", response.user().email());
        assertEquals(UserRole.CUSTOMER, response.user().role());
        assertEquals(UserStatus.ACTIVE, response.user().status());
    }

    @Test
    void login_unknownEmail_returnsGenericInvalidCredentials() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        InvalidCredentialsException exception = assertThrows(
                InvalidCredentialsException.class,
                () -> authService.login(loginRequest("missing@example.com", "secret123"))
        );

        assertEquals("Email hoặc mật khẩu không chính xác", exception.getMessage());
        verify(passwordEncoder, never()).matches(any(), any());
    }

    @Test
    void login_wrongPassword_returnsGenericInvalidCredentials() {
        User user = activeUser();
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "bcrypt-hash")).thenReturn(false);

        InvalidCredentialsException exception = assertThrows(
                InvalidCredentialsException.class,
                () -> authService.login(loginRequest("user@example.com", "wrong-password"))
        );

        assertEquals("Email hoặc mật khẩu không chính xác", exception.getMessage());
        verify(jwtService, never()).generateToken(any());
    }

    @Test
    void login_lockedAccountWithCorrectPassword_returnsForbidden() {
        User user = activeUser();
        user.setStatus(UserStatus.LOCKED);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret123", "bcrypt-hash")).thenReturn(true);

        assertThrows(AccountInactiveException.class, () -> authService.login(loginRequest("user@example.com", "secret123")));
        verify(jwtService, never()).generateToken(any());
    }

    @Test
    void login_lockedAccountWithWrongPassword_doesNotRevealAccountState() {
        User user = activeUser();
        user.setStatus(UserStatus.LOCKED);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "bcrypt-hash")).thenReturn(false);

        assertThrows(
                InvalidCredentialsException.class,
                () -> authService.login(loginRequest("user@example.com", "wrong-password"))
        );
    }

    @Test
    void login_missingCredentials_throwsBadRequest() {
        assertThrows(BadRequestException.class, () -> authService.login(loginRequest("", "")));
    }

    @Test
    void getCurrentUser_delegatesToUserService() {
        Authentication authentication = org.mockito.Mockito.mock(Authentication.class);
        UserResponse expected = new UserResponse(1L, "Nguyen Van A", "user@example.com", "0912345678",
                UserRole.CUSTOMER, UserStatus.ACTIVE);
        when(userService.getCurrentUser(authentication)).thenReturn(expected);

        UserResponse actual = authService.getCurrentUser(authentication);

        assertSame(expected, actual);
        assertTrue(actual.id() > 0);
    }

    private User activeUser() {
        User user = new User();
        user.setId(1L);
        user.setFullName("Nguyen Van A");
        user.setEmail("user@example.com");
        user.setPhone("0912345678");
        user.setPassword("bcrypt-hash");
        user.setRole(UserRole.CUSTOMER);
        user.setStatus(UserStatus.ACTIVE);
        return user;
    }

    private LoginRequest loginRequest(String email, String password) {
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        request.setPassword(password);
        return request;
    }
}
