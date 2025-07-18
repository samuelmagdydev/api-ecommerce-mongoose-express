const factory = require("./handelrsFactory");
const Coupon = require("../models/couponModel");

//  @des Get All Coupons
//  @route GET /api/v1/coupon
//  @access Private (Amin - Manager)
exports.getCoupons = factory.getAll(Coupon);

//  @des Get specific Coupon
//  @route GET /api/v1/coupon/:id
//  @access Public (Amin - Manager)
exports.getCoupon = factory.getOne(Coupon);

// @ desc Update Specific Coupon
//  @route GET /api/v1/coupon/:id
//  @access Private (Amin - Manager)

exports.updateCoupon = factory.updateOne(Coupon);

// @ desc Delete Specific Coupon
//  @route Delete /api/v1/coupon/:id
//  @access Private (Amin - Manager)

exports.deleteCoupon = factory.deleteOne(Coupon);

//  @des Create Coupons
//  @route POST /api/v1/coupon
//  @access Private (Amin - Manager)
exports.createCoupon = factory.createOne(Coupon);
