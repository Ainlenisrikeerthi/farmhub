package com.farmhub.repository;

import com.farmhub.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserEmailOrderByCreatedAtDesc(String userEmail);

    List<Order> findAllByOrderByCreatedAtDesc();
}
