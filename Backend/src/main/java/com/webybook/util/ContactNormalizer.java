package com.webybook.util;

import java.util.Locale;

public final class ContactNormalizer {

    private ContactNormalizer() {
    }

    public static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    /**
     * Stores Vietnamese phone numbers in the local 0-prefixed format so that
     * "+84912345678" and "0912345678" cannot be registered as two accounts.
     */
    public static String normalizePhone(String phone) {
        if (phone == null) {
            return null;
        }

        String value = phone.trim();
        if (value.startsWith("+84")) {
            return "0" + value.substring(3);
        }
        return value;
    }
}
