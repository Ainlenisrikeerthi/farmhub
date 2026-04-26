import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getProductsPage } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { getRatingSummary } from "../../services/reviewService";
import Layout from "../../components/Layout";
import { CartContext } from "../../context/CartContext";
import { WishlistContext } from "../../context/WishlistContext";
import { AuthContext } from "../../context/AuthContext";
import { calculateDistanceInKm } from "../../utils/distance";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

  const farmLat = 18.9252275;
  const farmLng = 78.8248532;

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);

    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(0);
  }, [selectedCategory]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await getProductsPage({
          page,
          size: 8,
          keyword: debouncedSearch,
          categoryId: selectedCategory,
        });

        const content = data.content || [];
        setProducts(content);
        setTotalPages(data.totalPages || 1);

        const summaries = await Promise.all(
          content.map(async (p) => {
            try {
              return [p.id, await getRatingSummary(p.id)];
            } catch {
              return [p.id, { averageRating: 0, reviewCount: 0 }];
            }
          })
        );

        setRatings(Object.fromEntries(summaries));
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [page, debouncedSearch, selectedCategory]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported in this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ lat, lng });
        setDistance(calculateDistanceInKm(farmLat, farmLng, lat, lng));
      },
      () => alert("Location permission denied")
    );
  };

  const isDeliverable = (product) => {
    if (product.deliveryType === "COURIER") return true;
    if (distance === null) return true;
    return distance <= 10;
  };

  const renderStars = (rating) => {
    const rounded = Math.round(rating || 0);
    return "★".repeat(rounded) + "☆".repeat(5 - rounded);
  };

  const requireLogin = () => {
    alert("Please login first");
    navigate("/login");
  };

  return (
    <Layout>
      <section style={topBar}>
        <div>
          <p style={eyebrow}>Farm Hub Store</p>
          <h1 style={{ margin: 0 }}>Products</h1>
        </div>
        <button onClick={detectLocation} style={greenBtn}>
          Detect My Location 📍
        </button>
      </section>

      {userLocation && distance !== null && (
        <div style={locationBox}>
          <strong>Your Location:</strong> {userLocation.lat.toFixed(5)},{" "}
          {userLocation.lng.toFixed(5)} • <strong>Distance:</strong>{" "}
          {distance.toFixed(2)} km
        </div>
      )}

      <input
        type="text"
        placeholder="Search vegetables, fruits, flowers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={searchInput}
      />

      <div style={categoryWrapper}>
        <button
          onClick={() => setSelectedCategory("")}
          style={selectedCategory === "" ? activeCat : categoryBtn}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={Number(selectedCategory) === cat.id ? activeCat : categoryBtn}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div style={grid}>
          {products.map((product) => {
            const deliverable = isDeliverable(product);
            const summary = ratings[product.id] || {
              averageRating: 0,
              reviewCount: 0,
            };

            return (
              <div
                key={product.id}
                style={{ ...card, opacity: deliverable ? 1 : 0.62 }}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    if (!user) {
                      requireLogin();
                      return;
                    }

                    toggleWishlist(product);
                  }}
                  style={wishlistBtn}
                >
                  {user && isInWishlist(product.id) ? "❤️" : "🤍"}
                </button>

                {!deliverable && (
                  <div style={notDeliverable}>Not Deliverable 🚫</div>
                )}

                <div style={imageWrapper}>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} style={image} />
                  ) : (
                    <div>{product.name}</div>
                  )}

                  <span style={badge}>
                    {product.deliveryType === "FARM_DELIVERY"
                      ? "1 Day Delivery"
                      : "2-4 Days"}
                  </span>
                </div>

                <h3 style={{ margin: "12px 0 6px" }}>{product.name}</h3>

                <p style={desc}>{product.description}</p>

                <p style={ratingText}>
                  <span style={{ color: "#f5a623" }}>
                    {renderStars(summary.averageRating)}
                  </span>
                  <span style={{ marginLeft: 6 }}>
                    {summary.reviewCount
                      ? summary.averageRating.toFixed(1)
                      : "No rating"}
                  </span>
                </p>

                <p style={price}>
                  ₹ {product.price} / {product.unit}
                </p>

                <button
                  disabled={!deliverable}
                  onClick={(e) => {
                    e.stopPropagation();

                    if (!user) {
                      requireLogin();
                      return;
                    }

                    if (!deliverable) {
                      alert("This product is not deliverable to your location");
                      return;
                    }

                    addToCart(product);
                    alert("Added to cart");
                  }}
                  style={{
                    ...greenBtn,
                    width: "100%",
                    opacity: deliverable ? 1 : 0.65,
                  }}
                >
                  {deliverable ? "Add to Cart" : "Unavailable"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div style={pager}>
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          style={pageBtn}
        >
          Prev
        </button>

        <span style={{ fontWeight: 900 }}>
          Page {page + 1} of {totalPages}
        </span>

        <button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          style={pageBtn}
        >
          Next
        </button>
      </div>
    </Layout>
  );
}

const topBar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
  marginBottom: 18,
};

const eyebrow = {
  margin: "0 0 4px",
  color: "#2e7d32",
  fontWeight: 900,
  textTransform: "uppercase",
  fontSize: 13,
};

const greenBtn = {
  padding: "11px 15px",
  border: "none",
  borderRadius: 14,
  background: "linear-gradient(135deg,#2e7d32,#66bb6a)",
  color: "white",
  cursor: "pointer",
  fontWeight: 900,
};

const locationBox = {
  background: "#fff",
  padding: 14,
  borderRadius: 16,
  marginBottom: 14,
  boxShadow: "0 8px 22px rgba(23,53,31,.08)",
};

const searchInput = {
  width: "100%",
  padding: 14,
  marginBottom: 14,
  borderRadius: 16,
  border: "1px solid #dbead5",
  boxShadow: "0 8px 22px rgba(23,53,31,.06)",
};

const categoryWrapper = {
  display: "flex",
  gap: 10,
  marginBottom: 20,
  flexWrap: "wrap",
};

const categoryBtn = {
  padding: "10px 16px",
  border: "none",
  borderRadius: 999,
  background: "#eef6ea",
  color: "#225c2f",
  cursor: "pointer",
  fontWeight: 800,
};

const activeCat = {
  ...categoryBtn,
  background: "#2e7d32",
  color: "#fff",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))",
  gap: 20,
};

const card = {
  position: "relative",
  padding: 14,
  background: "#fff",
  borderRadius: 24,
  boxShadow: "0 14px 35px rgba(23,53,31,.09)",
  cursor: "pointer",
};

const imageWrapper = {
  height: 170,
  background: "#f0f7ee",
  borderRadius: 18,
  overflow: "hidden",
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

const badge = {
  position: "absolute",
  left: 10,
  bottom: 10,
  padding: "6px 9px",
  background: "rgba(255,255,255,.93)",
  color: "#2e7d32",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
};

const wishlistBtn = {
  position: "absolute",
  right: 22,
  top: 22,
  border: "none",
  background: "white",
  borderRadius: "50%",
  padding: 7,
  cursor: "pointer",
  zIndex: 3,
};

const notDeliverable = {
  position: "absolute",
  top: "42%",
  left: "50%",
  transform: "translate(-50%,-50%)",
  background: "#dc2626",
  color: "white",
  padding: "7px 10px",
  borderRadius: 10,
  fontWeight: 900,
  zIndex: 2,
};

const desc = {
  color: "#5a6b5d",
  minHeight: 42,
  margin: "0 0 8px",
  fontSize: 14,
};

const ratingText = {
  margin: "0 0 10px",
  fontSize: 14,
};

const price = {
  color: "#2e7d32",
  fontWeight: 900,
  margin: "0 0 12px",
};

const pager = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 14,
  marginTop: 28,
};

const pageBtn = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #dbead5",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 900,
};

export default Products;