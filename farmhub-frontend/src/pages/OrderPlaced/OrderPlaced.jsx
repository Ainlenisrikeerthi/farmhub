import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";

function OrderPlaced() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div style={container}>
        <h1 style={{ color: "green" }}>✅ Order Placed Successfully!</h1>
        <p>Your order has been placed successfully.</p>

        <div style={{ marginTop: "20px" }}>
          <button onClick={() => navigate("/orders")} style={btn}>
            View Orders
          </button>

          <button onClick={() => navigate("/")} style={btn}>
            Go to Home
          </button>
        </div>
      </div>
    </Layout>
  );
}

const container = {
  textAlign: "center",
  marginTop: "50px",
};

const btn = {
  margin: "10px",
  padding: "10px 16px",
  border: "none",
  borderRadius: "8px",
  background: "green",
  color: "white",
  cursor: "pointer",
};

export default OrderPlaced;