"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import useProducts from "@/hooks/useProducts";
import useAuth from "@/hooks/useAuth";

interface Product {
  _id: string;
  id: number;
  name: string;
  desc: string;
  price: number;
  image: string | string[];
  unit: string;
  discount: number;
  quantity?: number;
  usage?: string;
  doctorAdvice?: string;
  indicators?: string[];
  ingredients?: string[];
}

interface CommentItem {
  name: string;
  phone?: string;
  text: string;
  createdAt?: string | Date;
}

// Component cho sản phẩm liên quan
function RelatedProductCard({ product, API_ORIGIN }: { product: any; API_ORIGIN: string }) {
  const [relQty, setRelQty] = useState(1);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex flex-col">
        <div className="flex justify-center mb-3">
          <Link href={`/product/${product._id}`}>
            <img src={product.image} alt={product.name} className="w-32 h-32 object-contain rounded hover:opacity-80 cursor-pointer" />
          </Link>
        </div>
        
        <Link href={`/product/${product._id}`} className="text-sm font-bold text-gray-800 hover:text-green-600 line-clamp-2 mb-2">{product.name}</Link>
        
        <p className="text-green-600 text-lg font-bold mb-3">{product.price?.toLocaleString()}đ</p>
        <p className="text-xs text-gray-500 mb-3">/ {product.unit}</p>

        <button
          onClick={async () => {
            try {
              const res = await fetch(`${API_ORIGIN}/api/carts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  productId: product._id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  quantity: 1,
                }),
              });
              if (res.ok) {
                alert(`Đã thêm vào giỏ hàng!`);
              }
            } catch (err) {
              alert("Không thể thêm vào giỏ hàng lúc này.");
            }
          }}
          className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
        >
          CHỌN MUA
        </button>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const API_ORIGIN = "http://localhost:5000";

  // Call hooks unconditionally at top-level to preserve hooks order
  const { products: relatedProducts } = useProducts();
  const { user } = useAuth();

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentName, setCommentName] = useState("");
  const [commentPhone, setCommentPhone] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (!id) {
      console.warn("useParams returned no id");
      setError("Không có id sản phẩm (kiểm tra đường dẫn).");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      setDebugInfo(null);

      const origin = "http://localhost:5000";
      // thử nhiều biến thể đường dẫn phổ biến để phù hợp route backend
      const urls = [
        `${origin}/api/products/id/${id}`,
        `${origin}/api/products/${id}`,
        `${origin}/api/product/${id}`,
        `${origin}/api/product/id/${id}`,
      ];

      let lastErr: any = null;
      for (const url of urls) {
        try {
          console.log("Trying product URL:", url);
          const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
          console.log("Response:", url, res.status, "ok=", res.ok);

          if (!res.ok) {
            // đọc body để debug (thường HTML 404 sẽ trả về văn bản)
            let body = "<no body>";
            try { body = await res.text(); } catch (e) { /* ignore */ }
            console.warn("Non-ok response for", url, res.status, body);
            lastErr = { url, status: res.status, body: body.slice(0, 200) }; // rút gọn
            continue;
          }

          const contentType = res.headers.get("content-type") || "";
          if (!contentType.includes("application/json")) {
            const text = await res.text();
            console.warn("Response not JSON for", url, text.slice(0, 200));
            lastErr = { url, status: res.status, body: text.slice(0, 200) };
            continue;
          }

          const data = await res.json();
          console.log("Product data received:", data);
          setProduct(data);
          // initialize comments if backend returns them
          setComments(data.comments || []);
          setError(null);
          setLoading(false);
          return;
        } catch (err) {
          console.error("Fetch error for", url, err);
          lastErr = err;
          continue;
        }
      }

      // Ghi log an toàn (tránh crash khi lastErr không thể stringify)
      try {
        console.error("All fetch attempts failed:", lastErr);
      } catch (e) {
        try {
          console.error("All fetch attempts failed (stringified):", JSON.stringify(lastErr));
        } catch (_e) {
          console.error("All fetch attempts failed (could not stringify lastErr)");
        }
      }

      setProduct(null);
      setError("Không thể tải sản phẩm. Kiểm tra backend/URL/CORS.");

      // Tạo debugInfo an toàn
      let safeDebug: string;
      try {
        if (typeof lastErr === "string") safeDebug = lastErr;
        else safeDebug = JSON.stringify(lastErr);
      } catch (e) {
        safeDebug = String(lastErr);
      }
      setDebugInfo(safeDebug);
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  // Prefill name/phone when user info exists
  useEffect(() => {
    try {
      if (user && user.name) setCommentName(user.name);
      const savedPhone = localStorage.getItem("userPhone") || localStorage.getItem("phone");
      if (savedPhone) setCommentPhone(savedPhone);
    } catch (e) {
      // ignore
    }
  }, [user]);

  const submitComment = async () => {
    if (!product) return;
    if (!commentText || !commentText.trim()) {
      alert("Vui lòng nhập nội dung bình luận.");
      return;
    }

    const payload = { name: commentName || (user?.name ?? 'Khách'), phone: commentPhone || '', text: commentText };
    setSubmittingComment(true);
    try {
      const res = await fetch(`${API_ORIGIN}/api/products/${product._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const newComment = data.comment || { ...payload, createdAt: new Date().toISOString() };
        setComments(prev => [newComment, ...prev]);
        setCommentText('');
        try { localStorage.setItem('userPhone', commentPhone || ''); } catch (e) {}
        setSubmittingComment(false);
        return;
      }

      // fallback: save locally
      throw new Error('Server returned non-ok');
    } catch (err) {
      const localKey = `comments_${product._id}`;
      try {
        const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
        const newComment = { ...payload, createdAt: new Date().toISOString(), _local: true };
        existing.unshift(newComment);
        localStorage.setItem(localKey, JSON.stringify(existing));
        setComments(prev => [newComment, ...prev]);
        setCommentText('');
        setSubmittingComment(false);
        alert('Bình luận đã được lưu cục bộ (offline).');
      } catch (e) {
        setSubmittingComment(false);
        alert('Không thể gửi bình luận lúc này.');
      }
    }
  };

  const addToCart = async () => {
    if (!product) return;

    // Try to add to server-side cart first so Cart page (which fetches /api/carts)
    // will reflect the change. If backend fails, fallback to localStorage.
    try {
      const res = await fetch(`${API_ORIGIN}/api/carts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        }),
      });

      if (!res.ok) throw new Error(`Add to cart failed: ${res.status}`);

      // Success — navigate to cart where the page will fetch the updated cart
      router.push("/cart");
      return;
    } catch (err) {
      console.warn("Adding to server cart failed, falling back to localStorage:", err);
      // fallback to localStorage behavior (best-effort offline)
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const existing = cart.find(
          (item: any) => item.id === product.id || item._id === product._id
        );

        if (existing) existing.quantity += quantity;
        else
          cart.push({
            id: product.id || product._id,
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            unit: product.unit,
            quantity,
          });

        localStorage.setItem("cart", JSON.stringify(cart));
        // Best-effort navigation
        router.push("/cart");
        return;
      } catch (e) {
        alert("Không thể thêm vào giỏ hàng lúc này.");
      }
    }
  };

  if (loading) return <div className="text-center py-10">Đang tải sản phẩm...</div>;
  if (error) return (
    <div className="text-center py-10 text-red-600">
      <div>{error}</div>
      {debugInfo && <pre className="mt-2 text-left whitespace-pre-wrap">{debugInfo}</pre>}
      <div className="mt-2 text-sm text-gray-500">Mở DevTools → Network để xem chi tiết request.</div>
    </div>
  );
  if (!product) return <div className="text-center py-10">Không tìm thấy sản phẩm.</div>;

  // prepare images (support single string or array)
  const images: string[] = Array.isArray(product.image)
    ? product.image
    : product.image
    ? [product.image]
    : [];

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <nav className="text-sm text-gray-600 mb-4">
        <Link href="/">Trang chủ</Link> / <Link href="/product">Thuốc</Link> / <span className="font-semibold">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex flex-col items-center">
              <img src={images[0]} alt={product.name} className="w-[360px] h-[360px] object-contain rounded" />

              <div className="flex gap-3 mt-4">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      // swap first image with clicked thumbnail
                      if (i === 0) return;
                      const newImages = [...images];
                      const tmp = newImages[0];
                      newImages[0] = newImages[i];
                      newImages[i] = tmp;
                      // quick local swap: mutate product.image for preview only
                      // (no state maintained across renders here — acceptable preview)
                      (product as any).image = newImages;
                    }}
                    className="w-20 h-20 p-1 bg-gray-50 rounded border"
                  >
                    <img src={src} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">{product.name}</h2>
            <div className="prose max-w-none text-gray-700">
              {product.desc}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg p-6 shadow-md sticky top-24">
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <p className="text-3xl text-green-600 font-bold">
                {product.price?.toLocaleString?.() ?? product.price}₫
              </p>
              <span className="text-sm text-gray-500">/ {product.unit}</span>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">{product.discount ? `Giảm ${product.discount}%` : ""}</p>
            </div>

            <div className="flex items-center gap-0 border border-gray-300 rounded-full w-fit px-2 py-1">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full font-bold">−</button>
              <input value={quantity} readOnly className="px-4 py-1 text-center font-semibold w-12 border-0" />
              <button onClick={() => setQuantity(quantity + 1)} className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full font-bold">+</button>
            </div>

            <div className="flex gap-4">
              <button onClick={addToCart} className="flex-1 bg-transparent border border-green-600 text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50">CHỌN MUA</button>
              <button onClick={addToCart} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2">
                <ShoppingCart size={18} /> THÊM VÀO GIỎ HÀNG
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <p>Kho: {product.quantity ?? "Còn hàng"}</p>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-lg p-6 shadow-md">
            <h3 className="font-semibold mb-3">Thông tin sản phẩm</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>- Đơn vị: {product.unit}</li>
              <li>- Mô tả ngắn: {product.desc?.slice(0, 200)}{product.desc && product.desc.length > 200 ? '...' : ''}</li>
              <li>- Giá: {product.price?.toLocaleString()}đ</li>
            </ul>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h3 className="text-xl font-semibold mb-4">SẢN PHẨM KHÁC</h3>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {relatedProducts && relatedProducts
            .filter(p=>p._id !== product._id)
            .sort(() => Math.random() - 0.5)
            .slice(0,8)
            .map((p:any)=> (
            <div key={p._id} className="flex-shrink-0 w-56">
              <RelatedProductCard product={p} API_ORIGIN={API_ORIGIN} />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">CÁCH DÙNG</h3>
        <p className="text-gray-700 leading-relaxed">{product.usage || "Chưa có thông tin. Vui lòng tham khảo y tế."}</p>
      </section>

      <section className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">GỢI Ý TỪ BÁC SĨ</h3>
        <p className="text-gray-700 leading-relaxed">{product.doctorAdvice || "Tham khảo ý kiến bác sĩ nếu cần."}</p>
      </section>

      <section className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">CHỈ SỐ</h3>
        {product.indicators && product.indicators.length > 0 ? (
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            {product.indicators.map((indicator, i) => (
              <li key={i}>{indicator}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Không có thông tin chỉ số.</p>
        )}
      </section>

      <section className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">THÀNH PHẦN</h3>
        {product.ingredients && product.ingredients.length > 0 ? (
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            {product.ingredients.map((ingredient, i) => (
              <li key={i}>{ingredient}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Không có thông tin thành phần.</p>
        )}
      </section>

      <section className="mt-12 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">BÌNH LUẬN</h3>

        <div className="mb-4 space-y-3">
          {user ? (
            <div className="text-sm text-gray-600">Bạn đang đăng nhập dưới tên <strong>{user.name}</strong>. Vui lòng bổ sung số điện thoại nếu muốn.</div>
          ) : (
            <div className="text-sm text-gray-600">Bạn có thể bình luận mà không cần đăng nhập, hoặc <Link href="/login" className="text-green-600 font-semibold">đăng nhập</Link> để lưu thông tin.</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={commentName} onChange={(e)=> setCommentName(e.target.value)} placeholder="Họ và tên" className="border rounded p-2" />
            <input value={commentPhone} onChange={(e)=> setCommentPhone(e.target.value)} placeholder="Số điện thoại" className="border rounded p-2" />
          </div>

          <textarea value={commentText} onChange={(e)=> setCommentText(e.target.value)} placeholder="Nhập bình luận..." className="w-full border rounded p-3 h-28" />

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">{comments.length} bình luận</div>
            <div>
              <button disabled={submittingComment} onClick={submitComment} className="bg-green-600 disabled:opacity-50 text-white px-4 py-2 rounded">{submittingComment ? 'Đang gửi...' : 'Gửi bình luận'}</button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {comments && comments.length > 0 ? (
            comments.map((c:any, i:number) => (
              <div key={i} className="border-l-4 border-green-100 pl-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{c.name}{c.phone ? ` · ${c.phone}` : ''}</div>
                  <div className="text-xs text-gray-400">{new Date(c.createdAt || Date.now()).toLocaleString()}</div>
                </div>
                <div className="text-sm text-gray-700 mt-1">{c.text}</div>
              </div>
            ))
          ) : (
            <div className="text-gray-500">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</div>
          )}
        </div>
      </section>
    </div>
  );
}