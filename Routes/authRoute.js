const express = require("express");
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

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/forgotPassword", forgotPassword);
router.post("/verfiyResetCode", verfiyPasswordResetCode);
router.post("/resetPassword", resetPassword);


module.exports = router;
