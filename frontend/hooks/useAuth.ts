"use client";

import { useState, useEffect, useCallback } from "react";
import useCartCount from "@/hooks/useCartCount";

export interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

let globalUser: User | null = null;
let globalListeners: ((user: User | null) => void)[] = [];
let unauthorizedListeners: (() => void)[] = [];

export function updateGlobalUser(newUser: User | null) {
  globalUser = newUser;
  globalListeners.forEach((listener) => listener(globalUser));
}

export function onUnauthorized(callback: () => void) {
  unauthorizedListeners.push(callback);
}

function triggerUnauthorized() {
  unauthorizedListeners.forEach((cb) => cb());
}

export default function useAuth() {
  const [user, setUser] = useState<User | null>(globalUser);
  const [loading, setLoading] = useState<boolean>(true);
  const { fetchCartCount, setCartCount } = useCartCount();
  const API_URL = "http://localhost:5000/api/users";

  const isAuthenticated = !!user;

  useEffect(() => {
    globalListeners.push(setUser);
    return () => {
      globalListeners = globalListeners.filter((l) => l !== setUser);
    };
  }, []);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/me`, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401) {
        updateGlobalUser(null);
        triggerUnauthorized();
        setLoading(false);
        return;
      }

      if (!res.ok) {
        updateGlobalUser(null);
        setLoading(false);
        return;
      }

      const data = await res.json();
      updateGlobalUser(data || null);
    } catch {
      updateGlobalUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok)
        return {
          success: false,
          message: data.message || "Sai email/mật khẩu",
        };

      updateGlobalUser(data.user);
      fetchCartCount();
      return { success: true, user: data.user };
    } catch (err: any) {
      setLoading(false);
      return { success: false, message: err.message || "Lỗi đăng nhập" };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok)
        return { success: false, message: data.message || "Đăng ký thất bại" };

      updateGlobalUser(data.user); 
      fetchCartCount();
      return { success: true, user: data.user };
    } catch (err: any) {
      setLoading(false);
      return { success: false, message: err.message || "Lỗi server" };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
      updateGlobalUser(null);
      setCartCount(0);
      setLoading(false);
      window.location.reload()
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, message: err.message || "Lỗi đăng xuất" };
    }
  };

  const forgot = async (email: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setLoading(false);
      if (!res.ok)
        return {
          success: false,
          message: data.message || "Gửi email thất bại",
        };
      return { success: true, message: data.message };
    } catch (err: any) {
      setLoading(false);
      return { success: false, message: err.message || "Lỗi server" };
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    fetchUser,
    forgot,
    onUnauthorized,
  };
}