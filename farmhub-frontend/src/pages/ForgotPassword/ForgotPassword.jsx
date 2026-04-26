import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { forgotPassword } from "../../services/authService";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await forgotPassword(email);
      alert(data.message);
      navigate("/login");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Layout>
      <div style={wrapper}>
        <form onSubmit={handleSubmit} style={card}>
          <h1>Forgot Password</h1>
          <p>Enter your registered email. We will send a reset link.</p>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={input}
            required
          />

          <button type="submit" style={btn}>Send Reset Link</button>

          <p onClick={() => navigate("/login")} style={link}>
            Back to Login
          </p>
        </form>
      </div>
    </Layout>
  );
}

const wrapper = { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" };
const card = { width: "100%", maxWidth: "420px", background: "#fff", padding: "28px", borderRadius: "18px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" };
const input = { width: "100%", padding: "12px", marginBottom: "14px", borderRadius: "10px", border: "1px solid #ccc", boxSizing: "border-box" };
const btn = { width: "100%", padding: "12px", border: "none", borderRadius: "10px", background: "green", color: "white", cursor: "pointer", fontWeight: "bold" };
const link = { color: "green", cursor: "pointer", fontWeight: "bold" };

export default ForgotPassword;