package com.webybook.service;

import com.webybook.dto.request.AdminVoucherRequest;
import com.webybook.exception.BadRequestException;
import com.webybook.exception.ResourceNotFoundException;
import com.webybook.repository.AdminVoucherRepository;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class AdminVoucherService {

    private final AdminVoucherRepository repository;

    public AdminVoucherService(AdminVoucherRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> list(String search, String status) {
        return repository.list(search, status);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> get(long id) {
        try {
            return repository.get(id);
        } catch (EmptyResultDataAccessException exception) {
            throw new ResourceNotFoundException("Không tìm thấy voucher");
        }
    }

    @Transactional
    public Map<String, Object> create(AdminVoucherRequest request) {
        validate(request);
        return get(repository.insert(request));
    }

    @Transactional
    public Map<String, Object> update(long id, AdminVoucherRequest request) {
        get(id);
        validate(request);
        repository.update(id, request);
        return get(id);
    }

    @Transactional
    public void disable(long id) {
        get(id);
        repository.disable(id);
    }

    private void validate(AdminVoucherRequest request) {
        if (!request.endDate().isAfter(request.startDate())) {
            throw new BadRequestException("Thời gian kết thúc voucher phải sau thời gian bắt đầu");
        }
        if (!request.discountType().equalsIgnoreCase("fixed")
                && !request.discountType().equalsIgnoreCase("percentage")) {
            throw new BadRequestException("Loại giảm giá không hợp lệ");
        }
        if (request.discountType().equalsIgnoreCase("percentage")
                && request.discountValue().compareTo(java.math.BigDecimal.valueOf(100)) > 0) {
            throw new BadRequestException("Giảm theo phần trăm không được vượt quá 100");
        }
    }
}
