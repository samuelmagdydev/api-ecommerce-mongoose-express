const factory = require("./handelrsFactory");
const Review = require("../models/reviewModel");

exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  console.log(req.params);
  if (req.params.productId) filterObject = { product: req.params.productId };
  req.filterObj = filterObject;
  next();
};
//  @des Get All Reviews
//  @route GET /api/v1/reviews
//  @access Public
exports.getReviews = factory.getAll(Review);

//  @des Get specific Review
//  @route GET /api/v1/reviews/:id
//  @access Public
exports.getReview = factory.getOne(Review);


// Nested Route
exports.setProductIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if(!req.body.user) req.body.user = req.user.id; 
  next();
};
//  @des Create Reviews
//  @route GET /api/v1/reviews
//  @access Private (user)
exports.createReview = factory.createOne(Review);

// @ desc Update Specific Review
//  @route GET /api/v1/reviews/:id
//  @access Private (user)

exports.updateReview = factory.updateOne(Review);

// @ desc Delete Specific Review
//  @route Delete /api/v1/reviews/:id
//  @access Private(user-Admin-manager)

exports.deleteReview = factory.deleteOne(Review);
