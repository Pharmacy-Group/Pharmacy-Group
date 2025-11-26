"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

interface Product {
  _id: string;
  id: number;
  name: string;
  desc: string;
  price: number;
  image: string;
  unit: string;
  discount: number;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/id/${id}`);
        if (!res.ok) throw new Error("Không tìm thấy sản phẩm");
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Thêm giỏ hàng qua backend đúng chuẩn
  const addToCart = async () => {
    if (!product) return;
    setAdding(true);

    try {
      const res = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // gửi cookie session
        body: JSON.stringify({
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        }),
      });

      if (res.status === 401) {
        toast.error("Bạn cần đăng nhập để thêm giỏ hàng");
        setAdding(false);
        return;
      }

      if (!res.ok) throw new Error("Không thể thêm sản phẩm vào giỏ");

      toast.success("Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="text-center py-10">Đang tải sản phẩm...</div>;
  if (!product) return <div className="text-center py-10">Không tìm thấy sản phẩm.</div>;

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="flex justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="w-[300px] h-[300px] object-contain rounded-lg shadow-md"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-3">{product.name}</h1>

          <p className="text-blue-600 text-2xl font-bold mb-2">
            {product.price.toLocaleString()}₫
            <span className="text-gray-600 text-sm ml-1">/ {product.unit}</span>
          </p>

          <p className="text-gray-700 mb-6">{product.desc}</p>

          <div className="flex items-center mb-6">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 border rounded-l-lg hover:bg-gray-100"
            >
              <Minus size={18} />
            </button>
            <span className="px-4 py-2 border-t border-b">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 border rounded-r-lg hover:bg-gray-100"
            >
              <Plus size={18} />
            </button>
          </div>

          <button
            onClick={addToCart}
            disabled={adding}
            className={`bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 ${
              adding ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            <ShoppingCart size={20} /> {adding ? "Đang thêm..." : "Thêm vào giỏ"}
          </button>
        </div>
      </div>
    </div>
  );
}
