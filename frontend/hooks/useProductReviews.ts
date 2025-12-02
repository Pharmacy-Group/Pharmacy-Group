import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";

export interface Review {
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  rating: number;
  title: string;
  text: string;
  createdAt?: string | Date;
  _local?: boolean;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

const API_URL = "http://localhost:5000/api/products";

export default function useProductReviews(productId: string | null) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  // Tải danh sách đánh giá
  const fetchReviews = useCallback(async () => {
    if (!productId) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${productId}/reviews`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : data.reviews || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Lỗi tải đánh giá:", err);
      // Tải từ localStorage nếu offline
      const localKey = `reviews_${productId}`;
      const local = JSON.parse(localStorage.getItem(localKey) || "[]");
      setReviews(local);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Gửi đánh giá mới
  const submitReview = useCallback(
    async (review: Review, userLoggedIn: boolean) => {
      if (!productId) {
        toast.error("Không có ID sản phẩm");
        return false;
      }

      if (!userLoggedIn) {
        toast.error("Vui lòng đăng nhập để đánh giá sản phẩm");
        return false;
      }

      if (!review.name || !review.text || review.rating === 0) {
        toast.error("Vui lòng điền đầy đủ thông tin");
        return false;
      }

      setSubmitting(true);
      try {
        const res = await fetch(`${API_URL}/${productId}/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(review),
        });

        if (res.ok) {
          const data = await res.json();
          const newReview = data.review || {
            ...review,
            createdAt: new Date().toISOString(),
          };
          setReviews((prev) => [newReview, ...prev]);
          if (data.stats) setStats(data.stats);
          toast.success("Cảm ơn bạn đã đánh giá!");
          setSubmitting(false);
          return true;
        }

        throw new Error("Gửi đánh giá thất bại");
      } catch (err) {
        // Fallback: lưu cục bộ
        try {
          const localKey = `reviews_${productId}`;
          const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
          const newReview = {
            ...review,
            createdAt: new Date().toISOString(),
            _local: true,
          };
          existing.unshift(newReview);
          localStorage.setItem(localKey, JSON.stringify(existing));
          setReviews((prev) => [newReview, ...prev]);
          toast.success("Đánh giá đã được lưu cục bộ (offline)");
          setSubmitting(false);
          return true;
        } catch (e) {
          toast.error("Không thể gửi đánh giá");
          setSubmitting(false);
          return false;
        }
      }
    },
    [productId]
  );

  return {
    reviews,
    loading,
    submitting,
    stats,
    submitReview,
    refreshReviews: fetchReviews,
  };
}
