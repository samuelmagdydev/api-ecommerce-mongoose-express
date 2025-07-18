const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Order Must Belong to a User"],
    },
    cartItems: [
      {
        productId: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        color: String,
        price: Number,
      },
    ],
    taxPrice:{
        type: Number,
        default: 0,
    },
    shippingAddress: {
      details : String,
      phone: String,
        city: String,
        postalCode: String,

    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    totalOrderPrice: {
        type: Number,
    },
    paymentMethod: {
        type: String,
        enum: ["Cash on Delivery", "card"],
        default: "Cash on Delivery",
    },
    isPaid : {
        type: Boolean,
        default: false,
    },
    paidAt: Date,
    isDelivered: {
        type: Boolean,
        default: false,
    },
    deliveredAt: Date,
},
  { timestamps: true }
);

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path:"user",
    select: "name email phone",
  }).populate({
    path: "cartItems.productId",
    select: "title imageCover",
  });
  next();
})
module.exports = mongoose.model("Order", orderSchema);
