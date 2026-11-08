package com.webybook.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webybook.dto.request.AdminBookRequest;
import com.webybook.dto.response.AdminBookResponse;
import com.webybook.dto.response.PageResponse;
import com.webybook.exception.ResourceNotFoundException;
import com.webybook.repository.AdminCatalogRepository;

@Service
public class AdminCatalogService {

    private final AdminCatalogRepository repository;

    public AdminCatalogService(AdminCatalogRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminBookResponse> listBooks(String search, Long categoryId, int page, int limit) {
        int safePage = Math.max(page, 1);
        int safeLimit = Math.min(Math.max(limit, 1), 100);
        long total = repository.countBooks(search, categoryId);
        return PageResponse.of(repository.findBooks(search, categoryId, safeLimit, (safePage - 1) * safeLimit),
                safePage, safeLimit, total);
    }

    @Transactional(readOnly = true)
    public AdminBookResponse getBook(long id) {
        return repository.findBook(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sách"));
    }

    @Transactional
    public AdminBookResponse createBook(AdminBookRequest request) {
        long id = repository.insertBook(request);
        repository.replaceAuthors(id, request.authorIds());
        return getBook(id);
    }

    @Transactional
    public AdminBookResponse updateBook(long id, AdminBookRequest request) {
        getBook(id);
        repository.updateBook(id, request);
        repository.replaceAuthors(id, request.authorIds());
        return getBook(id);
    }

    @Transactional
    public void deleteBook(long id) {
        getBook(id);
        repository.softDeleteBook(id);
    }
}
