const express = require("express");

const {
  createCashOrder,
  getAllOrders,
  getSpecificOrder,
  filterOrdersForLoggerUser,
  updateOrderPaidStatus,
  updateOrderDeliverdStatus,
  getCheckOutSession,
} = require("../Services/orderService");

const authService = require("../Services/authService");

const router = express.Router();

router.use(authService.protect);

router.get(
  "/checkout-session/:cartId",
  authService.allowedTo("user"),
  getCheckOutSession
);

router.route("/:cartId").post(authService.allowedTo("user"), createCashOrder);
router.get(
  "/",
  authService.allowedTo("admin", "user", "manager"),
  filterOrdersForLoggerUser,
  getAllOrders
);
router.get("/:id", getSpecificOrder);
router.put(
  "/:id/pay",
  authService.allowedTo("admin", "manager"),
  
  updateOrderPaidStatus
);
router.put(
  "/:id/deliver",
  authService.allowedTo("admin", "manager"),
  updateOrderDeliverdStatus
);
module.exports = router;
