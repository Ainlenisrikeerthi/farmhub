import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { WishlistContext } from "../context/WishlistContext";

function Navbar() {
  const navigate = useNavigate();
  const { cartItems } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const { wishlist } = useContext(WishlistContext);

  const totalItems = user
    ? cartItems.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  return (
    <header style={header}>
      <div style={navInner}>
        <div onClick={() => navigate("/")} style={brand}>
          <img src="/favicon.png" alt="Farm Hub" style={logoImg} />
          <div>
            <h2 style={{ margin: 0, lineHeight: 1, color: "#1B5E20" }}>
              Farm Hub
            </h2>
            <p style={{ margin: 0, color: "#4B3A2A", fontSize: "13px" }}>
              Fresh From Our Farm
            </p>
          </div>
        </div>

        <nav style={navLinks}>
          <button onClick={() => navigate("/")} style={linkBtn}>Home</button>
          <button onClick={() => navigate("/products")} style={linkBtn}>Products</button>

          <button onClick={() => user ? navigate("/wishlist") : navigate("/login")} style={linkBtn}>
            ❤️ Wishlist {user ? `(${wishlist.length})` : ""}
          </button>

          <button onClick={() => user ? navigate("/cart") : navigate("/login")} style={cartBtn}>
            🛒 Cart {user ? `(${totalItems})` : ""}
          </button>

          {user?.role === "ADMIN" && (
            <button onClick={() => navigate("/admin")} style={adminBtn}>Admin</button>
          )}

          {user ? (
            <>
              <button onClick={() => navigate("/profile")} style={linkBtn}>Profile</button>
              <button onClick={() => { logout(); navigate("/"); }} style={logoutBtn}>
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => navigate("/login")} style={cartBtn}>Login</button>
          )}
        </nav>
      </div>
    </header>
  );
}

const header = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  background: "rgba(255,255,255,.92)",
  backdropFilter: "blur(14px)",
  borderBottom: "1px solid rgba(27,94,32,.12)",
};

const navInner = {
  maxWidth: "1180px",
  margin: "0 auto",
  padding: "12px 18px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
};

const brand = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  cursor: "pointer",
};

const logoImg = {
  width: "52px",
  height: "52px",
  borderRadius: "15px",
  boxShadow: "0 10px 24px rgba(46,125,50,.22)",
};

const navLinks = {
  display: "flex",
  gap: "9px",
  flexWrap: "wrap",
  alignItems: "center",
};

const linkBtn = {
  padding: "10px 13px",
  border: "none",
  borderRadius: "999px",
  background: "#EEF6EA",
  color: "#225C2F",
  cursor: "pointer",
  fontWeight: 800,
};

const cartBtn = {
  ...linkBtn,
  background: "linear-gradient(135deg,#1B5E20,#43A047)",
  color: "#fff",
};

const adminBtn = {
  ...linkBtn,
  background: "#FFC107",
  color: "#1B5E20",
};

const logoutBtn = {
  ...linkBtn,
  background: "#DC2626",
  color: "#fff",
};

export default Navbar;