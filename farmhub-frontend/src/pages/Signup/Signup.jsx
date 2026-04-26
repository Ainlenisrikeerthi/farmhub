import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { AuthContext } from "../../context/AuthContext";

function Signup() {
  const navigate = useNavigate();
  const { signup } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const data = await signup(formData);
alert(data.message || "Signup successful. Please verify your email.");
navigate("/login");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Layout>
      <div style={wrapper}>
        <form onSubmit={handleSubmit} style={formCard}>
          <h1>Create Account</h1>
          <p style={{ color: "#666" }}>Join Farm Hub today</p>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            style={input}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={input}
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            style={input}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            style={input}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            style={input}
            required
          />

          <button type="submit" style={primaryButton}>
            Sign Up
          </button>

          <p style={{ marginTop: "16px" }}>
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              style={{ color: "green", cursor: "pointer", fontWeight: "bold" }}
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </Layout>
  );
}

const wrapper = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "70vh",
};

const formCard = {
  width: "100%",
  maxWidth: "420px",
  background: "#fff",
  padding: "28px",
  borderRadius: "18px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

const input = {
  width: "100%",
  padding: "12px",
  marginBottom: "14px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
};

const primaryButton = {
  width: "100%",
  padding: "12px",
  border: "none",
  borderRadius: "10px",
  background: "green",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};

export default Signup;