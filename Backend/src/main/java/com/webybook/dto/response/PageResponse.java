package com.webybook.dto.response;

import java.util.List;

public record PageResponse<T>(
        List<T> items,
        int page,
        int limit,
        long total,
        int totalPages
) {
    public static <T> PageResponse<T> of(List<T> items, int page, int limit, long total) {
        int totalPages = limit == 0 ? 0 : (int) Math.ceil((double) total / limit);
        return new PageResponse<>(items, page, limit, total, totalPages);
    }
}
