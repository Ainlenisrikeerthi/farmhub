import API from "./api";

export const getProducts = async () => {
  const response = await API.get("/products");
  return response.data;
};

export const getProductsPage = async ({ page = 0, size = 8, keyword = "", categoryId = "" } = {}) => {
  const params = { page, size };
  if (keyword) params.keyword = keyword;
  if (categoryId) params.categoryId = categoryId;
  const response = await API.get("/products/page", { params });
  return response.data;
};

export const searchProducts = async (keyword) => {
  const response = await API.get("/products/search", { params: { keyword } });
  return response.data;
};

export const addProduct = async (product) => {
  const response = await API.post("/products", product);
  return response.data;
};

export const updateProduct = async (id, product) => {
  const response = await API.put(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await API.delete(`/products/${id}`);
  return response.data;
};
