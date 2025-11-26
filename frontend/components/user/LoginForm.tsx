"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import useCartCount from "@/hooks/useCartCount";
import toast, { Toaster } from "react-hot-toast";
import {
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  KeyIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

interface Props {
  onChangeMode: (mode: "login" | "register" | "forgot") => void;
  onClose: () => void;
  onSuccess?: () => void; // callback cho parent
}

export default function LoginForm({ onChangeMode, onClose, onSuccess }: Props) {
  const { login, loading } = useAuth();
  const { fetchCartCount } = useCartCount();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await login(email, password);

      if (data.success && data.user) {
        await fetchCartCount(); // cập nhật số lượng giỏ hàng
        if (onSuccess) await onSuccess(); // parent có thể fetchCart hoặc update MiniCart
        toast.success("Đăng nhập thành công!");
        onClose(); // đóng modal
      } else {
        setError(data.message || "Sai email hoặc mật khẩu");
      }
    } catch (err: any) {
      setError(err.message || "Lỗi khi đăng nhập");
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="relative bg-[#f1f8f2] rounded-xl shadow-2xl flex w-[700px] h-[420px] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10"
        >
          <XMarkIcon className="w-8 h-8" />
        </button>

        <div className="relative w-1/2 bg-gray-100 hidden md:block m-10">
          <Image
            src="/images/cuahang.jpg"
            alt="Login Illustration"
            fill
            className="rounded-lg object-contain"
          />
        </div>

        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-4 text-center">Đăng nhập</h2>

          <form onSubmit={handleLogin} className="space-y-3 py-4">
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                className="w-full border border-gray-200 rounded-md p-2 pl-10 focus:ring-2 focus:ring-green-600 outline-none bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                className="w-full border border-gray-200 rounded-md p-2 pl-10 pr-10 focus:ring-2 focus:ring-green-600 outline-none bg-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>

            {error && <div className="text-red-600 text-sm text-center">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="text-sm text-center mt-3">
            <button
              onClick={() => onChangeMode("forgot")}
              className="text-blue-600 hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              Quên mật khẩu?
            </button>
            <div className="mt-2 flex items-center justify-center gap-1">
              Bạn chưa có tài khoản?{" "}
              <button
                onClick={() => onChangeMode("register")}
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                <UserPlusIcon className="w-4 h-4" /> Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
