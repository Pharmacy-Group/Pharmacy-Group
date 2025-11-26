"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SlMagnifier } from "react-icons/sl";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { SlArrowDown, SlUserFollowing } from "react-icons/sl";
import { FaRegUserCircle } from "react-icons/fa";

import LoginModal from "@/components/user/LoginModal";
import useCartCount from "@/hooks/useCartCount";
import useAuth from "@/hooks/useAuth";

export default function Header() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { cartCount, fetchCartCount } = useCartCount();
  const { user, logout } = useAuth();

  const [hydrated, setHydrated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Hydration check
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Fetch cart count (async handled safely)
  useEffect(() => {
    const fetchCount = async () => {
      await fetchCartCount();
    };
    fetchCount();
  }, [fetchCartCount]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside dropdown to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!hydrated) return null;

  return (
    <>
      {!scrolled && (
        <div className="bg-green-600 text-white py-2 text-center text-sm">
          Hotline: <span className="font-bold">1800 1234</span>
        </div>
      )}

      <header className="bg-white shadow sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/images/logo.jpg"
              alt="Logo"
              className="h-12 rounded-md shadow-sm"
            />
          </Link>

          {/* Search */}
          <div className="hidden md:block w-1/2">
            <div className="flex border border-green-500 rounded-full overflow-hidden">
              <input
                type="text"
                placeholder="Tìm thuốc, sản phẩm..."
                className="flex-1 px-4 py-2 outline-none text-sm"
              />
              <button className="bg-green-600 text-white px-6 py-3 hover:bg-green-700 transition rounded-r-full">
                <SlMagnifier />
              </button>
            </div>
          </div>

          {/* User & Cart */}
          <div className="flex items-center space-x-4">
            {!user ? (
              <button
                onClick={() => setShowLogin(true)}
                className="text-green-600 hover:text-green-700 flex items-center space-x-1 font-medium"
              >
                <FaRegUserCircle />
                <span className="hidden sm:inline">Đăng nhập</span>
              </button>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 font-medium hover:text-blue-800"
                >
                  <SlUserFollowing />
                  <span>{user.name}</span>
                  <span
                    className={`text-xs transition-transform duration-300 ${
                      dropdownOpen ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    <SlArrowDown />
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg py-2 transition-all duration-300 ease-in-out">
                    <button
                      onClick={() => {
                        router.push("/settings");
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FiSettings /> Cài đặt
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FiLogOut /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => router.push("/carts")}
              className="flex items-center bg-gray-300 space-x-2 px-4 py-2 rounded-md transition font-medium text-green-700 hover:text-green-800"
            >
              <span className="hidden sm:inline">Giỏ hàng ({cartCount})</span>
            </button>
          </div>
        </div>
      </header>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
