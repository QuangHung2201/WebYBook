package com.webybook.service;

import com.webybook.dto.request.AdminUserUpdateRequest;
import com.webybook.exception.ResourceNotFoundException;
import com.webybook.repository.AdminUserRepository;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class AdminUserService {

    private final AdminUserRepository repository;

    public AdminUserService(AdminUserRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> list(String search) {
        return repository.list(search);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> get(long id) {
        try {
            return repository.get(id);
        } catch (EmptyResultDataAccessException exception) {
            throw new ResourceNotFoundException("Không tìm thấy người dùng");
        }
    }

    @Transactional
    public Map<String, Object> update(long id, AdminUserUpdateRequest request) {
        get(id);
        repository.update(id, request);
        return get(id);
    }

}
