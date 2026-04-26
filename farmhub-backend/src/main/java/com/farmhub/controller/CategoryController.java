package com.farmhub.controller;

import com.farmhub.entity.Category;
import com.farmhub.repository.CategoryRepository;
import com.farmhub.repository.ProductRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin("*")
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryController(CategoryRepository categoryRepository,
            ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @PostMapping
    public Category addCategory(@RequestBody Category category) {
        return categoryRepository.save(category);
    }

    @DeleteMapping("/{id}")
    public String deleteCategory(@PathVariable Long id) {
        long linkedProducts = productRepository.countByCategoryId(id);

        if (linkedProducts > 0) {
            throw new RuntimeException(
                    "Cannot delete category. " + linkedProducts + " product(s) are still linked to it.");
        }

        categoryRepository.deleteById(id);
        return "Category deleted successfully";
    }
}
