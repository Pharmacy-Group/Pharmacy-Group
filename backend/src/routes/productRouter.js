const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const upload = require("../middleware/upload");

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      desc: req.body.desc,
      price: req.body.price,
      discount: req.body.discount,
      unit: req.body.unit,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    const saved = await product.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      desc: req.body.desc,
      price: req.body.price,
      discount: req.body.discount,
      unit: req.body.unit,
    };

    if (req.file) updates.image = `/uploads/${req.file.filename}`;

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json({ message: "Đã xóa thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
