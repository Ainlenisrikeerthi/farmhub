import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { resetPassword } from "../../services/authService";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Invalid reset link");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const data = await resetPassword(token, password);
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
          <h1>Reset Password</h1>

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
            required
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={input}
            required
          />

          <button type="submit" style={btn}>Reset Password</button>
        </form>
      </div>
    </Layout>
  );
}

const wrapper = { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" };
const card = { width: "100%", maxWidth: "420px", background: "#fff", padding: "28px", borderRadius: "18px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" };
const input = { width: "100%", padding: "12px", marginBottom: "14px", borderRadius: "10px", border: "1px solid #ccc", boxSizing: "border-box" };
const btn = { width: "100%", padding: "12px", border: "none", borderRadius: "10px", background: "green", color: "white", cursor: "pointer", fontWeight: "bold" };

export default ResetPassword;