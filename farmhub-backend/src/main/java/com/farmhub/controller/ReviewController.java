package com.farmhub.controller;

import com.farmhub.dto.RatingSummary;
import com.farmhub.dto.ReviewRequest;
import com.farmhub.entity.Review;
import com.farmhub.entity.User;
import com.farmhub.repository.ReviewRepository;
import com.farmhub.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin("*")
public class ReviewController {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public ReviewController(ReviewRepository reviewRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/product/{productId}")
    public List<Review> getProductReviews(@PathVariable Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    @GetMapping("/product/{productId}/summary")
    public RatingSummary getRatingSummary(@PathVariable Long productId) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        double average = reviews.stream().mapToInt(r -> r.getRating() == null ? 0 : r.getRating()).average().orElse(0.0);
        return new RatingSummary(average, reviews.size());
    }

    @PostMapping
    public ResponseEntity<?> addReview(@RequestBody ReviewRequest request, Authentication authentication) {
        if (request.getProductId() == null || request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            return ResponseEntity.badRequest().body(Map.of("message", "Valid product and rating are required"));
        }
        if (request.getComment() == null || request.getComment().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Review comment is required"));
        }
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        Review review = new Review();
        review.setProductId(request.getProductId());
        review.setUserEmail(email);
        review.setUserName(user != null ? user.getName() : email);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        return ResponseEntity.ok(reviewRepository.save(review));
    }
}
