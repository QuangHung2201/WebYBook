package com.webybook.service;

import com.webybook.dto.request.AdminOrderStatusRequest;
import com.webybook.exception.BadRequestException;
import com.webybook.exception.ResourceNotFoundException;
import com.webybook.repository.AdminOrderRepository;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class AdminOrderService {

    private static final Map<String, Set<String>> TRANSITIONS = Map.of(
            "pending", Set.of("delivered", "rejected"),
            "delivered", Set.of(),
            "rejected", Set.of()
    );

    private final AdminOrderRepository repository;

    public AdminOrderService(AdminOrderRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> list(String status) {
        return repository.list(status);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> detail(long id) {
        try {
            Map<String, Object> order = repository.get(id);
            order.put("items", repository.items(id));
            return order;
        } catch (EmptyResultDataAccessException exception) {
            throw new ResourceNotFoundException("Không tìm thấy đơn hàng");
        }
    }

    @Transactional
    public Map<String, Object> updateStatus(long id, AdminOrderStatusRequest request, Long changedBy) {
        Map<String, Object> order = detail(id);
        String oldStatus = String.valueOf(order.get("status"));
        String newStatus = request.status().toLowerCase();
        if (!TRANSITIONS.getOrDefault(oldStatus, Set.of()).contains(newStatus)) {
            throw new BadRequestException("Không thể chuyển trạng thái đơn hàng từ "
                    + oldStatus + " sang " + newStatus);
        }
        repository.updateStatus(id, oldStatus, newStatus, request.note(), changedBy);
        return detail(id);
    }

    @Transactional
    public Map<String, Object> confirmCodPayment(long id) {
        Map<String, Object> order = detail(id);
        if (!"COD".equalsIgnoreCase(String.valueOf(order.get("paymentMethod")))) {
            throw new BadRequestException("Chỉ đơn COD mới có thể xác nhận thu tiền");
        }
        return repository.confirmCodPayment(id);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> history(long id) {
        detail(id);
        return repository.history(id);
    }
}
