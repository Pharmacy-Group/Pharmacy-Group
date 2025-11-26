import { NextResponse } from "next/server";
import Cart from "@/models/Cart";
import { getSessionUser } from "@/lib/session"; 
import dbConnect from "@/lib/dbConnect";

export async function GET(req) {
  await dbConnect?.();
  
  const user = await getSessionUser(req);
  if (!user)
    return NextResponse.json({ message: "Bạn chưa đăng nhập" }, { status: 401 });

  let cart = await Cart.findOne({ user: user._id });

  if (!cart) {
    cart = await Cart.create({
      user: user._id,
      items: [],
    });
  }

  return NextResponse.json({
    items: cart.items,
    total: cart.items.reduce((sum, i) => sum + i.quantity, 0),
  });
}

export async function POST(req) {
  await dbConnect?.();

  const user = await getSessionUser(req);
  if (!user)
    return NextResponse.json({ message: "Bạn chưa đăng nhập" }, { status: 401 });

  const { _id, name, price, image, quantity } = await req.json();

  if (!_id)
    return NextResponse.json({ message: "Thiếu _id" }, { status: 400 });

  let cart = await Cart.findOne({ user: user._id });
  if (!cart) cart = new Cart({ user: user._id, items: [] });

  const item = cart.items.find((i) => i._id.toString() === _id);

  if (item) {
    item.quantity += quantity || 1;
  } else {
    cart.items.push({
      _id,
      name,
      price,
      image,
      quantity: quantity || 1,
    });
  }

  await cart.save();

  return NextResponse.json({
    items: cart.items,
    total: cart.items.reduce((sum, i) => sum + i.quantity, 0),
  });
}
