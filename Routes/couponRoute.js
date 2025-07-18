const express = require("express");
const {
  getCouponValidator,
  createCouponValidator,
  updateCouponValidator,
  deleateCouponeValidator,
} = require("../utils/valditors/couponeValidator");
const {
  getCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  createCoupon,
} = require("../Services/couponService");

const router = express.Router();
const authService = require("../Services/authService");

router.use(authService.protect, authService.allowedTo("admin", "manager"));

router.route("/").get(getCoupons).post(createCouponValidator, createCoupon);

router
  .route("/:id")
  .get(getCouponValidator, getCoupon)
  .put(updateCouponValidator, updateCoupon)
  .delete(deleateCouponeValidator, deleteCoupon);

module.exports = router;
