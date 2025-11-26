const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, requireRole } = require("../middleware/authMiddleware");

// Auth routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.route('/').get(protect, requireRole('admin'), userController.getUsers);

// Forgot / Reset Password
router.post("/forgot", userController.forgot);
router.post("/reset-password", userController.resetPassword);

// Get current logged-in user
router.get("/me", protect, userController.getCurrentUser);

module.exports = router;
