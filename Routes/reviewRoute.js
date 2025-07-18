const express = require("express");
const {
  createReviewValidator,
  getReviewValidator,
  updateReviewValidator,
  deleateBarndValidator,
} = require("../utils/valditors/reviewValidator");
const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  createFilterObj,
  setProductIdAndUserIdToBody,
} = require("../Services/reviewService");

const router = express.Router({ mergeParams: true }); // Allows access to productId from parent route
const authService = require("../Services/authService");

router
  .route("/")
  .get(createFilterObj, getReviews)
  .post(
    authService.protect,
    authService.allowedTo("user"),
    setProductIdAndUserIdToBody,
    createReviewValidator,
    createReview
  );

router
  .route("/:id")
  .get(getReviewValidator, getReview)
  .put(
    authService.protect,
    authService.allowedTo("user"),
    updateReviewValidator,
    updateReview
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin", "manager", "user"),
    deleateBarndValidator,
    deleteReview
  );

module.exports = router;
