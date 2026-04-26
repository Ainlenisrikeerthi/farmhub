package com.farmhub.service;

import com.farmhub.entity.Order;
import com.farmhub.entity.OrderItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${farmhub.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOrderConfirmation(String to, Order order) {
        if (!mailEnabled || to == null || to.isBlank() || fromAddress == null || fromAddress.startsWith("PASTE_")) {
            return;
        }
        StringBuilder body = new StringBuilder();
        body.append("Hi ").append(order.getCustomerName()).append(",\n\n");
        body.append("Your Farm Hub order #").append(order.getId()).append(" has been placed successfully.\n");
        body.append("Status: ").append(order.getStatus()).append("\n");
        body.append("Estimated delivery: ").append(order.getEstimatedDelivery()).append("\n");
        body.append("Total: ₹ ").append(order.getTotalAmount()).append("\n\nItems:\n");
        for (OrderItem item : order.getItems()) {
            body.append("- ").append(item.getProductName()).append(" x ").append(item.getQuantity()).append("\n");
        }
        body.append("\nThank you for ordering from Farm Hub.\nFresh From Our Farm");

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject("Farm Hub Order Confirmation #" + order.getId());
        message.setText(body.toString());
        mailSender.send(message);
    }
}
