// eslint-disable-next-line import/no-extraneous-dependencies
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// eslint-disable-next-line import/order
const asyncHandler = require("express-async-handler");
const factory = require("./handelrsFactory");
const ApiError = require("../utils/apiError");
// eslint-disable-next-line import/no-unresolved, node/no-missing-require
const Cart = require("../models/CartModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");

//  @des create cash order
//  @route POST /api/v1/orders
//  @access Public
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPrice = 0;
  const shippingPrice = 0;
  //1- Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`No cart found with this ID ${req.params.cartId}`, 404)
    );
  }
  //2- Get order price depend on cart price "check if coupon applied"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  //3- Create order with default payment method "Cash on Delivery"
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });
  //4- After creating order , decrease product quantity , increase product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.productId },
        update: {
          $inc: {
            quantity: -item.quantity,
            sold: +item.quantity,
          },
        },
      },
    }));
    await Product.bulkWrite(bulkOption, {});
    //5- clear cart depend on cartId
    await Cart.findByIdAndDelete(req.params.cartId);
  }
  res.status(201).json({
    status: "success",
    data: {
      order,
    },
  });
});

exports.filterOrdersForLoggerUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") req.filterObj = { user: req.user._id };
  next();
});
//  @des Get  All orders
//  @route POST /api/v1/orders
//  @access protected/admin-user-manager

exports.getAllOrders = factory.getAll(Order);

//  @des Get  Spescfic orders
//  @route POST /api/v1/orders
//  @access protected/admin-user-manager

exports.getSpecificOrder = factory.getOne(Order);

//  @des Update  Order Paid Status To Paid
//  @route PUT /api/v1/orders/:id/pay
//  @access protected/admin-manager

exports.updateOrderPaidStatus = asyncHandler(async (req, res, next) => {
  const order = await Order.findByIdAndUpdate(req.params.id);
  if (!order) {
    return next(
      new ApiError(`No order found with this ID ${req.params.id}`, 404)
    );
  }
  //update order to paid
  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();
  res.status(200).json({
    status: "success",
    data: {
      order: updatedOrder,
    },
  });
});

//  @des Update  Order Deliverd Status To Paid
//  @route PUT /api/v1/orders/:id/pay
//  @access protected/admin-manager

exports.updateOrderDeliverdStatus = asyncHandler(async (req, res, next) => {
  const order = await Order.findByIdAndUpdate(req.params.id);
  if (!order) {
    return next(
      new ApiError(`No order found with this ID ${req.params.id}`, 404)
    );
  }
  //update order to paid
  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();
  res.status(200).json({
    status: "success",
    data: {
      order: updatedOrder,
    },
  });
});

//  @des Get CheckOut Session from Stripe and send it to response
//  @route GET /api/v1/orders/checkout-session/:cartId
//  @access protected/user

exports.getCheckOutSession = asyncHandler(async (req, res, next) => {
  const taxPrice = 0;
  const shippingPrice = 0;
  //1- Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`No cart found with this ID ${req.params.cartId}`, 404)
    );
  }
  //2- Get order price depend on cart price "check if coupon applied"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  //3- Create checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "egp",
          unit_amount: totalOrderPrice * 100,
          product_data: { name: req.user.name },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  res.status(200).json({
    status: "success",
    data: {
      session,
    },
  });
});

const createCardOrder = async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const orderPrice = session.display_items[0].amount / 100;

  const cart = await Cart.findById(cartId);
  const user = await User.findOne({ email: session.customer_email });

  // create order with Payment Type Card
  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: orderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethod: "card",
  });

  //4- After creating order , decrease product quantity , increase product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.productId },
        update: {
          $inc: {
            quantity: -item.quantity,
            sold: +item.quantity,
          },
        },
      },
    }));
    await Product.bulkWrite(bulkOption, {});
    //5- clear cart depend on cartId
    await Cart.findByIdAndDelete(cartId);
  }
};

exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`WebHook Error : ${error.message} `);
  }
  if (event.type === "checkout.session.completed") {
    // create Order
    createCardOrder(event.data.object);
  }

  res.status(200).json({ received: true });
});
