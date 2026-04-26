package com.farmhub.service;

import com.farmhub.dto.OrderItemRequest;
import com.farmhub.dto.OrderRequest;
import com.farmhub.entity.*;
import com.farmhub.repository.OrderRepository;
import com.farmhub.util.DeliveryUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final EmailService emailService;
    private final JavaMailSender mailSender;

    @Value("${farmhub.support.email:farmhub@example.com}")
    private String supportEmail;

    public OrderService(
            OrderRepository orderRepository,
            EmailService emailService,
            JavaMailSender mailSender) {
        this.orderRepository = orderRepository;
        this.emailService = emailService;
        this.mailSender = mailSender;
    }

    public Order createOrder(OrderRequest request, String userEmail) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Order must contain at least one item");
        }

        boolean hasFarmDelivery = request.getItems().stream()
                .anyMatch(item -> "FARM_DELIVERY".equalsIgnoreCase(item.getDeliveryType()));

        boolean hasCourier = request.getItems().stream()
                .anyMatch(item -> "COURIER".equalsIgnoreCase(item.getDeliveryType()));

        Order order = new Order();
        order.setCustomerName(request.getCustomerName());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setFlatNo(request.getFlatNo());
        order.setStreetAddress(request.getStreetAddress());
        order.setCity(request.getCity());
        order.setPincode(request.getPincode());
        order.setSubtotal(request.getSubtotal());
        order.setDiscountAmount(request.getDiscountAmount());
        order.setTotalAmount(request.getTotalAmount());
        order.setCouponCode(request.getCouponCode());
        order.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod()));
        order.setUserEmail(userEmail);

        if (hasFarmDelivery) {
            if (request.getSelectedLat() == null || request.getSelectedLng() == null) {
                throw new RuntimeException("Location is required for fresh delivery items");
            }

            double actualDistance = DeliveryUtil.calculateDistanceFromFarm(
                    request.getSelectedLat(),
                    request.getSelectedLng());

            if (actualDistance > 10.0) {
                throw new RuntimeException("Fresh delivery not available beyond 10 km");
            }

            order.setSelectedLat(request.getSelectedLat());
            order.setSelectedLng(request.getSelectedLng());
            order.setDeliveryDistanceKm(actualDistance);
            order.setDeliveryType(hasCourier ? "MIXED" : "FARM_DELIVERY");
        } else {
            order.setSelectedLat(request.getSelectedLat());
            order.setSelectedLng(request.getSelectedLng());
            order.setDeliveryDistanceKm(request.getDeliveryDistanceKm());
            order.setDeliveryType("COURIER");
        }

        order.setEstimatedDelivery(calculateEstimatedDelivery(order.getDeliveryType()));
        order.setStatus(OrderStatus.ORDER_PLACED);

        for (OrderItemRequest itemRequest : request.getItems()) {
            OrderItem item = new OrderItem();
            item.setProductId(itemRequest.getProductId());
            item.setProductName(itemRequest.getProductName());
            item.setPrice(itemRequest.getPrice());
            item.setQuantity(itemRequest.getQuantity());
            item.setUnit(itemRequest.getUnit());
            order.addItem(item);
        }

        Order saved = orderRepository.save(order);

        try {
            emailService.sendOrderConfirmation(userEmail, saved);
        } catch (Exception ex) {
            System.out.println("Email confirmation skipped/failed: " + ex.getMessage());
        }

        return saved;
    }

    private String calculateEstimatedDelivery(String deliveryType) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy");

        if ("FARM_DELIVERY".equalsIgnoreCase(deliveryType)) {
            return "Today / Next Day (by " + LocalDate.now().plusDays(1).format(formatter) + ")";
        }

        if ("MIXED".equalsIgnoreCase(deliveryType)) {
            return "Fresh items: Today / Next Day; Courier items: 3-5 Business Days";
        }

        return "3-5 Business Days (by " + LocalDate.now().plusDays(5).format(formatter) + ")";
    }

    public List<Order> getUserOrders(String userEmail) {
        return orderRepository.findByUserEmailOrderByCreatedAtDesc(userEmail);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        OrderStatus newStatus = OrderStatus.valueOf(status);
        validateStatusTransition(order, newStatus);

        order.setStatus(newStatus);

        if (newStatus == OrderStatus.DELIVERED && order.getDeliveredAt() == null) {
            order.setDeliveredAt(LocalDateTime.now());
        }

        return orderRepository.save(order);
    }

    public Order cancelOrder(Long orderId, String userEmail) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUserEmail().equals(userEmail)) {
            throw new RuntimeException("You cannot cancel this order");
        }

        if (order.getStatus() == OrderStatus.SHIPPED ||
                order.getStatus() == OrderStatus.OUT_FOR_DELIVERY ||
                order.getStatus() == OrderStatus.DELIVERED ||
                order.getStatus() == OrderStatus.RETURN_REQUESTED ||
                order.getStatus() == OrderStatus.RETURNED) {
            throw new RuntimeException("Order cannot be cancelled after shipping/out for delivery");
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Order is already cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    public Order requestReturn(Long orderId, String userEmail, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUserEmail().equals(userEmail)) {
            throw new RuntimeException("You cannot return this order");
        }

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException("Return is available only after delivery");
        }

        if (order.getDeliveredAt() == null) {
            throw new RuntimeException("Delivery date not found");
        }

        LocalDateTime now = LocalDateTime.now();
        boolean allowed;

        if ("FARM_DELIVERY".equalsIgnoreCase(order.getDeliveryType())) {
            allowed = order.getDeliveredAt().toLocalDate().isEqual(now.toLocalDate());
        } else {
            allowed = !now.isAfter(order.getDeliveredAt().plusDays(3));
        }

        if (!allowed) {
            throw new RuntimeException("Return window expired");
        }

        order.setStatus(OrderStatus.RETURN_REQUESTED);
        order.setReturnRequestedAt(now);
        order.setReturnReason(reason);

        return orderRepository.save(order);
    }

    public Order requestHelp(Long orderId, String userEmail, String messageText) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUserEmail().equals(userEmail)) {
            throw new RuntimeException("You cannot request help for this order");
        }

        order.setHelpRequestedAt(LocalDateTime.now());
        order.setHelpMessage(messageText);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(supportEmail);
        message.setSubject("Farm Hub Help Request - Order #" + order.getId());
        message.setText(
                "Customer Email: " + userEmail + "\n" +
                        "Order ID: " + order.getId() + "\n" +
                        "Customer Name: " + order.getCustomerName() + "\n" +
                        "Phone: " + order.getCustomerPhone() + "\n\n" +
                        "Message:\n" + messageText);

        mailSender.send(message);

        return orderRepository.save(order);
    }

    private void validateStatusTransition(Order order, OrderStatus newStatus) {
        String deliveryType = order.getDeliveryType();

        if (newStatus == OrderStatus.CANCELLED ||
                newStatus == OrderStatus.RETURN_REQUESTED ||
                newStatus == OrderStatus.RETURN_APPROVED ||
                newStatus == OrderStatus.RETURN_REJECTED ||
                newStatus == OrderStatus.RETURNED) {
            return;
        }

        if ("FARM_DELIVERY".equalsIgnoreCase(deliveryType)) {
            if (!(newStatus == OrderStatus.ORDER_PLACED ||
                    newStatus == OrderStatus.PREPARING ||
                    newStatus == OrderStatus.OUT_FOR_DELIVERY ||
                    newStatus == OrderStatus.DELIVERED)) {
                throw new RuntimeException("Invalid status for farm delivery order");
            }
        } else if ("COURIER".equalsIgnoreCase(deliveryType)) {
            if (!(newStatus == OrderStatus.ORDER_PLACED ||
                    newStatus == OrderStatus.PACKED ||
                    newStatus == OrderStatus.SHIPPED ||
                    newStatus == OrderStatus.OUT_FOR_DELIVERY ||
                    newStatus == OrderStatus.DELIVERED)) {
                throw new RuntimeException("Invalid status for courier order");
            }
        } else if ("MIXED".equalsIgnoreCase(deliveryType)) {
            if (!(newStatus == OrderStatus.ORDER_PLACED ||
                    newStatus == OrderStatus.PREPARING ||
                    newStatus == OrderStatus.PACKED ||
                    newStatus == OrderStatus.SHIPPED ||
                    newStatus == OrderStatus.OUT_FOR_DELIVERY ||
                    newStatus == OrderStatus.DELIVERED)) {
                throw new RuntimeException("Invalid status for mixed delivery order");
            }
        }
    }
}