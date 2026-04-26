import { createContext, useEffect, useState } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("farmhub_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [deliveryDistance, setDeliveryDistance] = useState(() => {
    const saved = localStorage.getItem("farmhub_deliveryDistance");
    return saved ? JSON.parse(saved) : null;
  });

  const [deliveryLocation, setDeliveryLocation] = useState(() => {
    const saved = localStorage.getItem("farmhub_deliveryLocation");
    return saved ? JSON.parse(saved) : { lat: null, lng: null };
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("farmhub_orders");
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    const saved = localStorage.getItem("farmhub_coupon");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem("farmhub_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem(
      "farmhub_deliveryDistance",
      JSON.stringify(deliveryDistance)
    );
  }, [deliveryDistance]);

  useEffect(() => {
    localStorage.setItem(
      "farmhub_deliveryLocation",
      JSON.stringify(deliveryLocation)
    );
  }, [deliveryLocation]);

  useEffect(() => {
    localStorage.setItem("farmhub_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("farmhub_coupon", JSON.stringify(appliedCoupon));
  }, [appliedCoupon]);

  const subtotal = cartItems.reduce(
    (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const availableCoupons = [
    {
      code: "FARM10",
      type: "percentage",
      value: 10,
      minAmount: 150,
      label: "10% off above ₹150",
    },
    {
      code: "FRESH50",
      type: "flat",
      value: 50,
      minAmount: 500,
      label: "₹50 off above ₹500",
    },
    {
      code: "FARM100",
      type: "flat",
      value: 100,
      minAmount: 1000,
      label: "₹100 off above ₹1000",
    },
  ];

  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;

    if (subtotal < appliedCoupon.minAmount) return 0;

    if (appliedCoupon.type === "percentage") {
      return Math.round((subtotal * appliedCoupon.value) / 100);
    }

    if (appliedCoupon.type === "flat") {
      return appliedCoupon.value;
    }

    return 0;
  };

  const discountAmount = getDiscountAmount();
  const finalTotal = Math.max(subtotal - discountAmount, 0);

  const normalizeProductForCart = (product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    unit: product.unit,
    stock: product.stock,
    imageUrl: product.imageUrl,
    deliveryType: product.deliveryType,
    deliveryRadiusKm: product.deliveryRadiusKm,
    freshnessLabel: product.freshnessLabel,
    category: product.category,
    quantity: 1,
  });

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find(
        (item) => String(item.id) === String(product.id)
      );

      if (existing) {
        return prevItems.map((item) =>
          String(item.id) === String(product.id)
            ? { ...item, quantity: Number(item.quantity || 0) + 1 }
            : item
        );
      }

      return [...prevItems, normalizeProductForCart(product)];
    });
  };

  const increaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        String(item.id) === String(id)
          ? { ...item, quantity: Number(item.quantity || 0) + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          String(item.id) === String(id)
            ? { ...item, quantity: Number(item.quantity || 0) - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => String(item.id) !== String(id))
    );
  };

  const applyCoupon = (code) => {
    const normalized = code.trim().toUpperCase();
    const coupon = availableCoupons.find((c) => c.code === normalized);

    if (!coupon) {
      return { success: false, message: "Invalid coupon code" };
    }

    if (subtotal < coupon.minAmount) {
      return {
        success: false,
        message: `${coupon.code} is valid only on orders above ₹${coupon.minAmount}`,
      };
    }

    setAppliedCoupon(coupon);

    return {
      success: true,
      message: `${coupon.code} applied successfully`,
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const placeOrder = (addressData) => {
    const hasFarmDelivery = cartItems.some(
      (item) => item.deliveryType === "FARM_DELIVERY"
    );

    const newOrder = {
      id: Date.now(),
      items: [...cartItems],
      subtotal,
      discountAmount,
      couponCode: appliedCoupon?.code || null,
      totalAmount: finalTotal,
      address: addressData,
      deliveryDistance,
      deliveryType: hasFarmDelivery ? "FARM_DELIVERY" : "COURIER",
      status: "Order Placed",
      orderDate: new Date().toLocaleString(),
      paymentMethod: addressData.paymentMethod || "COD",
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        String(order.id) === String(orderId)
          ? { ...order, status: newStatus }
          : order
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setDeliveryDistance(null);
    setDeliveryLocation({ lat: null, lng: null });
    setAppliedCoupon(null);
  };

  const clearAllOrders = () => {
    setOrders([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeItem,
        clearCart,
        deliveryDistance,
        setDeliveryDistance,
        deliveryLocation,
        setDeliveryLocation,
        orders,
        placeOrder,
        clearAllOrders,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discountAmount,
        finalTotal,
        updateOrderStatus,
        availableCoupons,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}