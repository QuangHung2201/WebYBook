package com.webybook.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webybook.dto.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public RestAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {
        boolean accountInactive = JwtAuthenticationFilter.ACCOUNT_INACTIVE.equals(
                request.getAttribute(JwtAuthenticationFilter.AUTH_ERROR_ATTRIBUTE)
        );

        int status = accountInactive ? HttpServletResponse.SC_FORBIDDEN : HttpServletResponse.SC_UNAUTHORIZED;
        String message = accountInactive
                ? "Tài khoản đã bị khóa hoặc không hoạt động"
                : "Chưa xác thực hoặc token không hợp lệ";

        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        objectMapper.writeValue(response.getWriter(), ApiResponse.failure(message));
    }
}
