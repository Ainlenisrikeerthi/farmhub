package com.farmhub.dto;

import java.util.List;

public class OrderRequest {
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
    private String paymentMethod;
    private List<OrderItemRequest> items;

    public OrderRequest() {
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

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public List<OrderItemRequest> getItems() {
        return items;
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

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
}
