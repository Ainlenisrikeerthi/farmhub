import { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../../components/Layout";
import { AuthContext } from "../../context/AuthContext";
import { resendVerification } from "../../services/authService";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const redirectPath = location.state?.from || "/";

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleResendVerification = async () => {
    if (!formData.email.trim()) {
      alert("Please enter your email first");
      return;
    }

    try {
      const data = await resendVerification(formData.email.trim());
      alert(data.message);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(formData.email, formData.password);
      alert("Login successful");
      navigate(redirectPath, { replace: true });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Layout>
      <div style={wrapper}>
        <form onSubmit={handleSubmit} style={formCard}>
          <h1>Login</h1>
          <p style={{ color: "#666" }}>Welcome back to Farm Hub</p>

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
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            style={input}
            required
          />

          <div style={linkRow}>
            <span onClick={() => navigate("/forgot-password")} style={forgotText}>
              Forgot Password?
            </span>

            <span onClick={handleResendVerification} style={resendText}>
              Resend Verification
            </span>
          </div>

          <button type="submit" style={primaryButton}>
            Login
          </button>

          <p style={{ marginTop: "16px" }}>
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              style={{ color: "green", cursor: "pointer", fontWeight: "bold" }}
            >
              Sign up
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
  marginBottom: "10px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
};

const linkRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  flexWrap: "wrap",
  margin: "0 0 14px 0",
};

const forgotText = {
  color: "green",
  cursor: "pointer",
  fontWeight: "bold",
};

const resendText = {
  color: "#ff9800",
  cursor: "pointer",
  fontWeight: "bold",
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

export default Login;