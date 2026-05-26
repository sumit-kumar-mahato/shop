"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string; // unique item id: productId-size-color
  productId: string;
  title: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  stock: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  gst: number;
  discount: number;
  finalTotal: number;
  appliedCoupon: { code: string; type: "PERCENTAGE" | "FIXED"; value: number } | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  shippingFee: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<CartContextType["appliedCoupon"]>(null);
  const [shippingFee, setShippingFee] = useState<number>(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error loading cart", e);
      }
    }
    const savedCoupon = localStorage.getItem("coupon");
    if (savedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(savedCoupon));
      } catch (e) {}
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem("coupon", JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem("coupon");
    }
  }, [appliedCoupon]);

  const addToCart = (newItem: Omit<CartItem, "id">) => {
    const id = `${newItem.productId}-${newItem.size}-${newItem.color}`;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) =>
          item.id === id
            ? { ...item, quantity: Math.min(item.quantity + newItem.quantity, item.stock) }
            : item
        );
      }
      return [...prev, { ...newItem, id }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/coupons/validate?code=${encodeURIComponent(code)}`);
      if (response.ok) {
        const coupon = await response.json();
        setAppliedCoupon({
          code: coupon.code,
          type: coupon.discountType,
          value: coupon.value,
        });
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Apparel GST is 12%
  const gst = Math.round(subtotal * 0.12 * 100) / 100;

  // Calculate discount
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "PERCENTAGE") {
      discount = Math.round(subtotal * (appliedCoupon.value / 100) * 100) / 100;
    } else {
      discount = Math.min(appliedCoupon.value, subtotal);
    }
  }

  // Shipping logic (free shipping above 2000 INR)
  useEffect(() => {
    if (subtotal > 0 && subtotal < 2000) {
      setShippingFee(150);
    } else {
      setShippingFee(0);
    }
  }, [subtotal]);

  const finalTotal = Math.max(0, subtotal + gst - discount + shippingFee);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        gst,
        discount,
        finalTotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        shippingFee,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
