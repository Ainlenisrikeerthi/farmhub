const API_BASE_URL = "http://localhost:8080/api/payments";

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

export async function createPaymentOrder(amount) {
  const response = await fetch(`${API_BASE_URL}/create-order`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ amount }),
  });
  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}

export async function verifyPayment(paymentData) {
  const response = await fetch(`${API_BASE_URL}/verify`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(paymentData),
  });
  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}
