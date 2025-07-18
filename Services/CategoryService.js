// eslint-disable-next-line import/no-extraneous-dependencies
const sharp = require("sharp");
// eslint-disable-next-line import/no-extraneous-dependencies
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const { uploadSingleImage } = require("../middlewares/uploadeImageMiddleWare");
const factory = require("./handelrsFactory");
const CategoryModel = require("../models/CategoryModel");

// upload single Image
exports.uploadCategoreyImage = uploadSingleImage("image");

//image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/categories/${filename}`);
  }

  //save image into Our DB
  req.body.image = filename;

  next();
});

//  @des Get All Categories
//  @route GET /api/v1/categories
//  @access Public
exports.getCategories = factory.getAll(CategoryModel);

//  @des Get specific Categories
//  @route GET /api/v1/categories/:id
//  @access Public
exports.getCategory = factory.getOne(CategoryModel);

// @ desc Update Specific Category
//  @route GET /api/v1/categories/:id
//  @access Private

exports.updateCategory = factory.updateOne(CategoryModel);
// @ desc Delete Specific Category
//  @route Delete /api/v1/categories/:id
//  @access Private

exports.deleteCategory = factory.deleteOne(CategoryModel);

//  @des Create Categories
//  @route GET /api/v1/categories
//  @access Private
exports.createCategory = factory.createOne(CategoryModel);
