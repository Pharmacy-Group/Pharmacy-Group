"use client";

import React from "react";
import { X, User, Mail, Zap, Calendar, Tag } from "lucide-react";

// CẬP NHẬT: Interface User mới từ Backend
export interface User {
  _id: string; // ID MongoDB
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

interface UserDetailModalProps {
  // Cập nhật props sử dụng User
  customer: User;
  onClose: () => void;
}

export default function CustomerDetailModal({
  customer: user, // Đổi tên biến nội bộ thành user cho rõ ràng
  onClose,
}: UserDetailModalProps) {

  // Helper để hiển thị vai trò bằng tiếng Việt
  const displayRole = user.role === "admin" ? "Quản trị viên" : "Khách hàng";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[100]">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-2xl font-bold text-gray-800">
            Chi tiết Người dùng
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <DetailItem
            icon={<User size={20} className="text-blue-500" />}
            label="Tên tài khoản"
            value={user.name}
          />
          <DetailItem
            icon={<Mail size={20} className="text-green-500" />}
            label="Email"
            value={user.email}
          />
          <DetailItem
            icon={<Tag size={20} className="text-red-500" />}
            label="Vai trò"
            value={displayRole}
          />
          <DetailItem
            icon={<Zap size={20} className="text-orange-500" />}
            label="ID (MongoDB)"
            value={user._id}
          />
          <DetailItem
            icon={<Calendar size={20} className="text-purple-500" />}
            label="Ngày tạo tài khoản"
            value={new Date(user.createdAt).toLocaleDateString()}
          />
        </div>

        <div className="mt-6 pt-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

const DetailItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
    <div className="mr-3">{icon}</div>
    <div className="flex-1">
      <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
      <p className="text-base font-medium text-gray-800">{value}</p>
    </div>
  </div>
);