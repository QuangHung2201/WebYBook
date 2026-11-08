package com.webybook.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webybook.dto.response.PageResponse;
import com.webybook.dto.response.StoreBookResponse;
import com.webybook.exception.BadRequestException;
import com.webybook.exception.ResourceNotFoundException;
import com.webybook.repository.StoreBookRepository;

@Service
public class StoreBookService {

    private final StoreBookRepository repository;

    public StoreBookService(StoreBookRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public PageResponse<StoreBookResponse> listBooks(
            String search,
            Long categoryId,
            Long authorId,
            Long publisherId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            BigDecimal minRating,
            String status,
            String sort,
            int page,
            int limit
    ) {
        if (minPrice != null && minPrice.signum() < 0) {
            throw new BadRequestException("Giá thấp nhất không được âm");
        }
        if (maxPrice != null && maxPrice.signum() < 0) {
            throw new BadRequestException("Giá cao nhất không được âm");
        }
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new BadRequestException("Giá thấp nhất không được lớn hơn giá cao nhất");
        }
        if (minRating != null && (minRating.signum() < 0 || minRating.compareTo(BigDecimal.valueOf(5)) > 0)) {
            throw new BadRequestException("Điểm đánh giá phải từ 0 đến 5 sao");
        }

        String safeSearch = search == null ? "" : search.trim();
        int safeLimit = Math.min(Math.max(limit, 1), 100);

        long total = repository.countBooks(safeSearch, categoryId, authorId, publisherId,
                minPrice, maxPrice, minRating, status);
        int totalPages = (int) Math.ceil((double) total / safeLimit);
        int safePage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));
        List<StoreBookResponse> items = repository.findBooks(safeSearch, categoryId, authorId, publisherId,
                minPrice, maxPrice, minRating, status, sort, safeLimit, (safePage - 1) * safeLimit);
        return PageResponse.of(items, safePage, safeLimit, total);
    }

    @Transactional(readOnly = true)
    public Map<Long, Long> countActiveBooksByCategory() {
        return repository.countActiveBooksByCategory();
    }

    /**
     * Tra cứu chi tiết. status = null giữ tương thích với màn hình admin hiện
     * tại (có thể xem cả sách inactive), storefront luôn truyền "active".
     */
    @Transactional(readOnly = true)
    public StoreBookResponse getBook(long id, String status) {
        if (id <= 0) {
            throw new BadRequestException("ID sách không hợp lệ");
        }
        return repository.findBook(id, status)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sách"));
    }

    @Transactional(readOnly = true)
    public List<StoreBookResponse> relatedBooks(long id, int limit) {
        if (id <= 0) {
            throw new BadRequestException("ID sách không hợp lệ");
        }
        StoreBookResponse book = getBook(id, null);
        int safeLimit = Math.min(Math.max(limit, 1), 20);
        List<StoreBookResponse> books = repository.findBooks("", book.categoryId(), null, null,
                null, null, null, "active", "bestseller", safeLimit + 1, 0);
        return books.stream()
                .filter(item -> !item.id().equals(id))
                .limit(safeLimit)
                .toList();
    }
}
