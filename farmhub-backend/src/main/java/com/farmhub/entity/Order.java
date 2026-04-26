package com.farmhub.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String customerName;
    private String customerPhone;

    private String flatNo;
    private String streetAddress;
    private String city;
    private String pincode;

    private Double selectedLat;
    private Double selectedLng;
    private Double deliveryDistanceKm;

    private Double subtotal;
    private Double discountAmount;
    private Double totalAmount;

    private String couponCode;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private String deliveryType;
    private String estimatedDelivery;

    private String userEmail;

    private LocalDateTime createdAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime cancelledAt;
    private LocalDateTime returnRequestedAt;
    private String returnReason;
    private LocalDateTime helpRequestedAt;
    private String helpMessage;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<OrderItem> items = new ArrayList<>();

    public Order() {
    }

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }

    public void addItem(OrderItem item) {
        item.setOrder(this);
        this.items.add(item);
    }

    public Long getId() {
        return id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public String getFlatNo() {
        return flatNo;
    }

    public String getStreetAddress() {
        return streetAddress;
    }

    public String getCity() {
        return city;
    }

    public String getPincode() {
        return pincode;
    }

    public Double getSelectedLat() {
        return selectedLat;
    }

    public Double getSelectedLng() {
        return selectedLng;
    }

    public Double getDeliveryDistanceKm() {
        return deliveryDistanceKm;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public Double getDiscountAmount() {
        return discountAmount;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public String getDeliveryType() {
        return deliveryType;
    }

    public String getEstimatedDelivery() {
        return estimatedDelivery;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public LocalDateTime getReturnRequestedAt() {
        return returnRequestedAt;
    }

    public String getReturnReason() {
        return returnReason;
    }

    public LocalDateTime getHelpRequestedAt() {
        return helpRequestedAt;
    }

    public String getHelpMessage() {
        return helpMessage;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public void setFlatNo(String flatNo) {
        this.flatNo = flatNo;
    }

    public void setStreetAddress(String streetAddress) {
        this.streetAddress = streetAddress;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public void setSelectedLat(Double selectedLat) {
        this.selectedLat = selectedLat;
    }

    public void setSelectedLng(Double selectedLng) {
        this.selectedLng = selectedLng;
    }

    public void setDeliveryDistanceKm(Double deliveryDistanceKm) {
        this.deliveryDistanceKm = deliveryDistanceKm;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public void setDiscountAmount(Double discountAmount) {
        this.discountAmount = discountAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public void setDeliveryType(String deliveryType) {
        this.deliveryType = deliveryType;
    }

    public void setEstimatedDelivery(String estimatedDelivery) {
        this.estimatedDelivery = estimatedDelivery;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public void setReturnRequestedAt(LocalDateTime returnRequestedAt) {
        this.returnRequestedAt = returnRequestedAt;
    }

    public void setReturnReason(String returnReason) {
        this.returnReason = returnReason;
    }

    public void setHelpRequestedAt(LocalDateTime helpRequestedAt) {
        this.helpRequestedAt = helpRequestedAt;
    }

    public void setHelpMessage(String helpMessage) {
        this.helpMessage = helpMessage;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }
}