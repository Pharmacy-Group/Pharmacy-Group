import { NextResponse } from "next/server";
import Cart from "@/models/Cart";
import { getSessionUser } from "@/lib/session";
import dbConnect from "@/lib/db";

export async function POST(req) {
  try {
    await dbConnect();

    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { message: "Bạn chưa đăng nhập!" },
        { status: 401 }
      );
    }

    const { _id } = await req.json();
    if (!_id) {
      return NextResponse.json(
        { message: "Thiếu _id sản phẩm!" },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      return NextResponse.json(
        { message: "Giỏ hàng không tồn tại!" },
        { status: 404 }
      );
    }

    cart.items = cart.items.filter((i) => i._id.toString() !== _id);
    await cart.save();

    return NextResponse.json({
      items: cart.items,
      total: cart.items.reduce((sum, i) => sum + i.quantity, 0),
    });
  } catch (err) {
    console.error("Lỗi API /cart/remove:", err);
    return NextResponse.json(
      { message: "Lỗi server khi xóa sản phẩm!" },
      { status: 500 }
    );
  }
}
