const Cart = require("../models/Cart");

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    return res.json({
      items: cart.items,
      totalQuantity: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    console.error("Lỗi getCart:", error);
    res.status(500).json({ message: "Lỗi server khi lấy giỏ hàng" });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { _id, name, price, image, quantity } = req.body;

    if (!_id) {
      return res.status(400).json({ message: "Thiếu _id" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item._id.toString() === _id
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
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

    return res.status(201).json({
      items: cart.items,
      totalQuantity: cart.items.reduce((sum, i) => sum + i.quantity, 0),
    });
  } catch (error) {
    console.error("Lỗi addToCart:", error);
    res.status(500).json({ message: "Lỗi server khi thêm sản phẩm" });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({ message: "Thiếu _id" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    }

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== _id
    );

    await cart.save();

    return res.json({
      items: cart.items,
      totalQuantity: cart.items.reduce((sum, i) => sum + i.quantity, 0),
    });
  } catch (error) {
    console.error("Lỗi removeFromCart:", error);
    res.status(500).json({ message: "Lỗi server khi xóa sản phẩm" });
  }
};
