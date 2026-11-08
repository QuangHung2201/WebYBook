package com.webybook.service;

import com.webybook.dto.request.AdminNamedResourceRequest;
import com.webybook.exception.ResourceNotFoundException;
import com.webybook.repository.AdminReferenceRepository;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class AdminReferenceService {

    private final AdminReferenceRepository repository;

    public AdminReferenceService(AdminReferenceRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> list(String resource, String search) {
        return repository.list(resource, search);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> get(String resource, long id) {
        try {
            return repository.get(resource, id);
        } catch (org.springframework.dao.EmptyResultDataAccessException exception) {
            throw new ResourceNotFoundException("Không tìm thấy dữ liệu");
        }
    }

    @Transactional
    public Map<String, Object> create(String resource, AdminNamedResourceRequest request) {
        long id = repository.create(resource, params(request));
        return get(resource, id);
    }

    @Transactional
    public Map<String, Object> update(String resource, long id, AdminNamedResourceRequest request) {
        get(resource, id);
        repository.update(resource, id, params(request));
        return get(resource, id);
    }

    @Transactional
    public void delete(String resource, long id) {
        get(resource, id);
        repository.delete(resource, id);
    }

    private MapSqlParameterSource params(AdminNamedResourceRequest request) {
        return new MapSqlParameterSource()
                .addValue("name", request.name())
                .addValue("description", request.description())
                .addValue("biography", request.biography())
                .addValue("address", request.address())
                .addValue("phone", request.phone())
                .addValue("email", request.email());
    }
}
