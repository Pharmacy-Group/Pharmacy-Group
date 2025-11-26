const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin!",
      });

    const exist = await User.findOne({ email });
    if (exist)
      return res.status(400).json({
        success: false,
        message: "Email đã tồn tại!",
      });

    const user = await User.create({ name, email, password });

    req.session.userId = user._id;

    res.json({
      success: true,
      message: "Đăng ký thành công!",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Thiếu email hoặc mật khẩu" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({
        success: false,
        message: "Email không tồn tại!",
      });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({
        success: false,
        message: "Sai mật khẩu!",
      });

    req.session.userId = user._id;

    res.json({
      success: true,
      message: "Đăng nhập thành công!",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};

const logout = async (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: "Đăng xuất thành công!" });
  });
};

const forgot = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({
        success: false,
        message: "Email không tồn tại!",
      });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetToken = otp;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: email,
      subject: "Mã khôi phục mật khẩu",
      text: `Mã OTP của bạn là: ${otp}`,
    });

    res.json({
      success: true,
      message: "Đã gửi mã OTP về email!",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetToken: otp,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({
        success: false,
        message: "OTP không hợp lệ hoặc đã hết hạn!",
      });

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Đặt lại mật khẩu thành công!",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    if (!req.session.userId)
      return res.status(401).json({
        success: false,
        message: "Bạn chưa đăng nhập!",
      });

    const user = await User.findById(req.session.userId).select("-password");

    res.json({ success: true, user });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};

const protect = async (req, res, next) => {
  try {
    if (!req.session.userId)
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập trước!",
      });

    const user = await User.findById(req.session.userId).select("-password");

    if (!user)
      return res.status(401).json({
        success: false,
        message: "Tài khoản không tồn tại!",
      });

    req.user = user;

    next();
  } catch (err) {
    console.error("Protect error:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};

const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.search || "";

    const searchCondition = searchTerm
      ? {
          $or: [
            { name: { $regex: searchTerm, $options: "i" } },
            { email: { $regex: searchTerm, $options: "i" } },
          ],
        }
      : {};

    const totalCount = await User.countDocuments(searchCondition);

    const users = await User.find(searchCondition)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      message: "Lấy danh sách người dùng thành công.",
      items: users,
      totalPages,
      totalCount,
      currentPage: page,
    });
  } catch (err) {
    console.error("Get Users error:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};

module.exports = {
  register,
  login,
  logout,
  forgot,
  resetPassword,
  getCurrentUser,
  getUsers,
  protect,
};
