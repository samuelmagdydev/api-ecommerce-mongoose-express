// eslint-disable-next-line import/no-extraneous-dependencies
const sharp = require("sharp");
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require("bcryptjs");

const User = require("../models/userModel");
const { uploadSingleImage } = require("../middlewares/uploadeImageMiddleWare");
const createToken = require("../utils/createToken");
const ApiError = require("../utils/apiError");
// eslint-disable-next-line import/order
const asyncHandler = require("express-async-handler");
// eslint-disable-next-line import/no-extraneous-dependencies, import/order
const { v4: uuidv4 } = require("uuid");
const factory = require("./handelrsFactory");

// upload single Image
exports.uploadUserImage = uploadSingleImage("profileImg");

//image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/users/${filename}`);

    //save image into Our DB
    req.body.profileImg = filename;
  }

  next();
});

//  @des Get All users
//  @route GET /api/v1/users
//  @access Private
exports.getUsers = factory.getAll(User);

//  @des Get specific user
//  @route GET /api/v1/users/:id
//  @access Private
exports.getUser = factory.getOne(User);

// @ desc Update Specific User
//  @route GET /api/v1/users/:id
//  @access Private

exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      email: req.body.email,
      profileImg: req.body.profileImg,
      role: req.body.role,
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No brand With This ID ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No brand With This ID ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

// @ desc Delete Specific User
//  @route Delete /api/v1/users/:id
//  @access Private

exports.deleteUser = factory.deleteOne(User);

//  @des Create User
//  @route GET /api/v1/users
//  @access Private
exports.createUser = factory.createOne(User);

//  @des Get Logged user data
//  @route GET /api/v1/users/getMe
//  @access Private

exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

//  @des Update Logged user Password
//  @route PUT /api/v1/users/updateMyPassword
//  @access Private

exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  //1- Update User Password Based On User PayLoad(req.user._id)
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  //2- generate Token
  const token = createToken(user._id);
  res.status(200).json({ data: user, token });
});

//  @des Update Logged user Data (withOut Passwor,role)
//  @route PUT /api/v1/users/updateMe
//  @access Private

exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true }
  );
  res.status(200).json({ data: updatedUser });
});

//  @des deactive Logged user Data (withOut Passwor,role)
//  @route Delete /api/v1/users/deleteMe
//  @access Private

exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({ status: "Success" });
});
