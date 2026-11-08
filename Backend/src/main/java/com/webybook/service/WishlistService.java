package com.webybook.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webybook.repository.WishlistRepository;

@Service
public class WishlistService {

    private final WishlistRepository repository;

    public WishlistService(WishlistRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> list(long userId) {
        return repository.list(userId);
    }

    public void add(long userId, long bookId) {
        repository.add(userId, bookId);
    }

    public void remove(long userId, long bookId) {
        repository.remove(userId, bookId);
    }
}
