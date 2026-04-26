package com.farmhub.controller;

import com.farmhub.dto.OrderRequest;
import com.farmhub.dto.OrderStatusUpdateRequest;
import com.farmhub.entity.Order;
import com.farmhub.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin("*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestBody OrderRequest request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            return ResponseEntity.ok(orderService.createOrder(request, email));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<Order>> getMyOrders(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(orderService.getUserOrders(email));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/admin/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody OrderStatusUpdateRequest request) {
        try {
            return ResponseEntity.ok(orderService.updateOrderStatus(orderId, request.getStatus()));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long orderId,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(
                    orderService.cancelOrder(orderId, authentication.getName()));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/{orderId}/return")
    public ResponseEntity<?> requestReturn(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(
                    orderService.requestReturn(
                            orderId,
                            authentication.getName(),
                            request.getOrDefault("reason", "No reason provided")));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/{orderId}/help")
    public ResponseEntity<?> requestHelp(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(
                    orderService.requestHelp(
                            orderId,
                            authentication.getName(),
                            request.getOrDefault("message", "Need help with this order")));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }
}
