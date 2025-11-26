"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface Product {
  image: string;
  name: string;
  price: number;
}

interface MiniCartProps {
  show: boolean;
  product: Product | null;
  onClose: () => void;
}

export default function MiniCart({ show, product, onClose }: MiniCartProps) {
  const router = useRouter();

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!product) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 25 }}
          transition={{ duration: 0.25 }}
          className="
            fixed bottom-6 right-6 z-50
            bg-white border border-gray-200 shadow-xl
            rounded-xl p-3 w-64
            flex items-center gap-3 cursor-pointer
          "
          onClick={() => router.push("/carts")}
        >
          {/* Product Image */}
          <img
            src={product.image}
            alt={product.name}
            className="w-10 h-10 rounded-lg object-cover border"
          />

          {/* Text */}
          <div className="flex-1">
            <p className="text-gray-800 font-semibold text-sm line-clamp-1">
              {product.name}
            </p>

            <p className="text-xs text-gray-500">
              Đã thêm vào giỏ • {product.price.toLocaleString()}₫
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
