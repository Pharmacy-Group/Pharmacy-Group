const User = require("../models/User");

// Kiểm tra đã đăng nhập
const protect = async (req, res, next) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ success: false, message: "Bạn cần đăng nhập!" });
    }

    const user = await User.findById(req.session.userId).select("-password");

    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ success: false, message: "User không tồn tại, vui lòng đăng nhập lại!" });
    }

    req.user = user;
    next();

  } catch (err) {
    console.error("Lỗi protect:", err);
    return res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};


// Kiểm tra quyền
const requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Bạn cần đăng nhập!" });
  if (req.user.role !== role) return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập!" });
  next();
};

const requireLoginForAction = (req, res, next) => {
  if (!req.session?.userId) return res.status(401).json({ success: false, message: "Bạn cần đăng nhập để thực hiện thao tác!" });
  next();
};

module.exports = {
  protect,
  requireRole,
  requireLoginForAction,
};
