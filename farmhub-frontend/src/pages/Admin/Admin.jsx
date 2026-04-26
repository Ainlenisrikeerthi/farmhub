import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import {
  getCategories,
  addCategory,
  deleteCategory,
} from "../../services/categoryService";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../../services/productService";
import { getAllOrders, updateOrderStatus } from "../../services/orderService";

function Admin() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [categoryName, setCategoryName] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    unit: "",
    stock: "",
    imageUrl: "",
    deliveryType: "FARM_DELIVERY",
    deliveryRadiusKm: 10,
    freshnessLabel: "",
    categoryId: "",
  });

  const loadData = async () => {
    try {
      const cat = await getCategories();
      const prod = await getProducts();
      const ord = await getAllOrders();

      setCategories(cat);
      setProducts(prod);
      setOrders(ord);
    } catch (error) {
      console.error(error);
      alert("Error loading admin data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      alert("Enter category name");
      return;
    }

    await addCategory({
      name: categoryName,
      description: `${categoryName} items`,
    });

    setCategoryName("");
    loadData();
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await deleteCategory(id);
      loadData();
    } catch (error) {
      console.error(error);
      alert("Category could not be deleted. Delete linked products first.");
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      unit: "",
      stock: "",
      imageUrl: "",
      deliveryType: "FARM_DELIVERY",
      deliveryRadiusKm: 10,
      freshnessLabel: "",
      categoryId: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      unit: formData.unit,
      stock: Number(formData.stock),
      imageUrl: formData.imageUrl,
      deliveryType: formData.deliveryType,
      deliveryRadiusKm: Number(formData.deliveryRadiusKm),
      freshnessLabel: formData.freshnessLabel,
      category: {
        id: Number(formData.categoryId),
      },
    };

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
        alert("Product updated successfully");
      } else {
        await addProduct(payload);
        alert("Product added successfully");
      }

      resetForm();
      loadData();
    } catch (error) {
      console.error(error);
      alert("Something went wrong while saving product");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);

    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      unit: product.unit || "",
      stock: product.stock || "",
      imageUrl: product.imageUrl || "",
      deliveryType: product.deliveryType || "FARM_DELIVERY",
      deliveryRadiusKm: product.deliveryRadiusKm || 10,
      freshnessLabel: product.freshnessLabel || "",
      categoryId: product.category?.id || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await deleteProduct(id);
      loadData();
    } catch (error) {
      console.error(error);
      alert("Something went wrong while deleting product");
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      loadData();
    } catch (error) {
      alert(error.message || "Failed to update status");
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Order Placed";
    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <Layout>
      <div>
        <div style={headerBox}>
          <div>
            <p style={eyebrow}>Admin Dashboard</p>
            <h1 style={{ margin: 0 }}>Farm Hub Control Panel</h1>
            <p style={{ color: "#5c6f60", marginBottom: 0 }}>
              Manage categories, products, and customer orders
            </p>
          </div>

          <div style={statsRow}>
            <div style={statCard}>
              <strong>{categories.length}</strong>
              <span>Categories</span>
            </div>
            <div style={statCard}>
              <strong>{products.length}</strong>
              <span>Products</span>
            </div>
            <div style={statCard}>
              <strong>{orders.length}</strong>
              <span>Orders</span>
            </div>
          </div>
        </div>

        <div style={card}>
          <h2>Manage Categories</h2>

          <div style={categoryInputRow}>
            <input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="New Category"
              style={input}
            />
            <button onClick={handleAddCategory} style={primaryButton}>
              Add Category
            </button>
          </div>

          <div style={chipWrapper}>
            {categories.map((category) => (
              <div key={category.id} style={chip}>
                <span>{category.name}</span>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  style={chipDeleteButton}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={card}>
          <h2>{editingId ? "Edit Product" : "Add Product"}</h2>

          <div style={formGrid}>
            <input
              name="name"
              placeholder="Product Name"
              value={formData.name}
              onChange={handleChange}
              style={input}
              required
            />

            <input
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              style={input}
              required
            />

            <input
              name="unit"
              placeholder="Unit"
              value={formData.unit}
              onChange={handleChange}
              style={input}
              required
            />

            <input
              name="stock"
              placeholder="Stock"
              value={formData.stock}
              onChange={handleChange}
              style={input}
              required
            />

            <input
              name="imageUrl"
              placeholder="Image URL"
              value={formData.imageUrl}
              onChange={handleChange}
              style={input}
            />

            <input
              name="freshnessLabel"
              placeholder="Freshness Label"
              value={formData.freshnessLabel}
              onChange={handleChange}
              style={input}
            />

            <select
              name="deliveryType"
              value={formData.deliveryType}
              onChange={handleChange}
              style={input}
            >
              <option value="FARM_DELIVERY">Farm Delivery</option>
              <option value="COURIER">Courier</option>
            </select>

            <input
              name="deliveryRadiusKm"
              placeholder="Delivery Radius Km"
              value={formData.deliveryRadiusKm}
              onChange={handleChange}
              style={input}
            />

            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              style={input}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <textarea
            name="description"
            placeholder="Product Description"
            value={formData.description}
            onChange={handleChange}
            style={textarea}
            required
          />

          <div style={buttonRow}>
            <button type="submit" style={primaryButton}>
              {editingId ? "Update Product" : "Add Product"}
            </button>

            <button type="button" onClick={resetForm} style={secondaryButton}>
              Clear
            </button>
          </div>
        </form>

        <div style={card}>
          <h2>Customer Orders</h2>

          {orders.length === 0 ? (
            <p>No customer orders yet.</p>
          ) : (
            <div style={ordersGrid}>
              {orders.map((order) => (
                <div key={order.id} style={orderCard}>
                  <div style={orderTop}>
                    <h3 style={{ margin: 0 }}>Order #{order.id}</h3>
                    <span style={statusBadge}>{formatStatus(order.status)}</span>
                  </div>

                  <p>
                    <strong>Customer:</strong> {order.customerName}
                  </p>
                  <p>
                    <strong>Phone:</strong> {order.customerPhone}
                  </p>
                  <p>
                    <strong>Total:</strong> ₹ {order.totalAmount}
                  </p>
                  <p>
                    <strong>Payment:</strong>{" "}
                    {order.paymentMethod === "COD"
                      ? "Cash on Delivery 🚚"
                      : "Paid Online 💳"}
                  </p>
                  <p>
                    <strong>Delivery:</strong> {order.deliveryType}
                  </p>
                  <p>
                    <strong>Estimated:</strong> {order.estimatedDelivery}
                  </p>

                  <div style={{ margin: "12px 0" }}>
                    <strong>Items:</strong>
                    {order.items?.map((item) => (
                      <div key={`${order.id}-${item.id}`} style={itemRow}>
                        <span>{item.productName}</span>
                        <span>
                          {item.quantity} x ₹ {item.price}
                        </span>
                      </div>
                    ))}
                  </div>

                  <label style={label}>Update Status</label>
                  <select
                    value={order.status || "ORDER_PLACED"}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    style={input}
                  >
                    <option value="ORDER_PLACED">Order Placed</option>

                    {order.deliveryType === "FARM_DELIVERY" ? (
                      <>
                        <option value="PREPARING">Preparing</option>
                        <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                      </>
                    ) : order.deliveryType === "COURIER" ? (
                      <>
                        <option value="PACKED">Packed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                      </>
                    ) : (
                      <>
                        <option value="PREPARING">Preparing</option>
                        <option value="PACKED">Packed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                      </>
                    )}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2>All Products</h2>

          <div style={productGrid}>
            {products.map((product) => (
              <div key={product.id} style={productCard}>
                <div style={imageWrapper}>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={productImage}
                    />
                  ) : (
                    <div style={{ color: "#6b8e23", fontSize: "16px" }}>
                      No Image
                    </div>
                  )}

                  <span style={deliveryBadge}>
                    {product.deliveryType === "FARM_DELIVERY"
                      ? "1 Day Delivery"
                      : "Courier"}
                  </span>
                </div>

                <div style={{ padding: "16px" }}>
                  <h3 style={{ marginTop: 0, marginBottom: "8px" }}>
                    {product.name}
                  </h3>

                  <p style={productDesc}>{product.description}</p>

                  <p style={priceText}>
                    ₹ {product.price} / {product.unit}
                  </p>

                  <p style={smallInfo}>Category: {product.category?.name}</p>
                  <p style={smallInfo}>Stock: {product.stock}</p>
                  <p style={smallInfo}>Freshness: {product.freshnessLabel || "-"}</p>

                  <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                    <button
                      onClick={() => handleEdit(product)}
                      style={primaryButton}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(product.id)}
                      style={deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

const headerBox = {
  background: "linear-gradient(135deg,#e8f5e9,#fff7e6)",
  padding: "24px",
  borderRadius: "24px",
  marginBottom: "24px",
  boxShadow: "0 12px 30px rgba(23,53,31,.08)",
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  flexWrap: "wrap",
};

const eyebrow = {
  margin: "0 0 6px",
  color: "#2e7d32",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "1px",
};

const statsRow = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

const statCard = {
  background: "#fff",
  padding: "16px 20px",
  borderRadius: "18px",
  boxShadow: "0 8px 20px rgba(23,53,31,.08)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minWidth: "110px",
};

const card = {
  background: "#fff",
  padding: "22px",
  borderRadius: "22px",
  boxShadow: "0 12px 30px rgba(23,53,31,.08)",
  marginBottom: "24px",
};

const categoryInputRow = {
  display: "flex",
  gap: "12px",
  marginBottom: "16px",
  flexWrap: "wrap",
};

const chipWrapper = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const chip = {
  background: "#e8f5e9",
  color: "#225c2f",
  padding: "9px 12px",
  borderRadius: "999px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontWeight: 800,
};

const chipDeleteButton = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: "red",
  fontWeight: "bold",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "14px",
};

const input = {
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #dbead5",
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
};

const textarea = {
  ...input,
  width: "100%",
  minHeight: "110px",
  marginTop: "16px",
};

const buttonRow = {
  marginTop: "16px",
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

const primaryButton = {
  padding: "11px 16px",
  border: "none",
  borderRadius: "12px",
  background: "linear-gradient(135deg,#2e7d32,#66bb6a)",
  color: "white",
  cursor: "pointer",
  fontWeight: 900,
};

const secondaryButton = {
  padding: "11px 16px",
  border: "none",
  borderRadius: "12px",
  background: "#eef6ea",
  color: "#225c2f",
  cursor: "pointer",
  fontWeight: 900,
};

const deleteButton = {
  padding: "11px 16px",
  border: "none",
  borderRadius: "12px",
  background: "#dc2626",
  color: "white",
  cursor: "pointer",
  fontWeight: 900,
};

const ordersGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "16px",
};

const orderCard = {
  background: "#fafdf8",
  padding: "18px",
  borderRadius: "18px",
  border: "1px solid #e1efdc",
};

const orderTop = {
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
  alignItems: "center",
  flexWrap: "wrap",
  marginBottom: "12px",
};

const statusBadge = {
  background: "#e8f5e9",
  color: "#2e7d32",
  padding: "7px 10px",
  borderRadius: "999px",
  fontWeight: 900,
  fontSize: "12px",
};

const itemRow = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "6px",
  padding: "7px 0",
  borderBottom: "1px solid #e6eee4",
  gap: "10px",
};

const label = {
  display: "block",
  fontWeight: 900,
  marginBottom: "8px",
};

const productGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "20px",
};

const productCard = {
  background: "#fff",
  borderRadius: "22px",
  overflow: "hidden",
  boxShadow: "0 12px 30px rgba(23,53,31,.08)",
};

const imageWrapper = {
  height: "210px",
  background: "#f4f8f2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  position: "relative",
};

const productImage = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const deliveryBadge = {
  position: "absolute",
  left: "12px",
  bottom: "12px",
  background: "rgba(255,255,255,.93)",
  color: "#2e7d32",
  padding: "7px 10px",
  borderRadius: "999px",
  fontWeight: 900,
  fontSize: "12px",
};

const productDesc = {
  color: "#5c6f60",
  minHeight: "44px",
  marginTop: 0,
  marginBottom: "10px",
};

const priceText = {
  fontWeight: 900,
  color: "#2e7d32",
  margin: "0 0 8px",
};

const smallInfo = {
  margin: "0 0 6px",
  fontSize: "14px",
  color: "#56665a",
};

export default Admin;