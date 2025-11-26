'use client';

import Cart from '@/app/carts/page';

export default function CartPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4 text-green-600">Giỏ hàng</h1>
      <Cart />
    </div>
  );
}
