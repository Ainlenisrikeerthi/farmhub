import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { WishlistContext } from "../../context/WishlistContext";
import { CartContext } from "../../context/CartContext";

function Wishlist() {
  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  return (
    <Layout>
      <div style={page}>
        <div style={hero}>
          <div>
            <p style={eyebrow}>Saved Products</p>
            <h1 style={{ margin: 0 }}>Your Wishlist ❤️</h1>
            <p style={{ color: "#5b6b5d" }}>
              Keep your favourite farm products ready for later.
            </p>
          </div>
         
        </div>

        {wishlist.length === 0 ? (
          <div style={emptyBox}>
            <h2>No items in wishlist</h2>
            <p>Start adding fresh products you like.</p>
            <button onClick={() => navigate("/products")} style={primaryBtn}>
              Browse Products
            </button>
          </div>
        ) : (
          <div style={grid}>
            {wishlist.map((product) => (
              <div key={product.id} style={card}>
                <div style={imageBox}>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} style={image} />
                  ) : (
                    <div style={noImage}>Farm Hub</div>
                  )}
                  <button onClick={() => toggleWishlist(product)} style={heartBtn}>
                    ❤️
                  </button>
                </div>

                <div style={content}>
                  <h3 style={{ margin: "0 0 8px" }}>{product.name}</h3>
                  <p style={desc}>{product.description || "Fresh farm product"}</p>

                  <p style={price}>
                    ₹ {product.price} / {product.unit}
                  </p>

                  <div style={btnRow}>
                    <button onClick={() => navigate(`/product/${product.id}`)} style={outlineBtn}>
                      View
                    </button>

                    <button
                      onClick={() => {
                        addToCart(product);
                        alert("Added to cart");
                      }}
                      style={primaryBtn}
                    >
                      Add to Cart
                    </button>
                  </div>

                  <button onClick={() => toggleWishlist(product)} style={removeBtn}>
                    Remove from Wishlist
                  </button>
                </div>
              </div>
            ))}
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

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: "22px",
};

const card = {
  background: "#fff",
  borderRadius: "24px",
  overflow: "hidden",
  boxShadow: "0 14px 35px rgba(23,53,31,.10)",
};

const imageBox = {
  height: "210px",
  background: "#F4F8F2",
  position: "relative",
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

const heartBtn = {
  position: "absolute",
  top: "12px",
  right: "12px",
  border: "none",
  borderRadius: "50%",
  width: "38px",
  height: "38px",
  background: "white",
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(0,0,0,.12)",
};

const content = { padding: "16px" };

const desc = {
  color: "#617064",
  fontSize: "14px",
  minHeight: "40px",
};

const price = {
  color: "#1B5E20",
  fontWeight: 900,
  fontSize: "18px",
};

const btnRow = {
  display: "flex",
  gap: "10px",
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

const outlineBtn = {
  ...primaryBtn,
  background: "#EEF6EA",
  color: "#1B5E20",
};

const removeBtn = {
  marginTop: "10px",
  width: "100%",
  padding: "10px",
  border: "none",
  borderRadius: "12px",
  background: "#FEE2E2",
  color: "#B91C1C",
  cursor: "pointer",
  fontWeight: 900,
};

export default Wishlist;