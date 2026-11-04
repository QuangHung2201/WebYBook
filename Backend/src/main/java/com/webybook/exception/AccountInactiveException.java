package com.webybook.exception;

import org.springframework.http.HttpStatus;

public class AccountInactiveException extends ApiException {

    public AccountInactiveException() {
        super(HttpStatus.FORBIDDEN, "Tài khoản đã bị khóa hoặc không hoạt động");
    }
}
