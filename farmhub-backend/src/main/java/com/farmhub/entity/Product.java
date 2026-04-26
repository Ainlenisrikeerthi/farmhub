package com.farmhub.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private Double price;
    private String unit;
    private Integer stock;
    private String imageUrl;
    private String deliveryType;
    private String trackingType;
    private Integer deliveryRadiusKm;
    private LocalDate harvestDate;
    private String freshnessLabel;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    public Product() {
    }

    public Product(Long id, String name, String description, Double price, String unit, Integer stock,
            String imageUrl, String deliveryType, String trackingType, Integer deliveryRadiusKm,
            LocalDate harvestDate, String freshnessLabel, Category category) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.unit = unit;
        this.stock = stock;
        this.imageUrl = imageUrl;
        this.deliveryType = deliveryType;
        this.trackingType = trackingType;
        this.deliveryRadiusKm = deliveryRadiusKm;
        this.harvestDate = harvestDate;
        this.freshnessLabel = freshnessLabel;
        this.category = category;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getDeliveryType() {
        return deliveryType;
    }

    public void setDeliveryType(String deliveryType) {
        this.deliveryType = deliveryType;
    }

    public String getTrackingType() {
        return trackingType;
    }

    public void setTrackingType(String trackingType) {
        this.trackingType = trackingType;
    }

    public Integer getDeliveryRadiusKm() {
        return deliveryRadiusKm;
    }

    public void setDeliveryRadiusKm(Integer deliveryRadiusKm) {
        this.deliveryRadiusKm = deliveryRadiusKm;
    }

    public LocalDate getHarvestDate() {
        return harvestDate;
    }

    public void setHarvestDate(LocalDate harvestDate) {
        this.harvestDate = harvestDate;
    }

    public String getFreshnessLabel() {
        return freshnessLabel;
    }

    public void setFreshnessLabel(String freshnessLabel) {
        this.freshnessLabel = freshnessLabel;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }
}
