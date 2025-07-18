// eslint-disable-next-line import/order
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

//  @des Add Address to user adddress list
//  @route POST /api/v1/addresses
//  @access Private/User
exports.addAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    message: "Address added successfully",
    data: user.addresses,
  });
});


//  @des Remove Address from user address list
//  @route DELETE /api/v1/addresses/:addressId
//  @access Private/User
exports.removeAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $pull: { addresses:{_id: req.params.addressId} },
    },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    message: "Address Remove Successfully",
    data: user.addresses,
  });
});

//  @des Get Logged User Addresses
//  @route get /api/v1/addresses
//  @access Private/User


exports.getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).populate("addresses");
    res.status(200).json({
      status: "success",
      results: user.addresses.length,
      data: user.addresses,
    });
});
