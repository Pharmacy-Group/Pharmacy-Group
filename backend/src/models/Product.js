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
});

module.exports = mongoose.model("Product", productSchema);
