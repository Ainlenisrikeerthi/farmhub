import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  getMyOrders,
  cancelOrder,
  requestReturn,
  requestHelp,
} from "../../services/orderService";

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getMyOrders();
      setOrders(data || []);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelOrder(id);
      alert("Order cancelled");
      loadOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReturn = async (id) => {
    const reason = prompt("Enter return reason:");
    if (!reason) return;

    try {
      await requestReturn(id, reason);
      alert("Return requested");
      loadOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleHelp = async (id) => {
    const message = prompt("Describe your issue:");
    if (!message) return;

    try {
      await requestHelp(id, message);
      alert("Help request sent");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <Layout>
        <h2>Loading orders...</h2>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1>Your Orders</h1>

        {orders.length === 0 ? (
          <p>No orders found</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} style={card}>
              <h3>Order #{order.id}</h3>

              <p>Status: {formatStatus(order.status)}</p>
              <p>Total: ₹ {order.totalAmount}</p>

              <div>
                {order.items?.map((item) => (
                  <div key={item.id} style={itemRow}>
                    {item.productName} x {item.quantity}
                  </div>
                ))}
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ marginTop: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                
                {/* Cancel */}
                {order.status === "ORDER_PLACED" ||
                order.status === "PREPARING" ||
                order.status === "PACKED" ? (
                  <button onClick={() => handleCancel(order.id)} style={cancelBtn}>
                    Cancel
                  </button>
                ) : null}

                {/* Return */}
                {order.status === "DELIVERED" ? (
                  <button onClick={() => handleReturn(order.id)} style={returnBtn}>
                    Return
                  </button>
                ) : null}

                {/* Help */}
                <button onClick={() => handleHelp(order.id)} style={helpBtn}>
                  Help
                </button>

                {/* Track */}
                <button
                  onClick={() => navigate(`/tracking/${order.id}`)}
                  style={trackBtn}
                >
                  Track
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}

function formatStatus(status) {
  return status
    ?.replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const card = {
  background: "#fff",
  padding: "16px",
  marginBottom: "12px",
  borderRadius: "10px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
};

const itemRow = {
  borderBottom: "1px solid #eee",
  padding: "6px 0",
};

const cancelBtn = {
  background: "red",
  color: "white",
  border: "none",
  padding: "8px",
  borderRadius: "6px",
};

const returnBtn = {
  background: "orange",
  color: "white",
  border: "none",
  padding: "8px",
  borderRadius: "6px",
};

const helpBtn = {
  background: "blue",
  color: "white",
  border: "none",
  padding: "8px",
  borderRadius: "6px",
};

const trackBtn = {
  background: "green",
  color: "white",
  border: "none",
  padding: "8px",
  borderRadius: "6px",
};

export default Orders;