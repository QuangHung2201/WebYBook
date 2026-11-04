package com.webybook.security;

import com.webybook.entity.User;
import com.webybook.enums.UserRole;
import com.webybook.enums.UserStatus;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private static final String SECRET = "unit-test-secret-key-that-is-longer-than-32-bytes";
    private static final String ISSUER = "webybook-test";

    private JwtService jwtService;
    private User user;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, 3_600_000, ISSUER);

        user = new User();
        user.setId(10L);
        user.setFullName("Nguyen Van A");
        user.setEmail("user@example.com");
        user.setPhone("0912345678");
        user.setPassword("encoded-password");
        user.setRole(UserRole.CUSTOMER);
        user.setStatus(UserStatus.ACTIVE);
    }

    @Test
    void generateToken_containsExpectedClaims() {
        String token = jwtService.generateToken(user);

        assertEquals("user@example.com", jwtService.extractUsername(token));
        assertEquals(10L, jwtService.parseClaims(token).get("userId", Long.class));
        assertEquals("CUSTOMER", jwtService.parseClaims(token).get("role", String.class));
        assertEquals(ISSUER, jwtService.parseClaims(token).getIssuer());
    }

    @Test
    void validToken_isAcceptedForMatchingUser() {
        String token = jwtService.generateToken(user);
        UserDetails userDetails = new CustomUserDetails(user);

        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void validToken_isRejectedForDifferentUser() {
        String token = jwtService.generateToken(user);

        User otherUser = new User();
        otherUser.setId(11L);
        otherUser.setFullName("Tran Van B");
        otherUser.setEmail("other@example.com");
        otherUser.setPhone("0987654321");
        otherUser.setPassword("encoded-password");
        otherUser.setRole(UserRole.CUSTOMER);
        otherUser.setStatus(UserStatus.ACTIVE);

        assertFalse(jwtService.isTokenValid(token, new CustomUserDetails(otherUser)));
    }

    @Test
    void invalidToken_isRejected() {
        assertFalse(jwtService.isTokenValid("not-a-jwt", new CustomUserDetails(user)));
        assertThrows(JwtException.class, () -> jwtService.extractUsername("not-a-jwt"));
    }

    @Test
    void expiredToken_isRejected() {
        JwtService expiredJwtService = new JwtService(SECRET, -1_000, ISSUER);
        String token = expiredJwtService.generateToken(user);

        assertFalse(expiredJwtService.isTokenValid(token, new CustomUserDetails(user)));
        assertThrows(ExpiredJwtException.class, () -> expiredJwtService.extractUsername(token));
    }

    @Test
    void shortSecret_isRejectedAtStartup() {
        assertThrows(IllegalStateException.class, () -> new JwtService("too-short", 3_600_000, ISSUER));
    }
}
