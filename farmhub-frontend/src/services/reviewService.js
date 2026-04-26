import API from "./api";

export const getProductReviews = async (productId) => {
  const response = await API.get(`/reviews/product/${productId}`);
  return response.data;
};

export const getRatingSummary = async (productId) => {
  const response = await API.get(`/reviews/product/${productId}/summary`);
  return response.data;
};

export const addReview = async ({ productId, rating, comment }) => {
  const response = await API.post("/reviews", { productId, rating, comment });
  return response.data;
};
