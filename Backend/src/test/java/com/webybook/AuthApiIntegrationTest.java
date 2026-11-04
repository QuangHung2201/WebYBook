package com.webybook;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webybook.entity.PasswordResetToken;
import com.webybook.entity.User;
import com.webybook.enums.UserStatus;
import com.webybook.repository.PasswordResetTokenRepository;
import com.webybook.repository.UserRepository;
import com.webybook.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthApiIntegrationTest {

    private static final String REGISTER_URL = "/api/v1/auth/register";
    private static final String LOGIN_URL = "/api/v1/auth/login";
    private static final String FORGOT_PASSWORD_URL = "/api/v1/auth/forgot-password";
    private static final String RESET_PASSWORD_URL = "/api/v1/auth/reset-password";
    private static final String ME_URL = "/api/v1/auth/me";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        passwordResetTokenRepository.deleteAll();
        userRepository.deleteAll();
        reset(emailService);
    }

    @Test
    void register_success_returnsCreatedUserWithoutPassword() throws Exception {
        mockMvc.perform(post(REGISTER_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson("  Nguyen Van A  ", "User@Example.com", "+84912345678",
                                "secret123", "secret123")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Đăng ký tài khoản thành công"))
                .andExpect(jsonPath("$.data.id").isNumber())
                .andExpect(jsonPath("$.data.fullName").value("Nguyen Van A"))
                .andExpect(jsonPath("$.data.email").value("user@example.com"))
                .andExpect(jsonPath("$.data.phone").value("0912345678"))
                .andExpect(jsonPath("$.data.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.password").doesNotExist());

        User saved = userRepository.findByEmail("user@example.com").orElseThrow();
        assertNotEquals("secret123", saved.getPassword());
        assertTrue(passwordEncoder.matches("secret123", saved.getPassword()));
        assertEquals("CUSTOMER", saved.getRole().name());
        assertEquals("ACTIVE", saved.getStatus().name());
        assertNotNull(saved.getCreatedAt());
        assertNotNull(saved.getUpdatedAt());
    }

    @Test
    void register_duplicateEmail_returnsConflict() throws Exception {
        register("Nguyen Van A", "user@example.com", "0912345678");

        mockMvc.perform(post(REGISTER_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson("Nguyen Van B", "user@example.com", "0987654321",
                                "secret123", "secret123")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Email đã được sử dụng"));
    }

    @Test
    void register_duplicatePhone_returnsConflict() throws Exception {
        register("Nguyen Van A", "user@example.com", "0912345678");

        mockMvc.perform(post(REGISTER_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson("Nguyen Van B", "other@example.com", "0912345678",
                                "secret123", "secret123")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Số điện thoại đã được sử dụng"));
    }

    @Test
    void register_invalidEmail_returnsValidationError() throws Exception {
        mockMvc.perform(post(REGISTER_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson("Nguyen Van A", "not-an-email", "0912345678",
                                "secret123", "secret123")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Dữ liệu đầu vào không hợp lệ"))
                .andExpect(jsonPath("$.data.email").value("Email không đúng định dạng"));
    }

    @Test
    void register_invalidPhone_returnsValidationError() throws Exception {
        mockMvc.perform(post(REGISTER_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson("Nguyen Van A", "user@example.com", "12345",
                                "secret123", "secret123")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.data.phone").value("Số điện thoại không đúng định dạng Việt Nam"));
    }

    @Test
    void register_shortPassword_returnsValidationError() throws Exception {
        mockMvc.perform(post(REGISTER_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson("Nguyen Van A", "user@example.com", "0912345678",
                                "12345", "12345")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.data.password").value("Mật khẩu phải có từ 6 đến 72 ký tự"));
    }

    @Test
    void register_passwordConfirmationMismatch_returnsValidationError() throws Exception {
        mockMvc.perform(post(REGISTER_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson("Nguyen Van A", "user@example.com", "0912345678",
                                "secret123", "different")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.data._global").value("Mật khẩu xác nhận không khớp"));
    }

    @Test
    void register_missingRequiredFields_returnsValidationErrors() throws Exception {
        mockMvc.perform(post(REGISTER_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.data.fullName").exists())
                .andExpect(jsonPath("$.data.email").exists())
                .andExpect(jsonPath("$.data.phone").exists())
                .andExpect(jsonPath("$.data.password").exists())
                .andExpect(jsonPath("$.data.confirmPassword").exists());
    }

    @Test
    void register_ignoresClientSuppliedRoleAndStatus() throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("fullName", "Nguyen Van A");
        body.put("email", "role-test@example.com");
        body.put("phone", "0912345678");
        body.put("password", "secret123");
        body.put("confirmPassword", "secret123");
        body.put("role", "ADMIN");
        body.put("status", "LOCKED");

        mockMvc.perform(post(REGISTER_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));

        User saved = userRepository.findByEmail("role-test@example.com").orElseThrow();
        assertEquals("CUSTOMER", saved.getRole().name());
        assertEquals("ACTIVE", saved.getStatus().name());
    }

    @Test
    void login_missingCredentials_returnsValidationError() throws Exception {
        mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.data.email").exists())
                .andExpect(jsonPath("$.data.password").exists());
    }

    @Test
    void login_invalidEmail_returnsValidationError() throws Exception {
        mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("not-an-email", "secret123")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.data.email").value("Email không đúng định dạng"));
    }

    @Test
    void login_success_andCurrentUserWithValidToken() throws Exception {
        register("Nguyen Van A", "user@example.com", "0912345678");

        MvcResult loginResult = mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("user@example.com", "secret123")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Đăng nhập thành công"))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.user.email").value("user@example.com"))
                .andExpect(jsonPath("$.data.user.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.data.user.status").value("ACTIVE"))
                .andReturn();

        String token = readToken(loginResult);

        mockMvc.perform(get(ME_URL).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").isNumber())
                .andExpect(jsonPath("$.data.fullName").value("Nguyen Van A"))
                .andExpect(jsonPath("$.data.email").value("user@example.com"))
                .andExpect(jsonPath("$.data.phone").value("0912345678"))
                .andExpect(jsonPath("$.data.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.password").doesNotExist());
    }

    @Test
    void login_unknownEmailAndWrongPassword_returnTheSameMessage() throws Exception {
        register("Nguyen Van A", "user@example.com", "0912345678");

        String wrongPasswordMessage = mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("user@example.com", "wrong-password")))
                .andExpect(status().isUnauthorized())
                .andReturn()
                .getResponse()
                .getContentAsString(StandardCharsets.UTF_8);

        String unknownEmailMessage = mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("missing@example.com", "secret123")))
                .andExpect(status().isUnauthorized())
                .andReturn()
                .getResponse()
                .getContentAsString(StandardCharsets.UTF_8);

        assertEquals(
                objectMapper.readTree(wrongPasswordMessage).path("message").asText(),
                objectMapper.readTree(unknownEmailMessage).path("message").asText()
        );
        assertEquals("Email hoặc mật khẩu không chính xác",
                objectMapper.readTree(wrongPasswordMessage).path("message").asText());
    }

    @Test
    void login_lockedAccount_returnsForbidden() throws Exception {
        register("Nguyen Van A", "user@example.com", "0912345678");
        User user = userRepository.findByEmail("user@example.com").orElseThrow();
        user.setStatus(UserStatus.LOCKED);
        userRepository.saveAndFlush(user);

        mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("user@example.com", "secret123")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Tài khoản đã bị khóa hoặc không hoạt động"));
    }

    @Test
    void me_withoutToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(get(ME_URL))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Chưa xác thực hoặc token không hợp lệ"));
    }

    @Test
    void me_withInvalidToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(get(ME_URL).header("Authorization", "Bearer not-a-valid-jwt"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void me_withTokenOfLockedAccount_returnsForbidden() throws Exception {
        register("Nguyen Van A", "user@example.com", "0912345678");

        MvcResult loginResult = mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("user@example.com", "secret123")))
                .andExpect(status().isOk())
                .andReturn();

        User user = userRepository.findByEmail("user@example.com").orElseThrow();
        user.setStatus(UserStatus.LOCKED);
        userRepository.saveAndFlush(user);

        mockMvc.perform(get(ME_URL).header("Authorization", "Bearer " + readToken(loginResult)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Tài khoản đã bị khóa hoặc không hoạt động"));
    }

    @Test
    void forgotPassword_existingEmail_createsOneTimeTokenAndResetsPassword() throws Exception {
        register("Nguyen Van A", "user@example.com", "0912345678");

        mockMvc.perform(post(FORGOT_PASSWORD_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"user@example.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Nếu email đã được đăng ký, hướng dẫn đặt lại mật khẩu đã được gửi"));

        ArgumentCaptor<String> linkCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendPasswordResetEmail(
                eq("user@example.com"),
                eq("Nguyen Van A"),
                linkCaptor.capture(),
                eq(15L)
        );

        String rawToken = UriComponentsBuilder.fromUriString(linkCaptor.getValue())
                .build()
                .getQueryParams()
                .getFirst("token");
        assertNotNull(rawToken);

        assertEquals(1, passwordResetTokenRepository.count());
        PasswordResetToken storedToken = passwordResetTokenRepository.findAll().get(0);
        assertNotEquals(rawToken, storedToken.getTokenHash());
        assertEquals(sha256(rawToken), storedToken.getTokenHash());
        assertFalse(storedToken.isUsed());

        mockMvc.perform(post(RESET_PASSWORD_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resetJson(rawToken, "newSecret1", "newSecret1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Đặt lại mật khẩu thành công"));

        mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("user@example.com", "secret123")))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("user@example.com", "newSecret1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token").isNotEmpty());

        mockMvc.perform(post(RESET_PASSWORD_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resetJson(rawToken, "anotherSecret", "anotherSecret")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Token đặt lại mật khẩu đã được sử dụng"));
    }

    @Test
    void forgotPassword_unknownEmail_returnsGenericMessageWithoutSendingMail() throws Exception {
        mockMvc.perform(post(FORGOT_PASSWORD_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"missing@example.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("Nếu email đã được đăng ký, hướng dẫn đặt lại mật khẩu đã được gửi"));

        verifyNoInteractions(emailService);
        assertEquals(0, passwordResetTokenRepository.count());
    }

    @Test
    void forgotPassword_invalidEmail_returnsValidationError() throws Exception {
        mockMvc.perform(post(FORGOT_PASSWORD_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"not-an-email\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.data.email").value("Email không đúng định dạng"));
    }

    @Test
    void resetPassword_invalidToken_returnsBadRequest() throws Exception {
        mockMvc.perform(post(RESET_PASSWORD_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resetJson("invalid-token", "newSecret1", "newSecret1")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Token đặt lại mật khẩu không hợp lệ"));
    }

    @Test
    void resetPassword_expiredToken_returnsBadRequest() throws Exception {
        register("Nguyen Van A", "user@example.com", "0912345678");
        User user = userRepository.findByEmail("user@example.com").orElseThrow();

        String rawToken = "expired-raw-token";
        PasswordResetToken expiredToken = new PasswordResetToken();
        expiredToken.setUser(user);
        expiredToken.setTokenHash(sha256(rawToken));
        expiredToken.setExpiresAt(LocalDateTime.now().minusMinutes(1));
        expiredToken.setUsed(false);
        passwordResetTokenRepository.saveAndFlush(expiredToken);

        mockMvc.perform(post(RESET_PASSWORD_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resetJson(rawToken, "newSecret1", "newSecret1")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Token đặt lại mật khẩu đã hết hạn"));
    }

    @Test
    void resetPassword_confirmationMismatch_returnsValidationError() throws Exception {
        mockMvc.perform(post(RESET_PASSWORD_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resetJson("some-token", "newSecret1", "different")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.data._global").value("Mật khẩu xác nhận không khớp"));
    }

    private void register(String fullName, String email, String phone) throws Exception {
        mockMvc.perform(post(REGISTER_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson(fullName, email, phone, "secret123", "secret123")))
                .andExpect(status().isCreated());
    }

    private String registerJson(
            String fullName,
            String email,
            String phone,
            String password,
            String confirmPassword
    ) throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("fullName", fullName);
        body.put("email", email);
        body.put("phone", phone);
        body.put("password", password);
        body.put("confirmPassword", confirmPassword);
        return objectMapper.writeValueAsString(body);
    }

    private String loginJson(String email, String password) throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("email", email);
        body.put("password", password);
        return objectMapper.writeValueAsString(body);
    }

    private String resetJson(String token, String newPassword, String confirmPassword) throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("token", token);
        body.put("newPassword", newPassword);
        body.put("confirmPassword", confirmPassword);
        return objectMapper.writeValueAsString(body);
    }

    private String readToken(MvcResult result) throws Exception {
        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
        return root.path("data").path("token").asText();
    }

    private String sha256(String value) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
    }
}
