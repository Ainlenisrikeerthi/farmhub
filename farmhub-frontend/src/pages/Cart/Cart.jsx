import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import Layout from "../../components/Layout";

function Cart() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discountAmount,
    finalTotal,
    availableCoupons,
  } = useContext(CartContext);

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState("");

  const handleApplyCoupon = () => {
    const result = applyCoupon(couponInput);
    alert(result.message);
    if (result.success) setCouponInput("");
  };

  return (
    <Layout>
      <div style={page}>
        <div style={hero}>
          <div>
            <p style={eyebrow}>Shopping Basket</p>
            <h1 style={{ margin: 0 }}>Your Cart 🛒</h1>
            <p style={{ color: "#5b6b5d" }}>
              Review your fresh farm products before checkout.
            </p>
          </div>
          
        </div>

        {cartItems.length === 0 ? (
          <div style={emptyBox}>
            <h2>Your cart is empty</h2>
            <p>Add fresh products from our farm store.</p>
            <button onClick={() => navigate("/products")} style={primaryBtn}>
              Shop Products
            </button>
          </div>
        ) : (
          <div style={layout}>
            <div>
              {cartItems.map((item) => (
                <div key={item.id} style={itemCard}>
                  <div style={imageBox}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} style={image} />
                    ) : (
                      <div style={noImage}>Farm Hub</div>
                    )}
                  </div>

                  <div style={itemInfo}>
                    <h3 style={{ margin: "0 0 6px" }}>{item.name}</h3>
                    <p style={desc}>{item.description || "Fresh farm product"}</p>

                    <p style={price}>₹ {item.price} / {item.unit}</p>

                    <div style={qtyRow}>
                      <button onClick={() => decreaseQuantity(item.id)} style={qtyBtn}>−</button>
                      <span style={qtyText}>{item.quantity}</span>
                      <button onClick={() => increaseQuantity(item.id)} style={qtyBtn}>+</button>
                    </div>

                    <p style={{ fontWeight: 900 }}>
                      Item Total: ₹ {item.price * item.quantity}
                    </p>
                  </div>

                  <button onClick={() => removeItem(item.id)} style={removeBtn}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div style={summaryCard}>
              <h2>Order Summary</h2>

              <div style={couponInfo}>
                <strong>Available Coupons</strong>
                {availableCoupons.map((coupon) => (
                  <p key={coupon.code} style={{ margin: "8px 0 0" }}>
                    <b>{coupon.code}</b> - {coupon.label}
                  </p>
                ))}
              </div>

              {!appliedCoupon ? (
                <div style={couponRow}>
                  <input
                    type="text"
                    placeholder="Enter coupon"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    style={couponInputStyle}
                  />
                  <button onClick={handleApplyCoupon} style={primaryBtn}>
                    Apply
                  </button>
                </div>
              ) : (
                <div style={appliedBox}>
                  <div>
                    <strong>{appliedCoupon.code}</strong>
                    <p style={{ margin: 0 }}>{appliedCoupon.label}</p>
                  </div>
                  <button onClick={removeCoupon} style={smallRemoveBtn}>
                    Remove
                  </button>
                </div>
              )}

              <div style={priceLine}>
                <span>Subtotal</span>
                <strong>₹ {subtotal}</strong>
              </div>

              <div style={priceLine}>
                <span>Discount</span>
                <strong style={{ color: "#2e7d32" }}>− ₹ {discountAmount}</strong>
              </div>

              <hr />

              <div style={totalLine}>
                <span>Total</span>
                <strong>₹ {finalTotal}</strong>
              </div>

              <button onClick={() => navigate("/checkout")} style={checkoutBtn}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

const page = { maxWidth: "1180px", margin: "0 auto" };

const hero = {
  background: "linear-gradient(135deg,#EEF6EA,#FFF9E6)",
  borderRadius: "24px",
  padding: "24px",
  marginBottom: "24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 12px 30px rgba(23,53,31,.08)",
};

const eyebrow = {
  margin: "0 0 6px",
  color: "#2e7d32",
  fontWeight: 900,
  textTransform: "uppercase",
};

const heroIcon = { width: "74px", height: "74px" };

const emptyBox = {
  background: "#fff",
  padding: "35px",
  borderRadius: "22px",
  textAlign: "center",
  boxShadow: "0 12px 30px rgba(23,53,31,.08)",
};

const layout = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 340px",
  gap: "24px",
  alignItems: "start",
};

const itemCard = {
  background: "#fff",
  borderRadius: "22px",
  padding: "14px",
  marginBottom: "16px",
  boxShadow: "0 12px 30px rgba(23,53,31,.08)",
  display: "grid",
  gridTemplateColumns: "140px 1fr auto",
  gap: "16px",
  alignItems: "center",
};

const imageBox = {
  width: "140px",
  height: "120px",
  background: "#F4F8F2",
  borderRadius: "18px",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const image = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const noImage = {
  color: "#2e7d32",
  fontWeight: 900,
};

const itemInfo = { minWidth: 0 };

const desc = {
  color: "#617064",
  fontSize: "14px",
};

const price = {
  color: "#1B5E20",
  fontWeight: 900,
};

const qtyRow = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const qtyBtn = {
  width: "34px",
  height: "34px",
  border: "none",
  borderRadius: "10px",
  background: "#EEF6EA",
  color: "#1B5E20",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: "18px",
};

const qtyText = {
  fontWeight: 900,
  minWidth: "24px",
  textAlign: "center",
};

const removeBtn = {
  padding: "10px 12px",
  border: "none",
  borderRadius: "12px",
  background: "#FEE2E2",
  color: "#B91C1C",
  cursor: "pointer",
  fontWeight: 900,
};

const summaryCard = {
  background: "#fff",
  borderRadius: "22px",
  padding: "20px",
  boxShadow: "0 12px 30px rgba(23,53,31,.08)",
  position: "sticky",
  top: "90px",
};

const couponInfo = {
  background: "#F4F8F2",
  padding: "12px",
  borderRadius: "14px",
  marginBottom: "14px",
  color: "#2e7d32",
};

const couponRow = {
  display: "flex",
  gap: "8px",
  marginBottom: "16px",
};

const couponInputStyle = {
  flex: 1,
  padding: "11px",
  borderRadius: "12px",
  border: "1px solid #dbead5",
};

const appliedBox = {
  background: "#FFF9E6",
  padding: "12px",
  borderRadius: "14px",
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
  marginBottom: "16px",
};

const primaryBtn = {
  padding: "11px 14px",
  border: "none",
  borderRadius: "12px",
  background: "linear-gradient(135deg,#1B5E20,#43A047)",
  color: "white",
  cursor: "pointer",
  fontWeight: 900,
};

const smallRemoveBtn = {
  border: "none",
  borderRadius: "10px",
  background: "#DC2626",
  color: "white",
  padding: "8px 10px",
  cursor: "pointer",
};

const priceLine = {
  display: "flex",
  justifyContent: "space-between",
  margin: "12px 0",
};

const totalLine = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "22px",
  margin: "16px 0",
};

const checkoutBtn = {
  width: "100%",
  padding: "13px",
  border: "none",
  borderRadius: "14px",
  background: "linear-gradient(135deg,#1B5E20,#43A047)",
  color: "white",
  cursor: "pointer",
  fontWeight: 900,
};

export default Cart;