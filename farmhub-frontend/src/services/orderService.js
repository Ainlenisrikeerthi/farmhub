import { API_BASE_URL as ROOT_API } from "./api";

const API_BASE_URL = `${ROOT_API}/orders`;

function getAuthHeaders() {
  const token = localStorage.getItem("farmhub_token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function readError(response) {
  const text = await response.text();

  try {
    const data = JSON.parse(text);
    return data.message || text || "Something went wrong";
  } catch {
    return text || "Something went wrong";
  }
}

export async function createOrder(orderData) {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
}

export async function getMyOrders() {
  const response = await fetch(`${API_BASE_URL}/my`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
}

export async function getAllOrders() {
  const response = await fetch(`${API_BASE_URL}/admin/all`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
}

export async function updateOrderStatus(orderId, status) {
  const response = await fetch(`${API_BASE_URL}/admin/${orderId}/status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
}

export async function cancelOrder(orderId) {
  const response = await fetch(`${API_BASE_URL}/${orderId}/cancel`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
}

export async function requestReturn(orderId, reason) {
  const response = await fetch(`${API_BASE_URL}/${orderId}/return`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
}

export async function requestHelp(orderId, message) {
  const response = await fetch(`${API_BASE_URL}/${orderId}/help`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
}