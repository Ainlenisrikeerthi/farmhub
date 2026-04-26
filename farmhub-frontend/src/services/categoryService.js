import API from "./api";

export const getCategories = async () => {
  const response = await API.get("/categories");
  return response.data;
};

export const addCategory = async (category) => {
  const response = await API.post("/categories", category);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await API.delete(`/categories/${id}`);
  return response.data;
};