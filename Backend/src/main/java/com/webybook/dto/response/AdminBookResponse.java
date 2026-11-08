package com.webybook.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record AdminBookResponse(
        Long id,
        Long publisherId,
        String publisherName,
        Long categoryId,
        String categoryName,
        String isbn,
        String title,
        String description,
        BigDecimal price,
        BigDecimal originalPrice,
        Integer pageCount,
        Integer stockQuantity,
        String coverImage,
        String status,
        List<String> authors
) {
}
