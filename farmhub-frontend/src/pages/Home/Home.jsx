import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";

function Home() {
  const navigate = useNavigate();

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80",
      title: "Fresh From Our Farm",
      text: "Natural harvest delivered directly from our fields to your home.",
    },
    {
      image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1600&q=80",
      title: "Daily Fresh Vegetables",
      text: "Hand-picked vegetables, leafy greens, fruits and flowers.",
    },
    {
      image: "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1600&q=80",
      title: "Direct Farm Delivery",
      text: "Same-day or next-day delivery available near our farm.",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <Layout>
      <div style={hero}>
        {slides.map((slide, index) => (
          <div
            key={index}
            style={{
              ...slideLayer,
              opacity: currentSlide === index ? 1 : 0,
              backgroundImage: `linear-gradient(rgba(0,0,0,0.48), rgba(0,0,0,0.48)), url(${slide.image})`,
            }}
          />
        ))}

        <div style={heroContent}>
          <p style={smallText}>Farm Hub</p>
          <h1 style={title}>{slides[currentSlide].title}</h1>
          <p style={subtitle}>{slides[currentSlide].text}</p>

          <div style={buttonRow}>
            <button onClick={() => navigate("/products")} style={primaryBtn}>
              Shop Fresh Products
            </button>

            <a href="mailto:yourfarmemail@gmail.com" style={outlineBtn}>
              Need Help?
            </a>
          </div>

          <div style={dots}>
            {slides.map((_, index) => (
              <span
                key={index}
                onClick={() => setCurrentSlide(index)}
                style={{
                  ...dot,
                  background: currentSlide === index ? "#ff9800" : "#fff",
                  width: currentSlide === index ? "28px" : "10px",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <section style={section}>
        <p style={sectionLabel}>About Our Farm</p>
        <h2 style={sectionTitle}>Fresh harvest from one trusted family farm</h2>
        <p style={aboutText}>
          Farm Hub brings fresh vegetables, fruits, leafy greens, flowers,
          spices and farm products directly from our farm to customers. Fresh
          items are available for nearby delivery within 10 km, while other
          products can be ordered through courier delivery.
        </p>

        <div style={aboutGrid}>
          <div style={infoCard}>🌱 Freshly harvested products</div>
          <div style={infoCard}>🚚 1-day delivery near farm</div>
          <div style={infoCard}>📦 Courier for long-distance orders</div>
          <div style={infoCard}>
            📧 Help: <a href="mailto:srikeerthiainleni2003@gmail.com">srikeerthiainleni2003@gmail.com</a>
          </div>
        </div>
      </section>

      <section style={sectionAlt}>
        <p style={sectionLabel}>Categories</p>
        <h2 style={sectionTitle}>Shop by fresh categories</h2>

        <div style={categoryGrid}>
          {["Vegetables 🥕", "Fruits 🍎", "Leafy Greens 🌿", "Flowers 🌸", "Spices 🌶️", "Grains 🌾"].map((item) => (
            <div key={item} style={categoryCard} onClick={() => navigate("/products")}>
              {item}
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}

const hero = {
  minHeight: "calc(100vh - 80px)",
  width: "100%",
  position: "relative",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const slideLayer = {
  position: "absolute",
  inset: 0,
  backgroundSize: "cover",
  backgroundPosition: "center",
  transition: "opacity 1.4s ease-in-out",
};

const heroContent = {
  position: "relative",
  zIndex: 2,
  maxWidth: "900px",
  textAlign: "center",
  color: "white",
  padding: "30px",
};

const smallText = {
  color: "#ff9800",
  fontWeight: "bold",
  letterSpacing: "2px",
  textTransform: "uppercase",
};

const title = {
  fontSize: "58px",
  margin: "10px 0",
  lineHeight: "1.1",
};

const subtitle = {
  fontSize: "20px",
  maxWidth: "720px",
  margin: "0 auto 28px",
  lineHeight: "1.6",
};

const buttonRow = {
  display: "flex",
  justifyContent: "center",
  gap: "16px",
  flexWrap: "wrap",
};

const primaryBtn = {
  padding: "14px 24px",
  background: "#ff9800",
  color: "white",
  border: "none",
  borderRadius: "30px",
  cursor: "pointer",
  fontWeight: "bold",
};

const outlineBtn = {
  padding: "14px 24px",
  background: "transparent",
  color: "white",
  border: "2px solid white",
  borderRadius: "30px",
  cursor: "pointer",
  fontWeight: "bold",
  textDecoration: "none",
};

const dots = {
  marginTop: "30px",
  display: "flex",
  justifyContent: "center",
  gap: "8px",
};

const dot = {
  height: "10px",
  borderRadius: "20px",
  display: "inline-block",
  cursor: "pointer",
  transition: "0.3s",
};

const section = { padding: "70px 24px", textAlign: "center", background: "#fff" };
const sectionAlt = { padding: "70px 24px", textAlign: "center", background: "#f4f8f2" };
const sectionLabel = { color: "#2e7d32", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" };
const sectionTitle = { fontSize: "34px", margin: "10px 0 18px" };
const aboutText = { maxWidth: "850px", margin: "0 auto", color: "#555", fontSize: "17px", lineHeight: "1.8" };
const aboutGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px", maxWidth: "1000px", margin: "35px auto 0" };
const infoCard = { background: "#f4f8f2", padding: "22px", borderRadius: "18px", fontWeight: "bold", boxShadow: "0 6px 16px rgba(0,0,0,0.08)" };
const categoryGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "18px", maxWidth: "1000px", margin: "35px auto 0" };
const categoryCard = { background: "white", padding: "26px", borderRadius: "20px", fontWeight: "bold", boxShadow: "0 6px 16px rgba(0,0,0,0.08)", cursor: "pointer" };

export default Home;