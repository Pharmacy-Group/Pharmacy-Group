"use client";

import React, { useEffect, useRef, useState } from "react";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import {
  Trophy,
  Brain,
  Pill,
  HeartPulse,
  Shield,
  Stethoscope,
  Cross,
  Apple,
  Syringe,
  Smile,
  User,
  Heart,
} from "lucide-react";
import { BsFire } from "react-icons/bs";
import MiniCart from "../carts/MiniCart";
import useProducts from "@/hooks/useProducts";
import useCartActions from "@/hooks/useCartActions";
import { useRouter } from "next/navigation";



const ITEM_WIDTH = 225;
const ITEM_GAP = 16;
const VISIBLE_COUNT = 5;

export default function ProductSection() {
  const router = useRouter();
  const { products, loading } = useProducts();
  const { handleAddToCart, showMiniCart, addedProduct, closeMiniCart, showLoginConfirm, closeLoginConfirm, fetchCart } =
    useCartActions();

  const containerRefs = {
    top: useRef<HTMLDivElement | null>(null),
    bottom: useRef<HTMLDivElement | null>(null),
    bestseller: useRef<HTMLDivElement | null>(null),
  };

useEffect(() => {
    fetchCart();
}, [fetchCart]);

  const [scrollState, setScrollState] = useState({
    leftTop: false,
    rightTop: true,
    leftBottom: false,
    rightBottom: true,
    leftBestseller: false,
    rightBestseller: true,
  });

  const handleScroll = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: "prev" | "next"
  ) => {
    if (!ref.current) return;
    const amount = (ITEM_WIDTH + ITEM_GAP) * VISIBLE_COUNT;
    ref.current.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  const updateScrollButtons = (
    ref: React.RefObject<HTMLDivElement | null>,
    type: "Top" | "Bottom" | "Bestseller"
  ) => {
    if (!ref.current) return;
    const el = ref.current;
    setScrollState((prev) => ({
      ...prev,
      [`left${type}`]: el.scrollLeft > 5,
      [`right${type}`]: el.scrollLeft + el.clientWidth < el.scrollWidth - 5,
    }));
  };

  useEffect(() => {
    const handlers = {
      top: () => updateScrollButtons(containerRefs.top, "Top"),
      bottom: () => updateScrollButtons(containerRefs.bottom, "Bottom"),
      bestseller: () =>
        updateScrollButtons(containerRefs.bestseller, "Bestseller"),
    };

    const topEl = containerRefs.top.current;
    const bottomEl = containerRefs.bottom.current;
    const bestEl = containerRefs.bestseller.current;

    topEl?.addEventListener("scroll", handlers.top);
    bottomEl?.addEventListener("scroll", handlers.bottom);
    bestEl?.addEventListener("scroll", handlers.bestseller);

    return () => {
      topEl?.removeEventListener("scroll", handlers.top);
      bottomEl?.removeEventListener("scroll", handlers.bottom);
      bestEl?.removeEventListener("scroll", handlers.bestseller);
    };
  }, []);

  const categories = [
    { icon: "Brain", title: "Thần kinh não", products: 55 },
    { icon: "Pill", title: "Vitamin & Khoáng chất", products: 110 },
    { icon: "HeartPulse", title: "Sức khỏe tim mạch", products: 23 },
    { icon: "Shield", title: "Tăng sức đề kháng, miễn dịch", products: 40 },
    { icon: "Stethoscope", title: "Hỗ trợ tiêu hóa", products: 64 },
    { icon: "Cross", title: "Sinh lý - Nội tiết tố", products: 39 },
    { icon: "Apple", title: "Dinh dưỡng", products: 37 },
    { icon: "Syringe", title: "Hỗ trợ điều trị", products: 119 },
    { icon: "Smile", title: "Giải pháp làn da", products: 93 },
    { icon: "User", title: "Chăm sóc da mặt", products: 212 },
    { icon: "User", title: "Hỗ trợ làm đẹp", products: 22 },
    { icon: "Heart", title: "Hỗ trợ tình dục", products: 41 },
  ];

  const iconMap: Record<string, React.FC<any>> = {
    Brain,
    Pill,
    HeartPulse,
    Shield,
    Stethoscope,
    Cross,
    Apple,
    Syringe,
    Smile,
    User,
    Heart,
  };
  
  const mockBrands = [
    {
      id: 1,
      image: "/images/thuoc11.jpg",
      logo: "/images/logo-Brauer.jpg",
      discount: "Giảm giá đến 20%",
    },
    {
      id: 2,
      image: "/images/thuoc.jpg",
      logo: "/images/logo-JpanWell.jpg",
      discount: "Giảm giá đến 15%",
    },
    {
      id: 3,
      image: "/images/thuoc14.jpg",
      logo: "/images/logo-Datino.jpg",
      discount: "Giảm giá đến 30%",
    },
    {
      id: 4,
      image: "/images/thuoc17.jpg",
      logo: "/images/logo-KamiCare.jpg",
      discount: "Giảm giá đến 25%",
    },
    {
      id: 5,
      image: "/images/thuoc10.jpg",
      logo: "/images/logo-Ocavill.jpg",
      discount: "Giảm giá đến 10%",
    },
    {
      id: 6,
      image: "/images/thuoc15.jpg",
      logo: "/images/logo-Okamoto.jpg",
      discount: "Giảm giá đến 18%",
    },
    {
      id: 7,
      image: "/images/thuoc16.jpg",
      logo: "/images/logo-PearlieWhite.jpg",
      discount: "Giảm giá đến 12%",
    },
    {
      id: 8,
      image: "/images/thuoc13.jpg",
      logo: "/images/logo-Vitabiotics.jpg",
      discount: "Giảm giá đến 22%",
    },
    {
      id: 9,
      image: "/images/thuoc12.jpg",
      logo: "/images/logo-VitaminsForLife.jpg",
      discount: "Giảm giá 16%",
    },
  ];

  const renderProductCard = (p: any) => (
    <div
      key={p._id}
      style={{width: ITEM_WIDTH}}
      className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md flex-shrink-0 border border-transparent hover:border-blue-600">

      {/* Image wrapper */}
      <div className="relative w-full h-[150px] flex items-center justify-center mb-3 overflow-hidden">
        <img
          src={p.image}
          alt={p.name}
          className="object-contain w-full h-full"
        />
        {p.discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{p.discount}%
          </span>
        )}
      </div>

      {/* Name */}
      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[40px]">
        {p.name}
      </h3>

      {/* Description */}
      <p className="text-gray-500 text-xs mt-1 mb-2 line-clamp-2 min-h-[34px]">
        {p.desc}
      </p>

      {/* Price */}
      <div className="text-blue-600 font-semibold mb-3">
        {p.price.toLocaleString("vi-VN")}₫ / {p.unit || "Hộp"}
      </div>

      {/* Button */}
      <button
        onClick={() => handleAddToCart(p, true)}
        className="mt-auto cursor-pointer w-full py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-sm font-semibold"
      >
        Thêm vào giỏ
      </button>
    </div>
  );

  const renderFlashSaleProduct = (p: any) => {
    const discountedPrice = Math.round(p.price * (1 - p.discount / 100));
    return (
      <div
        key={p._id}
        style={{ width: ITEM_WIDTH }}
        className="relative bg-gradient-to-tr from-red-100 via-red-200 to-red-100 p-4 rounded-3xl shadow-lg hover:shadow-2xl flex-shrink-0 flex flex-col group overflow-hidden"
      >
        {/* Flash sale label */}
        <div className="absolute top-2 right-2 bg-yellow-400 text-red-600 font-bold text-xs px-3 py-1 rounded-full animate-pulse shadow-lg z-10">
          Giảm sốc hôm nay!
        </div>

        {/* Hình + badge giảm giá */}
        <div className="relative w-full h-[160px] flex items-center justify-center mb-3 overflow-hidden rounded-2xl bg-white">
          <img
            src={p.image}
            alt={p.name}
            className="object-contain w-[130px] h-[130px] transition-transform duration-300 group-hover:scale-110"
          />
          {p.discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse shadow-md">
              -{p.discount}%
            </span>
          )}
        </div>

        {/* Tên sản phẩm */}
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
          {p.name}
        </h3>
        <p className="text-gray-600 text-xs mt-1 mb-2 line-clamp-2">{p.desc}</p>

        {/* Giá */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-gray-400 line-through text-sm">
            {p.price.toLocaleString("vi-VN")}₫
          </span>
          <span className="text-red-600 font-bold text-lg">
            {discountedPrice.toLocaleString("vi-VN")}₫
          </span>
        </div>

        {/* Nút mua */}
        <button
          onClick={() => {
            handleAddToCart(p, true);
          }}
          className="mt-auto py-2 w-full bg-red-600 text-white font-semibold rounded-xl shadow-md hover:bg-red-700 hover:scale-105 transition-all text-sm"
        >
          Mua ngay
        </button>

        {/* Hiệu ứng lấp lánh */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div
            className="w-2 h-2 bg-yellow-300 rounded-full absolute animate-ping"
            style={{ top: "20%", left: "10%" }}
          ></div>
          <div
            className="w-1.5 h-1.5 bg-yellow-400 rounded-full absolute animate-ping delay-150"
            style={{ top: "50%", left: "70%" }}
          ></div>
          <div
            className="w-2 h-2 bg-yellow-300 rounded-full absolute animate-ping delay-300"
            style={{ top: "80%", left: "40%" }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <section className="mt-10 space-y-12">
      <div className="max-w-[1200px] mx-auto">
        <div className="w-full mt-10">
          <h2 className="text-2xl font-bold text-red-600 flex items-center gap-2">
            <img src="/images/checklist.png" alt="icon" width={26} /> FLASH SALE
            hôm nay
          </h2>
          <div className="relative">
            {scrollState.leftTop && (
              <button
                onClick={() => handleScroll(containerRefs.top, "prev")}
                className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center z-10"
              >
                <SlArrowLeft />
              </button>
            )}
            <div
              ref={containerRefs.top}
              className="flex gap-4 overflow-x-auto scrollbar-hide py-2"
            >
              {loading
                ? Array.from({ length: VISIBLE_COUNT }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[215px] h-[360px] bg-gray-200 animate-pulse rounded-3xl flex-shrink-0"
                  />
                ))
                : products
                  .filter((p) => p.discount > 0)
                  .map(renderFlashSaleProduct)}
            </div>
            {scrollState.rightTop && (
              <button
                onClick={() => handleScroll(containerRefs.top, "next")}
                className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center z-10"
              >
                <SlArrowRight />
              </button>
            )}
          </div>
        </div>

        <div className="w-full py-10">
          <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
            <Trophy className="text-green-600 w-6 h-6" /> Danh mục nổi bật
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((item, idx) => {
              const Icon = iconMap[item.icon];
              return (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition border border-transparent hover:border-blue-600 flex flex-col items-center"
                >
                  {Icon && <Icon className="w-8 h-8 text-green-600 mb-2" />}
                  <h3 className="font-medium text-gray-800 text-center">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {item.products} sản phẩm
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
            <img src="/images/checklist.png" alt="icon" width={26} /> Thương hiệu
            yêu thích
          </h2>
          <div className="relative">
            {scrollState.leftBottom && (
              <button
                onClick={() => handleScroll(containerRefs.bottom, "prev")}
                className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center z-10 text-blue-600"
              >
                <SlArrowLeft />
              </button>
            )}
            <div
              ref={containerRefs.bottom}
              className="flex gap-4 overflow-x-auto scrollbar-hide py-2"
            >
              {mockBrands.map((brand) => (
                <div
                  key={brand.id}
                  style={{width: ITEM_WIDTH}}
                  className="bg-white p-2 rounded-xl shadow-sm hover:shadow-md flex-shrink-0 border border-transparent hover:border-blue-600"
                >
                  <div className="h-40 flex items-center justify-center mb-2">
                    <img
                      src={brand.image}
                      alt="Sản phẩm"
                      className="object-contain max-h-full"
                    />
                  </div>
                  <div className="h-16 flex items-center justify-center rounded-xl border border-gray-200 mb-2">
                    <img
                      src={brand.logo}
                      alt="Logo"
                      className="object-contain max-h-full"
                    />
                  </div>
                  <div className="text-center font-medium text-blue-600">
                    {brand.discount}
                  </div>
                </div>
              ))}
            </div>
            {scrollState.rightBottom && (
              <button
                onClick={() => handleScroll(containerRefs.bottom, "next")}
                className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center z-10 text-blue-600"
              >
                <SlArrowRight />
              </button>
            )}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-bold text-green-700 flex items-center gap-2">
            <BsFire className="text-green-600 w-6 h-6" /> Sản phẩm bán chạy
          </h2>
          <div className="relative">
            {scrollState.leftBestseller && (
              <button
                onClick={() => handleScroll(containerRefs.bestseller, "prev")}
                className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center z-10 text-blue-600"
              >
                <SlArrowLeft />
              </button>
            )}
            <div
              ref={containerRefs.bestseller}
              className="flex gap-4 overflow-x-auto scrollbar-hide py-10"
            >
              {loading
                ? Array.from({ length: VISIBLE_COUNT }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[225px] bg-gray-200 animate-pulse rounded-2xl flex-shrink-0"
                  />
                ))
                : products.map(renderProductCard)}
            </div>
            {scrollState.rightBestseller && (
              <button
                onClick={() => handleScroll(containerRefs.bestseller, "next")}
                className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center z-10 text-blue-600"
              >
                <SlArrowRight />
              </button>
            )}
          </div>
        </div>

        {showLoginConfirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
            <div className="bg-white px-5 py-4 rounded-xl shadow-lg animate-fadeIn text-center">
              <p className="text-gray-800 font-medium text-[16px]">
                Bạn cần đăng nhập để thực hiện thao tác này
              </p>
            </div>
          </div>
        )}


        <MiniCart
          show={showMiniCart}
          onClose={closeMiniCart}
          product={addedProduct}
        />
      </div>

    </section>
  );
}
