package com.webybook.service;

import com.webybook.dto.request.ContactRequest;
import com.webybook.dto.request.CreateOrderRequest;
import com.webybook.dto.request.CreateReviewRequest;
import com.webybook.repository.CustomerCommerceRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class CustomerCommerceService {
    private final CustomerCommerceRepository repository;
    public CustomerCommerceService(CustomerCommerceRepository repository) { this.repository = repository; }
    public Map<String, Object> cart(long id) { return repository.cart(id); }
    public Map<String, Object> addCart(long id, long book, int qty) { return repository.addCart(id, book, qty); }
    public Map<String, Object> updateCart(long id, long book, int qty) { return repository.updateCart(id, book, qty); }
    public Map<String, Object> clearCart(long id) { return repository.clearCart(id); }
    public Map<String, Object> validateVoucher(String code, BigDecimal subtotal) { return repository.validateVoucher(code, subtotal); }
    public Map<String, Object> createOrder(long id, CreateOrderRequest request) { return repository.createOrder(id, request); }
    public List<Map<String, Object>> orders(long id, String status) { return repository.orders(id, status); }
    public Map<String, Object> order(long order, long user) { return repository.order(order, user); }
    public void cancelOrder(long order, long user) { repository.cancelOrder(order, user); }
    public List<Map<String, Object>> reviews(long book) { return repository.reviews(book); }
    public Map<String, Object> createReview(long user, long book, CreateReviewRequest request) { return repository.createReview(user, book, request); }
    public void removeReview(long user, long review) { repository.removeReview(user, review); }
    public void saveContact(ContactRequest request) { repository.saveContact(request); }
}
