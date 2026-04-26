import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { AuthContext } from "../../context/AuthContext";

function Profile() {
  const navigate = useNavigate();
  const { user, logout, addAddress, deleteAddress } = useContext(AuthContext);

  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  if (!user) {
    return (
      <Layout>
        <div
          style={{
            maxWidth: "500px",
            margin: "40px auto",
            background: "#fff",
            padding: "24px",
            borderRadius: "18px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <h2>You are not logged in</h2>
          <button
            onClick={() => navigate("/login")}
            style={primaryButton}
          >
            Go to Login
          </button>
        </div>
      </Layout>
    );
  }

  const handleAddressChange = (e) => {
    setAddressForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddAddress = () => {
    if (
      !addressForm.fullName ||
      !addressForm.phone ||
      !addressForm.address ||
      !addressForm.city ||
      !addressForm.pincode
    ) {
      alert("Please fill all address fields");
      return;
    }

    addAddress(addressForm);

    setAddressForm({
      fullName: "",
      phone: "",
      address: "",
      city: "",
      pincode: "",
    });

    alert("Address added successfully");
  };

  return (
    <Layout>
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          display: "grid",
          gap: "24px",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "28px",
            borderRadius: "20px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "#e8f5e9",
                color: "green",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            >
              {user.name?.charAt(0)?.toUpperCase()}
            </div>

            <div>
              <h1 style={{ margin: "0 0 6px 0" }}>{user.name}</h1>
              <p style={{ margin: 0, color: "#666" }}>Farm Hub Customer</p>
            </div>
          </div>

          <div style={infoCard}>
            <h3 style={{ marginTop: 0 }}>Account Details</h3>

            <p style={infoText}>
              <strong>Full Name:</strong> {user.name}
            </p>

            <p style={infoText}>
              <strong>Email:</strong> {user.email}
            </p>

            <p style={infoText}>
              <strong>Phone:</strong> {user.phone}
            </p>
          </div>

          <div
            style={{
              marginTop: "24px",
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => navigate("/orders")}
              style={primaryButton}
            >
              View Orders
            </button>

            <button
              onClick={() => navigate("/cart")}
              style={secondaryButton}
            >
              Go to Cart
            </button>

            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              style={logoutButton}
            >
              Logout
            </button>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "18px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Saved Addresses</h2>

          {user.addresses && user.addresses.length > 0 ? (
            <div style={{ display: "grid", gap: "14px", marginBottom: "24px" }}>
              {user.addresses.map((addr) => (
                <div
                  key={addr.id}
                  style={{
                    padding: "16px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "14px",
                    background: "#fafafa",
                  }}
                >
                  <p style={{ margin: "0 0 6px 0" }}>
                    <strong>{addr.fullName}</strong> — {addr.phone}
                  </p>
                  <p style={{ margin: "0 0 6px 0", color: "#555" }}>
                    {addr.address}
                  </p>
                  <p style={{ margin: "0 0 10px 0", color: "#555" }}>
                    {addr.city} - {addr.pincode}
                  </p>

                  <button
                    onClick={() => deleteAddress(addr.id)}
                    style={deleteButton}
                  >
                    Delete Address
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#666" }}>No saved addresses yet.</p>
          )}

          <h3>Add New Address</h3>

          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={addressForm.fullName}
            onChange={handleAddressChange}
            style={input}
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={addressForm.phone}
            onChange={handleAddressChange}
            style={input}
          />

          <textarea
            name="address"
            placeholder="Address"
            value={addressForm.address}
            onChange={handleAddressChange}
            style={{ ...input, height: "90px" }}
          />

          <input
            type="text"
            name="city"
            placeholder="City"
            value={addressForm.city}
            onChange={handleAddressChange}
            style={input}
          />

          <input
            type="text"
            name="pincode"
            placeholder="Pincode"
            value={addressForm.pincode}
            onChange={handleAddressChange}
            style={input}
          />

          <button onClick={handleAddAddress} style={primaryButton}>
            Save Address
          </button>
        </div>
      </div>
    </Layout>
  );
}

const infoCard = {
  background: "#f8faf8",
  padding: "20px",
  borderRadius: "14px",
  border: "1px solid #e8eee8",
};

const infoText = {
  margin: "0 0 10px 0",
  color: "#444",
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
  padding: "12px 18px",
  border: "none",
  borderRadius: "10px",
  background: "green",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};

const secondaryButton = {
  padding: "12px 18px",
  border: "none",
  borderRadius: "10px",
  background: "#e0e0e0",
  color: "black",
  cursor: "pointer",
  fontWeight: "bold",
};

const logoutButton = {
  padding: "12px 18px",
  border: "none",
  borderRadius: "10px",
  background: "red",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};

const deleteButton = {
  padding: "10px 14px",
  border: "none",
  borderRadius: "10px",
  background: "red",
  color: "white",
  cursor: "pointer",
};

export default Profile;