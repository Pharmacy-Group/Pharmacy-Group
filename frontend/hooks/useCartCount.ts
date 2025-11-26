"use client";

import { create } from "zustand";
import Cookies from "js-cookie";

export interface CartItem {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface CartStore {
  cartCount: number;
  items: CartItem[];
  showLoginForm: boolean;
  isLoggedIn: boolean;

  setCartCount: (count: number) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (_id: string) => void;
  clearCart: () => void;

  loadLocalCart: () => void;
  fetchCartCount: () => Promise<void>;

  openLoginForm: () => void;
  closeLoginForm: () => void;
}

const CART_COOKIE_KEY = "123456tdmu";

const useCartCount = create<CartStore>((set, get) => ({
  cartCount: 0,
  items: [],
  showLoginForm: false,
  isLoggedIn: false,

  setCartCount: (count) => set({ cartCount: count }),

  loadLocalCart: () => {
    const saved = Cookies.get(CART_COOKIE_KEY);
    if (!saved) return;

    const parsed = JSON.parse(saved) as CartItem[];
    const cartCount = parsed.reduce((s, i) => s + i.quantity, 0);

    set({
      items: parsed,
      cartCount,
      isLoggedIn: false,
    });
  },

  addToCart: (item) => {
    const { items, isLoggedIn } = get();
    if (isLoggedIn) {
      return;
    }

    const exists = items.find((i) => i._id === item._id);

    let newItems: CartItem[];

    if (exists) {
      newItems = items.map((i) =>
        i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      newItems = [...items, { ...item, quantity: 1 }];
    }

    const cartCount = newItems.reduce((sum, i) => sum + i.quantity, 0);

    set({ items: newItems, cartCount });

    Cookies.set(CART_COOKIE_KEY, JSON.stringify(newItems), { expires: 7 });
  },

  removeFromCart: (_id) => {
    const { items, isLoggedIn } = get();

    if (isLoggedIn) return;

    const newItems = items.filter((i) => i._id !== _id);
    const cartCount = newItems.reduce((sum, i) => sum + i.quantity, 0);

    set({ items: newItems, cartCount });

    if (newItems.length === 0) {
      Cookies.remove(CART_COOKIE_KEY);
    } else {
      Cookies.set(CART_COOKIE_KEY, JSON.stringify(newItems), { expires: 7 });
    }
  },

  clearCart: () => {
    Cookies.remove(CART_COOKIE_KEY);

    set({
      items: [],
      cartCount: 0
    });
  },

  openLoginForm: () => set({ showLoginForm: true }),
  closeLoginForm: () => set({ showLoginForm: false }),

  fetchCartCount: async () => {
    try {
      const res = await fetch("http://localhost:5000/api/carts", {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (res.status === 401) {
        get().loadLocalCart();
        return;
      }

      if (!res.ok || !data.success) return;

      const items: CartItem[] = data.items.map((item: any) => ({
        _id: item._id,
        name: item.name,
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
        image: item.image || "",
      }));

      const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

      set({
        items,
        cartCount,
        isLoggedIn: true,
      });

      Cookies.remove(CART_COOKIE_KEY);
    } catch (err) {
      console.error("fetchCartCount error:", err);
    }
  },
}));

export default useCartCount;
