// eslint-disable-next-line import/order
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

//  @des Add Product to wishlist
//  @route POST /api/v1/wishlist
//  @access Private/User
exports.addToWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    message: "Product added to wishlist successfully",
    data: user.wishlist,
  });
});


//  @des Remove Product from wishlist
//  @route DELETE /api/v1/wishlist/:productId
//  @access Private/User
exports.removeProductFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $pull: { wishlist: req.params.productId },
    },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    message: "Product From wishlist successfully",
    data: user.wishlist,
  });
});

//  @des Get Logged User wishlist
//  @route get /api/v1/wishlist
//  @access Private/User


exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.status(200).json({
      status: "success",
      results: user.wishlist.length,
      data: user.wishlist,
    });
});
