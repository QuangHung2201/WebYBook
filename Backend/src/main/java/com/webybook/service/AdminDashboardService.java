package com.webybook.service;

import com.webybook.repository.AdminDashboardRepository;
import com.webybook.exception.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class AdminDashboardService {

    private final AdminDashboardRepository repository;

    public AdminDashboardService(AdminDashboardRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> summary() {
        return repository.summary();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> ordersByStatus() {
        return repository.ordersByStatus();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> topBooks() {
        return repository.topBooks();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> lowStock() {
        return repository.lowStock();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> revenueByDay(LocalDate from, LocalDate to) {
        validateDateRange(from, to);
        return repository.revenueByDay(from, to);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> revenueByWeek(LocalDate from, LocalDate to) {
        validateDateRange(from, to);
        return repository.revenueByWeek(from, to);
    }

    private void validateDateRange(LocalDate from, LocalDate to) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new BadRequestException("Ngày bắt đầu không được sau ngày kết thúc");
        }
    }
}
