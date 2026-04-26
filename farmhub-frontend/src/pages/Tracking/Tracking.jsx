import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { getMyOrders } from "../../services/orderService";

function Tracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const orders = await getMyOrders();
      const found = orders.find((o) => String(o.id) === String(orderId));
      setOrder(found || null);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p>Loading tracking...</p>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div style={container}>
          <h2>Order not found</h2>
          <button onClick={() => navigate("/orders")} style={btn}>
            Back to Orders
          </button>
        </div>
      </Layout>
    );
  }

  const isFarmDelivery = order.deliveryType === "FARM_DELIVERY";

  const statuses = isFarmDelivery
    ? ["ORDER_PLACED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"]
    : ["ORDER_PLACED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];

  const currentIndex = statuses.indexOf(order.status || "ORDER_PLACED");

  return (
    <Layout>
      <div style={container}>
        <h1>Track Order</h1>

        <div style={card}>
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Status:</strong> {formatStatus(order.status)}</p>
          <p>
            <strong>Delivery Type:</strong>{" "}
            {isFarmDelivery ? "Same Day Delivery 🥬" : "Courier Delivery 📦"}
          </p>
          <p><strong>Estimated Delivery:</strong> {order.estimatedDelivery}</p>
        </div>

        <div style={timeline}>
          {statuses.map((status, index) => {
            const isActive = index <= currentIndex;

            return (
              <div key={status} style={stepRow}>
                <div
                  style={{
                    ...circle,
                    background: isActive ? "green" : "#ccc",
                  }}
                >
                  {index + 1}
                </div>

                <div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: isActive ? "bold" : "normal",
                      color: isActive ? "green" : "#666",
                    }}
                  >
                    {formatStatus(status)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: "20px" }}>
          <strong>Items:</strong>
          {order.items.map((item) => (
            <div key={`${order.id}-${item.id}`} style={itemRow}>
              {item.productName} x {item.quantity}
            </div>
          ))}
        </div>

        <button onClick={() => navigate("/orders")} style={btn}>
          Back to Orders
        </button>
      </div>
    </Layout>
  );
}

function formatStatus(status) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const container = {
  maxWidth: "700px",
  margin: "0 auto",
};

const card = {
  background: "#fff",
  padding: "16px",
  borderRadius: "12px",
  marginBottom: "20px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
};

const timeline = {
  background: "#fff",
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
};

const stepRow = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "18px",
};

const circle = {
  width: "34px",
  height: "34px",
  borderRadius: "50%",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
};

const itemRow = {
  marginTop: "8px",
  padding: "8px 0",
  borderBottom: "1px solid #eee",
};

const btn = {
  marginTop: "20px",
  padding: "10px 16px",
  background: "green",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

export default Tracking;
