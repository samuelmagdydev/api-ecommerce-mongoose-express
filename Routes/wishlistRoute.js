const express = require("express");
const authService = require("../Services/authService");

const {
  addToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
} = require("../Services/wishlistService");

const router = express.Router();

router.use(authService.protect, authService.allowedTo("user"));

router.route("/").post(addToWishlist).get(getLoggedUserWishlist);

router.delete("/:productId", removeProductFromWishlist);

module.exports = router;
