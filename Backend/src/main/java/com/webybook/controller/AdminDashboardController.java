package com.webybook.controller;

import com.webybook.dto.response.ApiResponse;
import com.webybook.service.AdminDashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService service;

    public AdminDashboardController(AdminDashboardService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<Map<String, Object>> summary() {
        return ApiResponse.success("Lấy thống kê dashboard thành công", service.summary());
    }

    @GetMapping("/orders-by-status")
    public ApiResponse<List<Map<String, Object>>> ordersByStatus() {
        return ApiResponse.success("Lấy thống kê trạng thái đơn hàng thành công", service.ordersByStatus());
    }

    @GetMapping("/top-selling-books")
    public ApiResponse<List<Map<String, Object>>> topBooks() {
        return ApiResponse.success("Lấy sách bán chạy thành công", service.topBooks());
    }

    @GetMapping("/low-stock")
    public ApiResponse<List<Map<String, Object>>> lowStock() {
        return ApiResponse.success("Lấy danh sách sách sắp hết hàng thành công", service.lowStock());
    }

    @GetMapping("/revenue/daily")
    public ApiResponse<List<Map<String, Object>>> revenueByDay(
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to
    ) {
        return ApiResponse.success("Lấy doanh thu theo ngày thành công", service.revenueByDay(from, to));
    }

    @GetMapping("/revenue/weekly")
    public ApiResponse<List<Map<String, Object>>> revenueByWeek(
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to
    ) {
        return ApiResponse.success("Lấy doanh thu theo tuần thành công", service.revenueByWeek(from, to));
    }
}
