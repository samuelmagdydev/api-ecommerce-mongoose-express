const asyncHandler = require("express-async-handler");
// eslint-disable-next-line import/no-unresolved, node/no-missing-require
const ApiError = require("../utils/ApiError");
// eslint-disable-next-line import/no-unresolved, node/no-missing-require
const Product = require("../models/ProductModel");
// eslint-disable-next-line import/no-unresolved, node/no-missing-require
const Coupon = require("../models/CouponModel");
const Cart = require("../models/CartModel");

const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });

  cart.totalCartPrice = totalPrice;

  cart.totalPriceAfterDiscount = undefined; // Initially set to totalCartPrice, will be updated if a coupon is applied

  return totalPrice;
};

//  @desc Product To Cart
//  @route POST /api/v1/cart
//  @access Private/User

exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;

  const product = await Product.findById(productId);
  //1- Get Cart For Logged User

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // create cart  For Logged user with product
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [{ productId, color, price: product.price }],
    });
  } else {
    // check if product already exists in cart,update quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.productId.toString() === productId && item.color === color
    );

    if (productIndex > -1) {
      // update quantity
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      cart.cartItems[productIndex] = cartItem;
    } else {
      // product Not Exist in Cart , push product to cartItems array
      cart.cartItems.push({
        productId,
        color,
        price: product.price,
      });
    }
  }

  // Calculate total cart price
  calcTotalCartPrice(cart);

  await cart.save();

  res.status(201).json({
    success: true,
    message: "Product added to cart successfully",
    numberOfItems: cart.cartItems.length,
    cart,
  });
});

//  @desc Get Logged User Cart
//  @route GET /api/v1/cart
//  @access Private/User

exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(
      new ApiError(`There is no cart for this user id : ${req.user._id} `, 404)
    );
  }
  res.status(200).json({
    status: "success",
    numberOfItems: cart.cartItems.length,
    cart,
  });
});

//  @desc Remove specific cart item
//  @route DELETE /api/v1/cart/:itemId
//  @access Private/User

exports.removeSpecificCartItem = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true }
  );
  calcTotalCartPrice(cart);
  cart.save();

  res.status(200).json({
    status: "success",
    numberOfItems: cart.cartItems.length,

    cart,
  });
});

//  @desc clear logged User Cart
//  @route DELETE /api/v1/cart/
//  @access Private/User

exports.clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(204).json({
    status: "success",
    message: "Cart cleared successfully",
  });
});

//  @desc Update specific cart quantity
//  @route PUT /api/v1/cart/:itemId
//  @access Private/User

exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(
      new ApiError(`There is no cart for this user id : ${req.user._id} `, 404)
    );
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );
  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(
      new ApiError(
        `There is no item with id : ${req.params.itemId} in cart`,
        404
      )
    );
  }

  calcTotalCartPrice(cart);
  await cart.save();
  res.status(200).json({
    status: "success",
    message: "Cart item quantity updated successfully",
    numberOfItems: cart.cartItems.length,
    cart,
  });
});

//  @desc aPPLY coupon ON cart
//  @route POST /api/v1/cart/applycoupon
//  @access Private/User

exports.applyCoupon = asyncHandler(async (req, res, next) => {
  //1- get coupon based on coupon name
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });
  if (!coupon) {
    return next(new ApiError("This coupon is not valid or expired", 400));
  }

  //2- get cart for logged user to get total price
  const cart = await Cart.findOne({ user: req.user._id });

  //3- calculate total price after discount

  const totalPrice = cart.totalCartPrice;

  //4- update cart with total price after discount
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2);
  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Coupon applied successfully",
    totalPriceAfterDiscount,
    cart,
  });
});
