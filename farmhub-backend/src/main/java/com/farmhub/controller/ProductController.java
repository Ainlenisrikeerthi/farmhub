package com.farmhub.controller;

import com.farmhub.entity.Product;
import com.farmhub.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin("*")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @GetMapping("/page")
    public Page<Product> getProductsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId
    ) {
        Pageable pageable = PageRequest.of(page, size);
        if (categoryId != null) {
            return productRepository.findByCategoryId(categoryId, pageable);
        }
        if (keyword != null && !keyword.isBlank()) {
            return productRepository.findByNameContainingIgnoreCase(keyword, pageable);
        }
        return productRepository.findAll(pageable);
    }

    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword);
    }

    @GetMapping("/{id}")
    public Optional<Product> getProductById(@PathVariable Long id) {
        return productRepository.findById(id);
    }

    @PostMapping
    public Product addProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }

    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product updatedProduct) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setName(updatedProduct.getName());
                    product.setDescription(updatedProduct.getDescription());
                    product.setPrice(updatedProduct.getPrice());
                    product.setUnit(updatedProduct.getUnit());
                    product.setStock(updatedProduct.getStock());
                    product.setImageUrl(updatedProduct.getImageUrl());
                    product.setDeliveryType(updatedProduct.getDeliveryType());
                    product.setDeliveryRadiusKm(updatedProduct.getDeliveryRadiusKm());
                    product.setHarvestDate(updatedProduct.getHarvestDate());
                    product.setFreshnessLabel(updatedProduct.getFreshnessLabel());
                    product.setCategory(updatedProduct.getCategory());
                    return productRepository.save(product);
                })
                .orElseThrow(() -> new RuntimeException("Product not found with id " + id));
    }

    @PatchMapping("/{id}")
    public Product partialUpdateProduct(@PathVariable Long id, @RequestBody Product updatedProduct) {
        return productRepository.findById(id)
                .map(product -> {
                    if (updatedProduct.getName() != null) product.setName(updatedProduct.getName());
                    if (updatedProduct.getPrice() != null) product.setPrice(updatedProduct.getPrice());
                    if (updatedProduct.getImageUrl() != null) product.setImageUrl(updatedProduct.getImageUrl());
                    if (updatedProduct.getDescription() != null) product.setDescription(updatedProduct.getDescription());
                    if (updatedProduct.getFreshnessLabel() != null) product.setFreshnessLabel(updatedProduct.getFreshnessLabel());
                    return productRepository.save(product);
                })
                .orElseThrow(() -> new RuntimeException("Product not found with id " + id));
    }

    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
        return "Product deleted successfully";
    }
}
