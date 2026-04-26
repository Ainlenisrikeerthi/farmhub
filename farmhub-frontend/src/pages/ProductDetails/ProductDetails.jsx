import { useEffect, useState, useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProducts } from "../../services/productService";
import { getProductReviews, getRatingSummary, addReview } from "../../services/reviewService";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import Layout from "../../components/Layout";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ averageRating: 0, reviewCount: 0 });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    getProducts().then((data) => {
      setAllProducts(data || []);
      setProduct((data || []).find((p) => String(p.id) === String(id)) || null);
    });
    loadReviews();
  }, [id]);

  const loadReviews = async () => {
    try {
      const [reviewData, summaryData] = await Promise.all([getProductReviews(id), getRatingSummary(id)]);
      setReviews(reviewData || []);
      setSummary(summaryData || { averageRating: 0, reviewCount: 0 });
    } catch {
      setReviews([]);
      setSummary({ averageRating: 0, reviewCount: 0 });
    }
  };

  const similarProducts = useMemo(() => {
    if (!product) return [];
    return allProducts.filter((p) => p.id !== product.id && p.category?.id === product.category?.id).slice(0, 4);
  }, [allProducts, product]);

  if (!product) {
    return <Layout><div style={emptyCard}><h2>Product not found</h2><button onClick={() => navigate("/products")} style={primaryButton}>Back to Products</button></div></Layout>;
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addToCart(product);
    alert(`${quantity} x ${product.name} added to cart`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { alert("Please login to add a review"); navigate("/login"); return; }
    if (!reviewForm.comment.trim()) { alert("Please enter a review comment"); return; }
    try {
      await addReview({ productId: Number(product.id), rating: Number(reviewForm.rating), comment: reviewForm.comment });
      setReviewForm({ rating: 5, comment: "" });
      await loadReviews();
      alert("Review added successfully");
    } catch (error) { alert(error.message); }
  };

  const stars = (rating) => "★".repeat(Math.round(rating || 0)) + "☆".repeat(5 - Math.round(rating || 0));

  return (
    <Layout>
      <div style={pageWrapper}>
        <div style={productCard}>
          <div>
            <button onClick={() => navigate("/products")} style={backButton}>← Back</button>
            <div style={imageWrapper}>{product.imageUrl ? <img src={product.imageUrl} alt={product.name} style={image} /> : <div>{product.name}</div>}</div>
          </div>
          <div>
            <span style={badge}>{product.deliveryType === "FARM_DELIVERY" ? "1 Day Fresh Delivery" : "Courier Delivery"}</span>
            <h1 style={{ fontSize: "42px", margin: "12px 0 8px" }}>{product.name}</h1>
            <p style={{ color: "#5b6b5d", lineHeight: 1.7 }}>{product.description}</p>
            <h2 style={{ color: "#2e7d32" }}>₹ {product.price} / {product.unit}</h2>
            <div style={{ marginBottom: 18 }}><span style={{ color: "#f5a623", fontSize: 20 }}>{stars(summary.averageRating)}</span><span style={{ marginLeft: 10, color: "#555" }}>{summary.reviewCount ? `${summary.averageRating.toFixed(1)} / 5` : "No ratings yet"}</span><span style={{ marginLeft: 10, color: "#777" }}>({summary.reviewCount} reviews)</span></div>
            <div style={qtyWrapper}><button onClick={() => setQuantity((q) => Math.max(1, q - 1))} style={qtyBtn}>-</button><span style={qtyText}>{quantity}</span><button onClick={() => setQuantity((q) => q + 1)} style={qtyBtn}>+</button></div>
            <button onClick={handleAddToCart} style={addButton}>Add {quantity} to Cart</button>
          </div>
        </div>

        {similarProducts.length > 0 && <div style={sectionCard}><h2>Similar Items</h2><div style={similarGrid}>{similarProducts.map((item) => <div key={item.id} style={similarCard} onClick={() => navigate(`/product/${item.id}`)}><div style={similarImageWrapper}>{item.imageUrl ? <img src={item.imageUrl} alt={item.name} style={similarImage} /> : <div>{item.name}</div>}</div><h3>{item.name}</h3><p style={{ color: "#2e7d32", fontWeight: 900 }}>₹ {item.price}</p></div>)}</div></div>}

        <div style={sectionCard}>
          <h2>Ratings & Reviews</h2>
          <form onSubmit={handleReviewSubmit} style={reviewFormStyle}>
            <h3 style={{ marginTop: 0 }}>Write a Review</h3>
            <select value={reviewForm.rating} onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: e.target.value }))} style={input}><option value={5}>5 - Excellent</option><option value={4}>4 - Very Good</option><option value={3}>3 - Good</option><option value={2}>2 - Average</option><option value={1}>1 - Poor</option></select>
            <textarea placeholder="Write your review..." value={reviewForm.comment} onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))} style={{ ...input, height: 100 }} />
            <button type="submit" style={primaryButton}>Submit Review</button>
          </form>
          <div style={{ marginTop: 24 }}>{reviews.length === 0 ? <p>No reviews yet.</p> : reviews.map((review) => <div key={review.id} style={reviewCard}><div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}><strong>{review.userName}</strong><span style={{ color: "#777", fontSize: 14 }}>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}</span></div><div style={{ marginTop: 6, color: "#f5a623" }}>{stars(review.rating)}</div><p style={{ color: "#444" }}>{review.comment}</p></div>)}</div>
        </div>
      </div>
    </Layout>
  );
}

const pageWrapper = { maxWidth: 1050, margin: "0 auto", display: "grid", gap: 24 };
const emptyCard = { maxWidth: 700, margin: "40px auto", background: "#fff", padding: 24, borderRadius: 16, boxShadow: "0 6px 16px rgba(0,0,0,.08)", textAlign: "center" };
const productCard = { background: "#fff", padding: 24, borderRadius: 28, boxShadow: "0 18px 45px rgba(23,53,31,.10)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 };
const sectionCard = { background: "#fff", padding: 24, borderRadius: 24, boxShadow: "0 12px 35px rgba(23,53,31,.08)" };
const imageWrapper = { height: 360, background: "#f0f7ee", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" };
const image = { width: "100%", height: "100%", objectFit: "cover" };
const badge = { display: "inline-block", padding: "8px 12px", background: "#e8f5e9", color: "#2e7d32", borderRadius: 999, fontWeight: 900 };
const backButton = { marginBottom: 14, padding: "9px 13px", border: "none", borderRadius: 12, background: "#eef6ea", cursor: "pointer", fontWeight: 800 };
const qtyWrapper = { display: "flex", alignItems: "center", gap: 12, marginTop: 20 };
const qtyBtn = { padding: "9px 15px", border: "none", borderRadius: 10, background: "#e0e0e0", cursor: "pointer", fontSize: 16 };
const qtyText = { fontSize: 18, fontWeight: 900 };
const addButton = { marginTop: 20, padding: "13px 20px", border: "none", borderRadius: 14, background: "linear-gradient(135deg,#2e7d32,#66bb6a)", color: "white", cursor: "pointer", fontWeight: 900, width: "100%" };
const primaryButton = { padding: "12px 18px", border: "none", borderRadius: 12, background: "#2e7d32", color: "white", cursor: "pointer", fontWeight: 900 };
const input = { width: "100%", padding: 12, marginBottom: 14, borderRadius: 12, border: "1px solid #ccc", boxSizing: "border-box" };
const reviewFormStyle = { background: "#f8faf8", padding: 18, borderRadius: 16, border: "1px solid #e8eee8" };
const reviewCard = { padding: 16, borderRadius: 14, background: "#fafafa", border: "1px solid #eee", marginBottom: 14 };
const similarGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 18 };
const similarCard = { background: "#fafafa", borderRadius: 16, padding: 12, cursor: "pointer", border: "1px solid #eee" };
const similarImageWrapper = { height: 130, background: "#f0f7ee", borderRadius: 12, overflow: "hidden", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center" };
const similarImage = { width: "100%", height: "100%", objectFit: "cover" };

export default ProductDetails;
