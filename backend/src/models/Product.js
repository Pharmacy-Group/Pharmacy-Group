const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  desc: String,
  image: String,
  price: Number,
  unit: String,
  discount: {
    type: Number,
    default: 0,
  },
  // New fields for detailed product information
  usage: { type: String }, // cách dùng
  doctorAdvice: { type: String }, // gợi ý từ bác sĩ
  indicators: { type: [String], default: [] }, // các chỉ số liên quan
  ingredients: { type: [String], default: [] }, // thành phần
  // Comments left by users
  comments: {
    type: [
      {
        name: String,
        phone: String,
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
});

module.exports = mongoose.model("Product", productSchema);
