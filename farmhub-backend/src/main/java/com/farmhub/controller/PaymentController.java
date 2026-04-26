package com.farmhub.controller;

import com.farmhub.dto.PaymentOrderRequest;
import com.farmhub.dto.PaymentVerifyRequest;
import com.farmhub.entity.Order;
import com.farmhub.service.OrderService;
import com.farmhub.service.PaymentService;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin("*")
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderService orderService;

    public PaymentController(PaymentService paymentService, OrderService orderService) {
        this.paymentService = paymentService;
        this.orderService = orderService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createPaymentOrder(@RequestBody PaymentOrderRequest request) {
        try {
            JSONObject order = paymentService.createRazorpayOrder(request.getAmount());
            return ResponseEntity.ok(order.toMap());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() == null ? "Failed to create Razorpay order" : e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerifyRequest request, Authentication authentication) {
        boolean valid = paymentService.verifyPaymentSignature(request.getRazorpayOrderId(), request.getRazorpayPaymentId(), request.getRazorpaySignature());
        if (!valid) {
            return ResponseEntity.badRequest().body(Map.of("message", "Payment verification failed"));
        }
        try {
            String email = authentication.getName();
            Order savedOrder = orderService.createOrder(request.getOrderData(), email);
            return ResponseEntity.ok(savedOrder);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }
}
