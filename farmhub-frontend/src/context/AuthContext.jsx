import { createContext, useEffect, useState } from "react";
import { loginUser, registerUser } from "../services/authService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("farmhub_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("farmhub_token") || null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("farmhub_user", JSON.stringify(user));
    else localStorage.removeItem("farmhub_user");
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem("farmhub_token", token);
    else localStorage.removeItem("farmhub_token");
  }, [token]);

  const clearSessionData = () => {
    localStorage.removeItem("cart");
    localStorage.removeItem("wishlist");
    localStorage.removeItem("farmhub_cart");
    localStorage.removeItem("farmhub_wishlist");
  };

  const signup = async (formData) => {
    const response = await registerUser({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });

    clearSessionData();

    setToken(response.token);
    setUser({
      name: response.name,
      email: response.email,
      role: response.role,
    });
  };

  const login = async (email, password) => {
    const response = await loginUser({ email, password });

    clearSessionData();

    setToken(response.token);
    setUser({
      name: response.name,
      email: response.email,
      role: response.role,
    });
  };

  const logout = () => {
    clearSessionData();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}