import Image from "next/image";
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-green-50 text-gray-800">
      <section className="bg-[#2ea44f] py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 7h16v10H4zM9 7v10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h4 className="font-semibold text-sm">THUỐC CHÍNH HÃNG</h4>
          </div>

          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6L9 17l-5-5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h4 className="font-semibold text-sm">CAM KẾT CHẤT LƯỢNG</h4>
          </div>

          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h4 className="font-semibold text-sm">HỖ TRỢ TƯ VẤN</h4>
          </div>

          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 3h2l.4 2M7 13h10l4-8H5.4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="7"
                cy="20"
                r="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle
                cx="19"
                cy="20"
                r="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            <h4 className="font-semibold text-sm">MIỄN PHÍ VẬN CHUYỂN</h4>
          </div>
        </div>
      </section>

      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative w-28 h-8">
                <Image
                  src="/images/logo.jpg"
                  alt="Nhà Thuốc Benzen"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
              <span className="font-semibold">
                Nhà thuốc <span className="font-extrabold">BENZEN</span>
              </span>
            </div>

            <p className="text-sm">Công ty cổ phần bán lẻ Nhà thuốc Benzen</p>
            <p className="text-sm">
              Số ĐKKD 123456789 cấp 04/11/2018 tại Sở KH&ĐT TPHCM
            </p>
            <p className="text-sm">
              Địa chỉ: 338, ấp Bình Hòa, xã Phú Giáo, TP. Hồ Chí Minh
            </p>
            <p className="text-sm">
              Email:{" "}
              <a
                href="mailto:sale@nhathuocbenzen.com"
                className="underline hover:text-red-600"
              >
                BarsvTDMU@nhathuocbenzen.com
              </a>
            </p>

            <div className="flex items-center gap-3 mt-3">
              {["/images/logo.jpg"].map((src) => (
                <div key={src} className="w-20 h-10 relative">
                  <Image
                    src={src}
                    alt={src}
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">GIỚI THIỆU</h4>
            <ul className="space-y-2 text-sm">
              {[
                "Giới thiệu nhà thuốc",
                "Hướng dẫn mua hàng Online",
                "Chính sách giao hàng",
                "Chính sách thanh toán",
                "Chính sách đổi trả, bảo hành",
                "Chính sách bảo mật",
                "Thẻ tích điểm thành viên",
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:underline hover:text-blue-600">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">DANH MỤC SẢN PHẨM</h4>
            <ul className="space-y-2 text-sm">
              {[
                "Thuốc",
                "Thực phẩm chức năng",
                "Dược - Mỹ phẩm",
                "Thiết bị y tế",
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:underline hover:text-blue-500">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">KẾT NỐI VỚI BENZEN</h4>
            
            {/* Social Media Links */}
            <div className="mb-6">
              <p className="text-sm font-semibold mb-3 text-gray-700">Theo dõi chúng tôi</p>
              <div className="space-y-2">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:opacity-80 transition">
                  <Image src="/images/facebook.webp" alt="Facebook" width={24} height={24} style={{ objectFit: "contain" }} />
                  <span>Facebook</span>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:opacity-80 transition">
                  <Image src="/images/youtube.webp" alt="Youtube" width={24} height={24} style={{ objectFit: "contain" }} />
                  <span>Youtube</span>
                </a>
                <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:opacity-80 transition">
                  <Image src="/images/zalo.webp" alt="Zalo" width={24} height={24} style={{ objectFit: "contain" }} />
                  <span>Zalo</span>
                </a>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <p className="text-sm font-semibold mb-3 text-gray-700">Hỗ trợ thanh toán</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white p-1 rounded flex items-center justify-center h-10 border border-gray-200">
                  <Image src="/images/vnpay.webp" alt="VNPAY" width={40} height={24} style={{ objectFit: "contain" }} />
                </div>
                <div className="bg-white p-1 rounded flex items-center justify-center h-10 border border-gray-200">
                  <Image src="/images/visa.webp" alt="VISA" width={40} height={24} style={{ objectFit: "contain" }} />
                </div>
                <div className="bg-white p-1 rounded flex items-center justify-center h-10 border border-gray-200">
                  <Image src="/images/mastercard.webp" alt="Mastercard" width={40} height={24} style={{ objectFit: "contain" }} />
                </div>
                <div className="bg-white p-1 rounded flex items-center justify-center h-10 border border-gray-200">
                  <Image src="/images/JCB.webp" alt="JCB" width={40} height={24} style={{ objectFit: "contain" }} />
                </div>
                <div className="bg-white p-1 rounded flex items-center justify-center h-10 border border-gray-200">
                  <Image src="/images/momo.webp" alt="Momo" width={40} height={24} style={{ objectFit: "contain" }} />
                </div>
                <div className="bg-white p-1 rounded flex items-center justify-center h-10 border border-gray-200">
                  <Image src="/images/ZALOPAY.webp" alt="Zalopay" width={40} height={24} style={{ objectFit: "contain" }} />
                </div>
              </div>
            </div>

            <p className="text-sm mt-4">
              Hotline:{" "}
              <a href="tel:180029YY" className="font-medium">
                1800 29YY
              </a>
            </p>
          </div>
        </div>

        <div className="bg-[rgb(46,164,79)] text-gray-200 py-4">
          <div className="max-w-7xl mx-auto text-center px-4 text-xs space-y-1">
            <p>
              Copyright © 2023 - Nhóm 15: Xây dựng Website nhà thuốc BarsvTDMU
            </p>
            <p>Website chỉ phục vụ mục đích học tập</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
