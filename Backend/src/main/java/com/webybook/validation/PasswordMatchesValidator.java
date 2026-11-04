package com.webybook.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordMatchesValidator implements ConstraintValidator<PasswordMatches, PasswordConfirmable> {

    @Override
    public boolean isValid(PasswordConfirmable request, ConstraintValidatorContext context) {
        if (request == null) {
            return true;
        }

        String password = request.getPassword();
        String confirmPassword = request.getConfirmPassword();

        // Null values are reported by @NotBlank on the individual fields.
        if (password == null || confirmPassword == null) {
            return true;
        }

        return password.equals(confirmPassword);
    }
}
