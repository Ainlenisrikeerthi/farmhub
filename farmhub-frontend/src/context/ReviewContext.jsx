import { createContext, useEffect, useState } from "react";

export const ReviewContext = createContext();

export function ReviewProvider({ children }) {
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem("farmhub_reviews");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("farmhub_reviews", JSON.stringify(reviews));
  }, [reviews]);

  const addReview = (productId, review) => {
    setReviews((prev) => {
      const existing = prev[productId] || [];
      return {
        ...prev,
        [productId]: [review, ...existing],
      };
    });
  };

  const getProductReviews = (productId) => {
    return reviews[productId] || [];
  };

  const getAverageRating = (productId) => {
    const productReviews = reviews[productId] || [];
    if (productReviews.length === 0) return 0;

    const total = productReviews.reduce((sum, review) => sum + review.rating, 0);
    return total / productReviews.length;
  };

  return (
    <ReviewContext.Provider
      value={{
        addReview,
        getProductReviews,
        getAverageRating,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}