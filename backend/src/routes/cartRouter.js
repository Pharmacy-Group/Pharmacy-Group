const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product"); // Đã import
const { protect } = require("../middleware/authMiddleware");

// GET CART: Lấy giỏ hàng của người dùng hiện tại
router.get("/", protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    return res.json({
      success: true,
      items: cart.items,
      total: cart.items.reduce((sum, i) => sum + i.quantity, 0),
    });
  } catch (err) {
    console.error("Lỗi GET /cart:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ." });
  }
});

// ADD ITEM: Thêm sản phẩm vào giỏ hàng (Đã sửa logic)
router.post("/", protect, async (req, res) => {
  try {
    // 1. Chỉ lấy productId (từ Frontend) và quantity
    // Frontend gửi { productId: '...', quantity: 1 }
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Thiếu ID sản phẩm." });
    }

    // 2. Tìm thông tin chi tiết của sản phẩm từ Product Model
    // (Sử dụng productId thay cho _id trong req.body để tránh nhầm lẫn)
    const productDetail = await Product.findById(productId);

    if (!productDetail) {
      return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại." });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // 3. Kiểm tra sản phẩm đã có trong giỏ hàng chưa (sử dụng productId)
    const existingItem = cart.items.find(
      (item) => item._id.toString() === productId
    );

    const qtyToAdd = quantity || 1;

    if (existingItem) {
      // Tăng số lượng nếu đã tồn tại
      existingItem.quantity += qtyToAdd;
    } else {
      // Thêm sản phẩm mới (Lấy thông tin từ productDetail đã tìm thấy)
      cart.items.push({
        _id: productDetail._id,
        name: productDetail.name,
        price: productDetail.price,
        image: productDetail.image,
        quantity: qtyToAdd,
      });
    }

    await cart.save();

    return res.json({
      success: true,
      items: cart.items,
      total: cart.items.reduce((sum, i) => sum + i.quantity, 0),
    });
  } catch (err) {
    console.error("Lỗi POST /cart:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ." });
  }
});

// REMOVE ITEM: Xóa sản phẩm khỏi giỏ hàng
router.post("/remove", protect, async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({ success: false, message: "Thiếu ID sản phẩm cần xóa." });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: "Không tìm thấy giỏ hàng." });
    }

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== _id
    );

    await cart.save();

    return res.json({
      success: true,
      items: cart.items,
      total: cart.items.reduce((sum, i) => sum + i.quantity, 0),
    });
  } catch (err) {
    console.error("Lỗi POST /cart/remove:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ." });
  }
});

module.exports = router;