"use client";
import { ChevronDown } from "lucide-react";
import React, { useState, useEffect } from 'react';

// Định nghĩa Interface User (Phải khớp với /api/users/me trả về)
interface User {
  id: string; // Hoặc _id
  name: string;
  email: string;
  role: "user" | "admin";
}

export default function Header() {
  // State để lưu thông tin người dùng đã đăng nhập
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Gọi API /api/users/me để lấy thông tin người dùng đang đăng nhập
        const res = await fetch("http://localhost:5000/api/users/me", {
          method: "GET",
          // Bắt buộc phải có để gửi Session Cookie
          credentials: "include", 
        });

        if (res.ok) {
          const data = await res.json();
          // Backend trả về { success: true, user: { ... } }
          setUser(data.user); 
        } else {
          // Xử lý trường hợp chưa đăng nhập (401)
          setUser(null); 
        }
      } catch (error) {
        console.error("Lỗi khi fetch user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Nếu đang tải hoặc chưa có user (chưa đăng nhập), hiển thị trạng thái mặc định
  if (loading) {
    return (
      <header className="h-16 w-full bg-white shadow fixed top-0 right-0 z-50 flex justify-between items-center px-8">
        <div className="font-medium text-gray-600">
          Quản lí sản phẩm / Danh sách sản phẩm
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500">Đang tải...</span>
        </div>
      </header>
    );
  }

  // Xác định vai trò để hiển thị tên
  const displayName = user ? (user.name || "Người dùng") : "Khách";
  const displayRole = user?.role === "admin" ? "Admin" : "Khách hàng";

  // Khi đã đăng nhập và là admin
  const isAdmin = user?.role === "admin";
  const adminClass = isAdmin ? "text-green-600 font-bold" : "text-gray-500";


  return (
    <header className="h-16 w-full bg-white shadow fixed top-0 right-0 z-50 flex justify-between items-center px-8">
      <div className="font-medium text-gray-600">
        TRANG QUẢN TRỊ VIÊN
      </div>

      <div 
        className={`flex items-center gap-3 px-3 py-1 rounded-lg ${user ? 'cursor-pointer hover:bg-gray-100' : 'cursor-default'}`}
      >
        <img
          src="/images/programmer.png"
          alt={displayRole}
          className="w-9 h-9 rounded-full border-2 border-green-500"
        />
        <div className="flex flex-col text-sm leading-none">
          <span className="font-bold text-gray-800">{displayName}</span>
          <span className={`text-xs ${adminClass}`}>{displayRole}</span>
        </div>
        
        {user && <ChevronDown size={16} />} 
      </div>
    </header>
  );
}