"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import useCartCount, { CartItem } from "@/hooks/useCartCount";
import Cookies from "js-cookie";

const CART_COOKIE_KEY = "123456tdmu";
const API_URL = "http://localhost:5000/api/carts";

export default function useCartActions() {
  const { setCartCount, addToCart, removeFromCart, clearCart } = useCartCount();

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = Cookies.get(CART_COOKIE_KEY);
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [showMiniCart, setShowMiniCart] = useState(false);
  const [addedProduct, setAddedProduct] = useState<CartItem | null>(null);
  const [showLoginConfirm, setShowLoginConfirm] = useState(false);

  useEffect(() => {
    if (cartItems.length > 0) {
      Cookies.set(CART_COOKIE_KEY, JSON.stringify(cartItems), { expires: 7 });
    }
  }, [cartItems]);

  useEffect(() => {
    if (!showMiniCart) return;
    const timer = setTimeout(() => setShowMiniCart(false), 3000);
    return () => clearTimeout(timer);
  }, [showMiniCart]);

  useEffect(() => {
    if (!showLoginConfirm) return;
    const timer = setTimeout(() => setShowLoginConfirm(false), 2500);
    return () => clearTimeout(timer);
  }, [showLoginConfirm]);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch(API_URL, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401) {
        console.log("⚠️ Phiên đăng nhập hết hạn -> Xóa dữ liệu cục bộ");
        setCartItems([]);
        setCartCount(0);
        Cookies.remove(CART_COOKIE_KEY);

        return;
      }

      const data = await res.json();

      if (res.ok && data.success) {
        console.log("✅ Đã đồng bộ giỏ hàng từ Server");
        setCartItems(data.items);
        setCartCount(data.total);

        Cookies.set(CART_COOKIE_KEY, JSON.stringify(data.items), { expires: 7 });
      } else {
        console.error("Lỗi dữ liệu giỏ hàng:", data);
        toast.error("Không thể đồng bộ giỏ hàng");
      }
    } catch (error) {
      console.error("Lỗi kết nối Server:", error);

    }
  }, [setCartCount]);

  const handleAddToCart = async (product: any, showPopup: boolean = true): Promise<boolean> => {

    const productId = product._id || product.id;
    if (!productId) {
      console.error("❌ Sản phẩm thiếu ID:", product);
      toast.error("Lỗi dữ liệu sản phẩm!");
      return false;
    }

    try {
      // Đây là điểm quan trọng: Frontend chỉ gửi ID và Quantity
      // Backend đã được sửa để tìm kiếm các thông tin khác (name, price, image)
      // dựa trên productId này.
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: productId, quantity: 1 }), // Đã đúng
      });

      if (res.status === 401) {
        setShowLoginConfirm(true);
        return false;
      }

      const data = await res.json();

      if (!res.ok || !data.success) {

        const msg = data.message || data.error || "Thêm thất bại";
        toast.error(msg);
        return false;
      }

      setCartItems(data.items);
      setCartCount(data.total);

      addToCart(product);
      setAddedProduct(product);

      if (showPopup) {
        setShowMiniCart(true);
      }

      toast.success(`${product.name} đã thêm vào giỏ`);
      return true;

    } catch (error) {
      console.error("Add Cart Error:", error);
      toast.error("Lỗi kết nối server!");
      return false;
    }
  };

  const handleRemoveFromCart = async (_id: string) => {
    try {
      const res = await fetch(`${API_URL}/remove`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id }),
      });

      if (res.status === 401) {
        setShowLoginConfirm(true);
        return;
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Xóa thất bại");
        return;
      }

      setCartItems(data.items);
      setCartCount(data.total);
      removeFromCart(_id);
      toast.success("Đã xóa sản phẩm");

    } catch (error) {
      console.error("🔥 Remove Cart Error:", error);
      toast.error("Lỗi kết nối server!");
    }
  };

  const clearAllCart = () => {
    clearCart();
    setCartItems([]);
    setCartCount(0);
    Cookies.remove(CART_COOKIE_KEY);
  };

  const handleLogout = () => {
    clearAllCart();
    window.location.reload();
  }
  return {
    cartItems,
    addedProduct,
    showMiniCart,
    showLoginConfirm,

    fetchCart,
    handleAddToCart,
    handleRemoveFromCart,

    openLoginConfirm: () => setShowLoginConfirm(true),
    closeLoginConfirm: () => setShowLoginConfirm(false),
    closeMiniCart: () => setShowMiniCart(false),

    clearCart: clearAllCart,
    handleLogout,
  };
}