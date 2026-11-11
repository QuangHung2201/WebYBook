package com.webybook.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Sách dành cho khu vực khách hàng (storefront). Bổ sung các trường tổng hợp
 * (điểm đánh giá, số lượng đã bán) và thông tin mục lục/đọc thử nếu có dữ liệu.
 */
public record StoreBookResponse(
        Long id,
        Long authorId,
        Long publisherId,
        String publisherName,
        String publisherAddress,
        String publisherPhone,
        String publisherEmail,
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
        List<String> authors,
        BigDecimal averageRating,
        Long reviewCount,
        Long sold,
        String tableOfContents,
        String previewContent,
        Integer previewPageCount,
        LocalDateTime createdAt
) {
}
