import { useEffect, useState, useCallback } from "react";

export default function useProducts() {
  const API = "http://localhost:5000/api/products";

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 🔁 Dùng useCallback để tránh re-create function
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API);
      if (!res.ok) throw new Error("Không thể tải sản phẩm");
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }, [API]);

  // 🧩 Hàm thêm sản phẩm
  const createProduct = async (data: FormData | Record<string, any>, p0: boolean) => {
    try {
      const isFormData = data instanceof FormData;

      const res = await fetch(API, {
        method: "POST",
        body: isFormData ? data : JSON.stringify(data),
        headers: isFormData ? undefined : { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Thêm sản phẩm thất bại");
      const newProduct = await res.json();
      setProducts((prev) => [...prev, newProduct]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 🧩 Hàm cập nhật sản phẩm
  const updateProduct = async (id: string, data: FormData | Record<string, any>, p0: boolean) => {
    try {
      const isFormData = data instanceof FormData;

      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        body: isFormData ? data : JSON.stringify(data),
        headers: isFormData ? undefined : { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Cập nhật sản phẩm thất bại");
      const updated = await res.json();
      setProducts((prev) => prev.map((p) => (p._id === id ? updated : p)));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 🗑️ Hàm xóa sản phẩm
  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Xóa sản phẩm thất bại");
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    loadProducts,
  };
}
