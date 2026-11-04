package com.webybook.service;

import com.webybook.exception.ResourceNotFoundException;
import com.webybook.repository.AdminReviewRepository;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class AdminReviewService {

    private final AdminReviewRepository repository;

    public AdminReviewService(AdminReviewRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> list(String status, String search) {
        return repository.list(status, search);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> get(long id) {
        try {
            return repository.get(id);
        } catch (EmptyResultDataAccessException exception) {
            throw new ResourceNotFoundException("Không tìm thấy đánh giá");
        }
    }

    @Transactional
    public Map<String, Object> updateStatus(long id, String status) {
        get(id);
        repository.updateStatus(id, status);
        return get(id);
    }

    @Transactional
    public void delete(long id) {
        get(id);
        repository.delete(id);
    }
}
