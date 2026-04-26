const API_BASE_URL = "http://localhost:8080/api/auth";

async function readError(response) {
  const text = await response.text();

  try {
    const data = JSON.parse(text);
    return data.message || text || "Something went wrong";
  } catch {
    return text || "Something went wrong";
  }
}

export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}

export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}

export async function verifyEmail(token) {
  const response = await fetch(`${API_BASE_URL}/verify-email?token=${token}`);

  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}

export async function resendVerification(email) {
  const response = await fetch(`${API_BASE_URL}/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}

export async function forgotPassword(email) {
  const response = await fetch(`${API_BASE_URL}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}

export async function resetPassword(token, newPassword) {
  const response = await fetch(`${API_BASE_URL}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });

  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}