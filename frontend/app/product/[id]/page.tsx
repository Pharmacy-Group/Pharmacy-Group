"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Trash2, Minus, Plus, X, Check } from "lucide-react";
import toast from "react-hot-toast";
import useCartCount from "@/hooks/useCartCount";
import useAddressData from "@/hooks/useAddressData";
import { SlArrowLeft } from "react-icons/sl";

// Sử dụng interface chính xác như trong Cart Model của Backend
interface CartItem {
  // Sử dụng _id vì MongoDB lưu trữ nó như vậy
  _id: string; // Đã sửa từ productId thành _id
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

interface Cart {
  items: CartItem[];
}
interface Voucher {
  code: string;
  text: string;
  value: number;
  type: "discount" | "shipping";
}

const API_URL = "http://localhost:5000/api/carts";

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  // Thay đổi selectedItems để lưu _id sản phẩm
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const { setCartCount } = useCartCount();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [invoiceType, setInvoiceType] = useState("company");
  const [showVoucherSelector, setShowVoucherSelector] = useState(false);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState<string | null>(
    null
  );

  const vouchers: Voucher[] = [
    { code: "GIAM10", text: "Giảm 10%", value: 10, type: "discount" },
    {
      code: "SHIPFREE",
      text: "Miễn phí vận chuyển",
      value: 30000,
      type: "shipping",
    },
  ];
  const [deliveryMethod, setDeliveryMethod] = useState<"home" | "store">(
    "home"
  );

  const {
    provinces,
    districts,
    wards,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange,
  } = useAddressData();

  // Dùng useCallback cho fetchCart để tránh re-render không cần thiết
  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch(API_URL, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Không thể tải giỏ hàng");
      const data = await res.json();
      setCart(data);
      setCartCount(
        data.items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0)
      );
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải giỏ hàng");
    }
  }, [setCartCount]);

  useEffect(() => {
    setMounted(true);
    fetchCart();
  }, [fetchCart]); // Thêm fetchCart vào dependencies

  // Đồng bộ local storage (không cần thiết nếu chỉ dùng state/server)
  useEffect(() => {
    if (cart) {
      const qty = cart.items.reduce((s, it) => s + it.quantity, 0);
      localStorage.setItem("cartCount", String(qty));
      // window.dispatchEvent(new Event("storage")); // Bỏ comment nếu hook useCartCount cần sự kiện này
    }
  }, [cart]);

  const handleSelectAll = () => {
    if (!cart) return;
    setSelectedItems(
      selectedItems.length === cart.items.length
        ? []
        : cart.items.map((i) => i._id)
    );
  };

  const handleSelectOne = (productId: string) => {
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Hàm API cập nhật số lượng
  const handleUpdateQuantity = async (productId: string, newQty: number) => {
    if (newQty < 1) return;

    try {
      const res = await fetch(`${API_URL}/update-quantity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Cần thiết nếu bạn dùng cookie cho xác thực
        body: JSON.stringify({ productId, quantity: newQty }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Cập nhật thất bại");
      }

      // Cập nhật state bằng dữ liệu mới từ Server
      setCart(data);
      setCartCount(data.total);
      toast.success(`Cập nhật số lượng thành công!`);

    } catch (error: any) {
      console.error("Lỗi cập nhật số lượng:", error);
      toast.error(error.message || "Không thể cập nhật số lượng sản phẩm");
      fetchCart(); // Đồng bộ lại trạng thái chính xác từ Server nếu lỗi
    }
  };

  // Sửa: Dùng _id để xóa và gọi API
  const handleRemove = async (productId: string) => {
    try {
      const res = await fetch(`${API_URL}/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ _id: productId }), // Backend nhận _id
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCart(data);
      setCartCount(
        data.items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0)
      );
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
      setSelectedItems(prev => prev.filter(id => id !== productId)); // Bỏ chọn nếu bị xóa
    } catch {
      toast.error("Không thể xóa sản phẩm");
    }
  };

  // Sửa: Gọi hàm API khi thay đổi số lượng
  const updateQuantity = (productId: string, delta: number) => {
    const currentItem = cart?.items.find((i) => i._id === productId);

    if (!currentItem) return;

    const newQty = currentItem.quantity + delta;

    if (newQty < 1) {
      // Nếu giảm xuống 0 hoặc âm, mở modal xác nhận xóa
      setDeletingProduct(productId);
      setShowConfirm(true);
      return;
    }

    // Optimistic update (tùy chọn) - thay đổi UI ngay lập tức
    setCart((prev) =>
      prev
        ? {
          ...prev,
          items: prev.items.map((item) =>
            item._id === productId
              ? { ...item, quantity: newQty }
              : item
          ),
        }
        : prev
    );

    // Gửi API cập nhật số lượng lên Server
    handleUpdateQuantity(productId, newQty);
  };

  const total =
    cart?.items
      // Dùng _id để filter
      .filter((i) => selectedItems.includes(i._id))
      .reduce((sum, i) => sum + i.price * i.quantity, 0) || 0;

  if (!mounted) return null;

  const inputStyle = "border rounded-lg px-3 py-2 w-full border-gray-400";
  const selectStyle = "border rounded-lg px-3 py-2 bg-gray-100 border-gray-400";
  const btnStyle = "rounded-lg px-4 py-2 transition cursor-pointer";
  const iconBtn =
    "w-8 h-8 flex items-center justify-center border rounded-md hover:bg-gray-100 cursor-pointer";

  return (
    <div className="relative min-h-screen bg-gray-100 py-2 flex justify-center">
      <div className="absolute px-6 py-2 w-[1200px] flex flex-col">
        <button
          onClick={() => {
            if (showCheckout) {
              setShowCheckout(false);
            } else {
              window.location.href = "/";
            }
          }}
          className="flex items-center text-blue-600 font-medium hover:underline"
        >
          <span className="mr-1">
            <SlArrowLeft />
          </span>
          {showCheckout ? "Quay lại giỏ hàng" : "Tiếp tục mua sắm"}
        </button>

        {showCheckout && (
          <p className="text-gray-700 font-semibold ml-6">Danh sách sản phẩm</p>
        )}
      </div>

      <div className="mt-16 max-w-6xl w-full grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 items-start">
        <div>
          <div className="bg-white rounded-xl shadow">
            <div className="bg-[#f0fbff] p-2 text-center rounded-t-xl text-sm text-gray-600">
              Miễn phí vận chuyển với đơn trên 300.000đ
            </div>

            <div className="p-4 border-b border-gray-200 flex items-center gap-2 text-blue-700 font-semibold">
              <input
                type="checkbox"
                checked={
                  cart?.items.length === selectedItems.length &&
                  cart.items.length > 0
                }
                onChange={handleSelectAll}
                className="accent-blue-600 w-4 h-4 cursor-pointer"
              />
              <span>Chọn tất cả ({cart?.items.length || 0})</span>
            </div>

            {!cart || cart.items.length === 0 ? (
              <p className="text-gray-500 text-center py-12 text-lg">
                Giỏ hàng của bạn đang trống
              </p>
            ) : (
              <div>
                {cart.items.map((item) => (
                  <div
                    key={item._id} // Dùng _id
                    className="p-5 flex items-center gap-4 border-t border-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item._id)} // Dùng _id
                      onChange={() => handleSelectOne(item._id)} // Dùng _id
                      className="accent-blue-600 w-4 h-4 cursor-pointer"
                    />
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl p-1 border border-gray-200"
                    />

                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        Thông tin sản phẩm đang được cập nhật
                      </p>
                      <p className="text-blue-600 font-semibold mt-2">
                        {item.price.toLocaleString()}đ
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item._id, -1)
                        }
                        className={iconBtn}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item._id, 1)
                        }
                        className={iconBtn}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setDeletingProduct(item._id);
                        setShowConfirm(true);
                      }}
                      className="text-red-500 hover:text-red-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showCheckout && (
            <>
              <div className="flex justify-between items-center rounded-xl mt-6">
                <h2 className="font-semibold text-gray-700">
                  Chọn hình thức nhận hàng
                </h2>
                <div className="flex bg-white rounded-lg">
                  <button
                    onClick={() => setDeliveryMethod("home")}
                    className={`${btnStyle} ${deliveryMethod === "home"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    Giao hàng tận nơi
                  </button>
                  <button
                    onClick={() => setDeliveryMethod("store")}
                    className={`${btnStyle} ${deliveryMethod === "store"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    Nhận tại nhà thuốc
                  </button>
                </div>
              </div>

              {deliveryMethod === "home" ? (
                <div className="bg-white rounded-xl shadow p-6 mt-4">
                  <section className="space-y-6">
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">
                        Thông tin người nhận
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Họ và tên"
                          className={inputStyle}
                        />
                        <input
                          type="text"
                          placeholder="Số điện thoại"
                          className={inputStyle}
                        />
                      </div>
                      <input
                        type="email"
                        placeholder="Email (không bắt buộc)"
                        className={`${inputStyle} mt-3`}
                      />
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">
                        Địa chỉ nhận hàng
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <select
                          className={selectStyle}
                          onChange={handleProvinceChange}
                          value={selectedProvince}
                        >
                          <option value="">Chọn Tỉnh/Thành phố</option>
                          {provinces.map((p) => (
                            <option key={p.code} value={p.code}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <select
                          className={selectStyle}
                          onChange={handleDistrictChange}
                          value={selectedDistrict}
                          disabled={!districts.length}
                        >
                          <option value="">Chọn Quận/Huyện</option>
                          {districts.map((d) => (
                            <option key={d.code} value={d.code}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                        <select
                          className={selectStyle}
                          onChange={handleWardChange}
                          value={selectedWard}
                          disabled={!wards.length}
                        >
                          <option value="">Chọn Phường/Xã</option>
                          {wards.map((w) => (
                            <option key={w.code} value={w.code}>
                              {w.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <input
                        type="text"
                        placeholder="Nhập địa chỉ cụ thể"
                        className={inputStyle}
                      />
                      <textarea
                        placeholder="Ghi chú (không bắt buộc)"
                        className={`${inputStyle} mt-3`}
                      />
                    </div>
                  </section>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow p-6 mt-4">
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-700 mb-2">
                      Thông tin người nhận
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Họ và tên"
                        className={inputStyle}
                      />
                      <input
                        type="text"
                        placeholder="Số điện thoại"
                        className={inputStyle}
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email (không bắt buộc)"
                      className={`${inputStyle} mt-3`}
                    />
                  </div>

                  <h3 className="font-medium text-gray-700 mb-2">
                    Nhận tại nhà thuốc
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Vui lòng chọn chi nhánh nhà thuốc bạn muốn đến nhận hàng.
                  </p>
                  <select className={`${selectStyle} w-full`}>
                    <option>Chọn chi nhánh nhà thuốc</option>
                    <option>Nhà thuốc Benzen Quận 1</option>
                    <option>Nhà thuốc Benzen Quận 3</option>
                    <option>Nhà thuốc Benzen Bình Thạnh</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between bg-white rounded-xl px-6 py-3 mt-2 shadow-sm">
                <h2 className="font-semibold text-gray-700">
                  Yêu cầu xuất hóa đơn điện tử
                </h2>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer duration-300 ${showForm ? "bg-blue-500" : "bg-gray-300"
                    }`}
                >
                  <div
                    className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${showForm ? "translate-x-6" : ""
                      }`}
                  ></div>
                </button>
              </div>

              {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md relative animate-fadeIn">
                    <button
                      onClick={() => setShowForm(false)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="text-center border-b px-6 pt-6 pb-4 bg-gray-50 rounded-t-2xl">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Yêu cầu xuất hoá đơn điện tử
                      </h2>
                    </div>

                    <div className="p-6">
                      <h3 className="text-text-secondary font-medium  ">
                        Xuất hoá đơn cho
                      </h3>
                      <div className="flex gap-3 mb-4">
                        <button
                          className={`flex-1 flex flex-col items-center justify-center border rounded-xl py-3 transition ${invoiceType === "company"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200"
                            }`}
                          onClick={() => setInvoiceType("company")}
                        >
                          <img
                            src="https://cdn-icons-png.flaticon.com/512/2620/2620206.png"
                            alt="Company"
                            className="w-8 h-8 mb-1"
                          />
                          <span className="text-sm font-medium">Công ty</span>
                        </button>

                        <button
                          className={`flex-1 flex flex-col items-center justify-center border rounded-xl py-3 transition ${invoiceType === "personal"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200"
                            }`}
                          onClick={() => setInvoiceType("personal")}
                        >
                          <img
                            src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                            alt="Personal"
                            className="w-8 h-8 mb-1"
                          />
                          <span className="text-sm font-medium">Cá nhân</span>
                        </button>
                      </div>

                      {invoiceType === "company" && (
                        <>
                          <input
                            type="text"
                            placeholder="Mã số thuế"
                            className="w-full border rounded-xl px-4 py-2 mb-3 focus:outline-blue-500"
                          />
                          <input
                            type="text"
                            placeholder="Tên công ty"
                            className="w-full border rounded-xl px-4 py-2 mb-3 focus:outline-blue-500"
                          />
                        </>
                      )}

                      {invoiceType === "personal" && (
                        <>
                          <input
                            type="text"
                            placeholder="Họ và Tên"
                            className="w-full border rounded-xl px-4 py-2 mb-3 focus:outline-blue-500"
                          />
                          <input
                            type="text"
                            placeholder="Số điện thoại"
                            className="w-full border rounded-xl px-4 py-2 mb-3 focus:outline-blue-500"
                          />
                        </>
                      )}

                      <input
                        type="text"
                        placeholder="Địa chỉ"
                        className="w-full border rounded-xl px-4 py-2 mb-3 focus:outline-blue-500"
                      />
                      <input
                        type="email"
                        placeholder="Email (không bắt buộc)"
                        className="w-full border rounded-xl px-4 py-2 mb-3 focus:outline-blue-500"
                      />

                      <p className="text-sm text-gray-500 mb-4 text-center">
                        Lưu ý: Nhà thuốc Benzen chỉ xuất hoá đơn điện tử.
                      </p>

                      <button
                        className="w-full bg-blue-600 text-white font-semibold py-2 rounded-xl hover:bg-blue-700 transition cursor-pointer"
                        onClick={() => setShowForm(false)}
                      >
                        Xác nhận
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-6 h-fit sticky top-6">
          <h3 className="font-semibold text-gray-700 mb-4">
            Áp dụng ưu đãi để được giảm giá
          </h3>

          <div className="space-y-2 border-b pb-4 text-sm">
            <div className="flex justify-between">
              <span>Tổng tiền</span>
              <span className="text-gray-800">{total.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between text-orange-600">
              <span>Giảm giá trực tiếp</span>
              <span>-0đ</span>
            </div>
            <div className="flex justify-between">
              <span>Giảm giá voucher</span>
              <span>0đ</span>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <span className="text-lg font-semibold">Thành tiền</span>
            <span className="text-2xl font-bold text-blue-700">
              {total.toLocaleString()}đ
            </span>

          </div>

          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 mt-4 rounded-full font-semibold text-lg transition cursor-pointer"
            onClick={() => {
              if (!showCheckout) {
                setShowCheckout(true);
              } else {
                toast.success("Đơn hàng của bạn đã được ghi nhận!");
              }
            }}
            disabled={selectedItems.length === 0} 
          >
            {showCheckout ? "Hoàn tất" : selectedItems.length > 0 ? `Mua hàng (${selectedItems.length})` : "Vui lòng chọn sản phẩm"}
          </button>

          <p className="text-xs text-gray-500 mt-3 text-center">
            Bằng việc tiến hành đặt mua hàng, bạn đồng ý với <br />
            <a href="#" className="text-blue-600 underline cursor-pointer">
              Điều khoản dịch vụ
            </a>{" "}
            và{" "}
            <a href="#" className="text-blue-600 underline cursor-pointer">
              Chính sách xử lý dữ liệu cá nhân
            </a>
          </p>
        </div>
      </div>

      {showVoucherSelector && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 p-4">
          <p className="font-semibold mb-2 text-gray-700">
            Các Voucher khả dụng:
          </p>
          <div className="space-y-2">
            {vouchers.map((v) => (
              <div
                key={v.code}
                className={`p-3 border rounded-lg flex justify-between items-center cursor-pointer transition ${selectedVoucherCode === v.code
                    ? "border-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                  }`}
                onClick={() => setSelectedVoucherCode(v.code)}
              >
                <div>
                  <p className="font-semibold text-gray-800">{v.code}</p>
                  <p className="text-sm text-gray-500">{v.text}</p>
                </div>
                <div className="text-blue-600">
                  {selectedVoucherCode === v.code ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-sm text-center relative">
            <button
              onClick={() => setShowConfirm(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src="https://cdn-icons-png.flaticon.com/512/6861/6861362.png"
              alt="trash"
              className="w-20 h-20 mx-auto mb-4"
            />

            <h3 className="text-lg font-semibold text-gray-800">Thông báo</h3>
            <p className="text-gray-500 mt-1">
              Bạn chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?
            </p>

            <div className="flex justify-between gap-4 mt-10">
              <button
                onClick={() => setShowConfirm(false)}
                className={`${btnStyle} bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-full px-15`}
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  if (deletingProduct) handleRemove(deletingProduct);
                  setShowConfirm(false);
                }}
                className={`${btnStyle} bg-blue-600 text-white hover:bg-blue-700 rounded-full px-15`}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
