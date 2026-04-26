import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { verifyEmail } from "../../services/authService";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setMessage("Invalid verification link");
      return;
    }

    verifyEmail(token)
      .then((data) => setMessage(data.message))
      .catch((error) => setMessage(error.message));
  }, [searchParams]);

  return (
    <Layout>
      <div style={box}>
        <h1>Email Verification</h1>
        <p>{message}</p>
        <button onClick={() => navigate("/login")} style={btn}>
          Go to Login
        </button>
      </div>
    </Layout>
  );
}

const box = {
  maxWidth: "500px",
  margin: "80px auto",
  background: "#fff",
  padding: "28px",
  borderRadius: "18px",
  textAlign: "center",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
};

const btn = {
  padding: "12px 18px",
  border: "none",
  borderRadius: "10px",
  background: "green",
  color: "white",
  cursor: "pointer",
};

export default VerifyEmail;