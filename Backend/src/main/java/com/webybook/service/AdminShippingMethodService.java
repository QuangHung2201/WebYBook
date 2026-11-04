package com.webybook.service;

import com.webybook.dto.request.AdminShippingMethodRequest;
import com.webybook.exception.ResourceNotFoundException;
import com.webybook.repository.AdminShippingMethodRepository;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class AdminShippingMethodService {

    private final AdminShippingMethodRepository repository;

    public AdminShippingMethodService(AdminShippingMethodRepository repository) {
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
            throw new ResourceNotFoundException("Không tìm thấy phương thức giao hàng");
        }
    }

    @Transactional
    public Map<String, Object> create(AdminShippingMethodRequest request) {
        return get(repository.create(request));
    }

    @Transactional
    public Map<String, Object> update(long id, AdminShippingMethodRequest request) {
        get(id);
        repository.update(id, request);
        return get(id);
    }

    @Transactional
    public void disable(long id) {
        get(id);
        repository.disable(id);
    }
}
