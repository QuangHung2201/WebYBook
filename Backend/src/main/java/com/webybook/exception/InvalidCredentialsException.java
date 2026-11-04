package com.webybook.exception;

import org.springframework.http.HttpStatus;

/**
 * Used for both "email not found" and "wrong password" so the API never
 * reveals whether an account exists.
 */
public class InvalidCredentialsException extends ApiException {

    public InvalidCredentialsException() {
        super(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không chính xác");
    }
}
