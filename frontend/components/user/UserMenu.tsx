"use client";
import React, { useEffect, useState } from "react";
import { Menu } from "@headlessui/react";
import { useRouter } from "next/navigation";
import {
  ChevronDownIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import AuthModal from "./AuthModal";

interface User {
  name?: string;
  email?: string;
}

export default function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Lấy thông tin user từ localStorage hoặc session
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  return (
    <div>
      {!user ? (
        <>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Đăng nhập / Đăng ký
          </button>

          {showAuthModal && (
            <AuthModal
              isOpen={showAuthModal}
              onClose={() => setShowAuthModal(false)}
              onSuccess={() => {
                setShowAuthModal(false);
                router.push("/");
              }}
            />
          )}
        </>
      ) : (
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition">
            <UserIcon className="w-5 h-5 text-gray-600" />
            <span>{user.name || "Tài khoản"}</span>
            <ChevronDownIcon className="w-5 h-5 text-gray-600" />
          </Menu.Button>

          <Menu.Items className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-gray-100" : ""
                  } w-full text-left px-4 py-2 flex items-center gap-2 text-sm text-gray-700`}
                  onClick={() => alert("Chuyển đến trang cài đặt")}
                >
                  <Cog6ToothIcon className="w-4 h-4" /> Cài đặt
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-gray-100" : ""
                  } w-full text-left px-4 py-2 flex items-center gap-2 text-sm text-red-600`}
                  onClick={handleLogout}
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" /> Đăng xuất
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      )}
    </div>
  );
}
