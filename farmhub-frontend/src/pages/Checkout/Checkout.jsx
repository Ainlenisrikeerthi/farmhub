import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { CartContext } from "../../context/CartContext";
import { calculateDistanceInKm } from "../../utils/distance";
import LocationPickerMap from "../../components/LocationPickerMap";
import { createOrder } from "../../services/orderService";
import { createPaymentOrder, verifyPayment } from "../../services/paymentService";

function Checkout() {
  const {
    cartItems,
    subtotal,
    discountAmount,
    finalTotal,
    appliedCoupon,
    clearCart,
  } = useContext(CartContext);

  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [locationMode, setLocationMode] = useState("detect");
  const [placingOrder, setPlacingOrder] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    flatNo: "",
    streetAddress: "",
    city: "",
    pincode: "",
  });

  const farmLat = 18.9252275;
  const farmLng = 78.8248532;

  const hasFarmDeliveryItems = cartItems.some(
    (item) => item.deliveryType === "FARM_DELIVERY"
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported in this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const location = { lat, lng };

        setSelectedLocation(location);
        setDistance(calculateDistanceInKm(farmLat, farmLng, lat, lng));
      },
      () => alert("Location permission denied")
    );
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setDistance(
      calculateDistanceInKm(farmLat, farmLng, location.lat, location.lng)
    );
  };

  const validateForm = () => {
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.flatNo ||
      !formData.streetAddress ||
      !formData.city ||
      !formData.pincode
    ) {
      alert("Please fill all address details");
      return false;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return false;
    }

    if (hasFarmDeliveryItems) {
      if (!selectedLocation) {
        alert("Please detect your location or select location on map");
        return false;
      }

      if (distance === null || distance > 10) {
        alert("Fresh delivery not available beyond 10 km");
        return false;
      }
    }

    return true;
  };

  const buildOrderPayload = () => ({
    customerName: formData.fullName,
    customerPhone: formData.phone,
    flatNo: formData.flatNo,
    streetAddress: formData.streetAddress,
    city: formData.city,
    pincode: formData.pincode,
    selectedLat: selectedLocation?.lat ?? null,
    selectedLng: selectedLocation?.lng ?? null,
    deliveryDistanceKm: distance ?? null,
    subtotal,
    discountAmount,
    totalAmount: finalTotal,
    couponCode: appliedCoupon?.code || null,
    paymentMethod,
    items: cartItems.map((item) => ({
      productId: item.id,
      productName: item.name,
      price: item.price,
      quantity: item.quantity,
      unit: item.unit,
      deliveryType: item.deliveryType,
    })),
  });

  const handleOnlinePayment = async () => {
    if (placingOrder) return;
    if (!validateForm()) return;

    try {
      setPlacingOrder(true);

      const razorpayOrder = await createPaymentOrder(finalTotal);
      const orderPayload = buildOrderPayload();

      const options = {
        key: razorpayOrder.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Farm Hub",
        description: "Order Payment",
        order_id: razorpayOrder.id,

        handler: async function (response) {
          try {
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderData: orderPayload,
            });

            clearCart();
            alert("Payment verified and order placed ✅");
            navigate("/order-placed");
          } catch (error) {
            alert(error.message);
            setPlacingOrder(false);
          }
        },

        modal: {
          ondismiss: function () {
            setPlacingOrder(false);
          },
        },

        prefill: {
          name: formData.fullName,
          contact: formData.phone,
        },

        theme: {
          color: "#4caf50",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert(error.message);
      setPlacingOrder(false);
    }
  };

  const handleCOD = async () => {
    if (placingOrder) return;
    if (!validateForm()) return;

    try {
      setPlacingOrder(true);
      await createOrder(buildOrderPayload());
      clearCart();
      alert("Order placed with Cash on Delivery 🚚");
      navigate("/order-placed");
    } catch (error) {
      alert(error.message);
      setPlacingOrder(false);
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === "ONLINE") handleOnlinePayment();
    else handleCOD();
  };

  return (
    <Layout>
      <div style={container}>
        <h1>Checkout</h1>

        <div style={box}>
          <h3>Customer Details</h3>
          <input name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} style={input} />
          <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} style={input} />
        </div>

        <div style={box}>
          <h3>Delivery Address</h3>
          <input name="flatNo" placeholder="Flat No / House No" value={formData.flatNo} onChange={handleChange} style={input} />
          <input name="streetAddress" placeholder="Street / Area / Landmark" value={formData.streetAddress} onChange={handleChange} style={input} />
          <input name="city" placeholder="City / Village / Town" value={formData.city} onChange={handleChange} style={input} />
          <input name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} style={input} />
        </div>

        {hasFarmDeliveryItems && (
          <div style={box}>
            <h3>Select Delivery Location</h3>

            <div style={modeRow}>
              <button
                type="button"
                onClick={() => setLocationMode("detect")}
                style={{
                  ...modeBtn,
                  background: locationMode === "detect" ? "green" : "#e0e0e0",
                  color: locationMode === "detect" ? "white" : "black",
                }}
              >
                Detect My Location
              </button>

              <button
                type="button"
                onClick={() => setLocationMode("map")}
                style={{
                  ...modeBtn,
                  background: locationMode === "map" ? "green" : "#e0e0e0",
                  color: locationMode === "map" ? "white" : "black",
                }}
              >
                Select on Map
              </button>
            </div>

            {locationMode === "detect" && (
              <div style={{ marginTop: "12px" }}>
                <button type="button" onClick={detectLocation} style={locationBtn}>
                  Detect My Location 📍
                </button>
              </div>
            )}

            {locationMode === "map" && (
              <div style={{ marginTop: "12px" }}>
                <p style={{ color: "#666", marginTop: 0 }}>
                  Click on map to select exact delivery place.
                </p>
                <LocationPickerMap
                  selectedLocation={selectedLocation}
                  onLocationSelect={handleLocationSelect}
                />
              </div>
            )}

            {selectedLocation && distance !== null && (
              <div style={{ marginTop: "12px" }}>
                <p style={infoText}><strong>Distance from Farm:</strong> {distance.toFixed(2)} km</p>
                {distance <= 10 ? (
                  <p style={{ color: "green", fontWeight: "bold" }}>
                    Fresh delivery available ✅
                  </p>
                ) : (
                  <p style={{ color: "red", fontWeight: "bold" }}>
                    Fresh delivery not available beyond 10 km ❌
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div style={box}>
          <h3>Select Payment Method</h3>
          <label style={radio}>
            <input type="radio" value="COD" checked={paymentMethod === "COD"} onChange={(e) => setPaymentMethod(e.target.value)} />
            Cash on Delivery 🚚
          </label>

          <label style={radio}>
            <input type="radio" value="ONLINE" checked={paymentMethod === "ONLINE"} onChange={(e) => setPaymentMethod(e.target.value)} />
            Pay Online 💳
          </label>
        </div>

        <div style={totalBox}>
          <h2 style={{ margin: 0 }}>Total: ₹ {finalTotal}</h2>
        </div>

        <button disabled={placingOrder} onClick={handlePlaceOrder} style={{ ...btn, opacity: placingOrder ? 0.7 : 1 }}>
          {placingOrder ? "Please wait..." : paymentMethod === "ONLINE" ? "Pay Now" : "Place Order"}
        </button>
      </div>
    </Layout>
  );
}

const container = { maxWidth: "700px", margin: "0 auto" };
const box = { background: "#fff", padding: "18px", borderRadius: "12px", marginBottom: "16px", boxShadow: "0 4px 10px rgba(0,0,0,0.08)" };
const totalBox = { ...box, textAlign: "right" };
const input = { width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box" };
const modeRow = { display: "flex", gap: "10px", flexWrap: "wrap" };
const modeBtn = { padding: "10px 14px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" };
const locationBtn = { padding: "10px 14px", border: "none", borderRadius: "8px", background: "green", color: "white", cursor: "pointer" };
const infoText = { margin: "6px 0" };
const radio = { display: "block", marginBottom: "10px" };
const btn = { width: "100%", padding: "12px", background: "green", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" };

export default Checkout;