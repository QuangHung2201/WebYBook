package com.webybook.dto.request;

import jakarta.validation.constraints.NotNull;

public record WishlistItemRequest(
        @NotNull(message = "Vui lòng chọn sách") Long bookId
) {
}
