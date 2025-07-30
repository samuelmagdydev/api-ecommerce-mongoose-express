const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  signupValidator,
  loginValidator,
} = require("../utils/valditors/authValidator");

const {
  signup,
  login,
  forgotPassword,
  verfiyPasswordResetCode,
  resetPassword
} = require("../Services/authService");

const router = express.Router();

// إعداد limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // 5 طلبات فقط
  message: 'Too Many Requests From This IP. Please Try Again After 15 Minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply limiter to sensitive routes
router.post("/signup", signupValidator, signup);
router.post("/login", limiter, loginValidator, login); // limiter هنا
router.post("/forgotPassword", limiter, forgotPassword); // limiter هنا
router.post("/verfiyResetCode", verfiyPasswordResetCode);
router.post("/resetPassword", resetPassword);

module.exports = router;
