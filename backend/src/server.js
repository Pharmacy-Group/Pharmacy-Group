const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");
const https = require("https");
const MongoStore = require("connect-mongo");

const productRouter = require("./routes/productRouter");
const cartRouter = require("./routes/cartRouter");
const userRouter = require("./routes/userRouter");

dotenv.config();
const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // cho phép gửi cookie
  })
);

// Session
app.use(
  session({
    name: "sessionId",
    secret: process.env.SESSION_SECRET || "PharmacySessionSecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI, ttl: 24 * 60 * 60 }),
    cookie: {
      httpOnly: true,
      secure: false, // production thì true nếu dùng HTTPS
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 ngày
    },
  })
);

// MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routers
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/users", userRouter);

// Static uploads
app.use("/uploads", express.static("uploads"));

// Fetch provinces (ignore SSL)
const agent = new https.Agent({ rejectUnauthorized: false });
app.get("/api/provinces", async (req, res) => {
  try {
    const response = await fetch("https://provinces.open-api.vn/api/?depth=3", { agent });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Lỗi khi lấy dữ liệu tỉnh/thành:", err);
    res.status(500).json({ error: "Không thể tải dữ liệu địa chỉ" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
