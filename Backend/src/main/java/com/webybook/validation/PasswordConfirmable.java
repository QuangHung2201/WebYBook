package com.webybook.validation;

/**
 * Implemented by request DTOs that contain a password and its confirmation.
 */
public interface PasswordConfirmable {
    String getPassword();

    String getConfirmPassword();
}
