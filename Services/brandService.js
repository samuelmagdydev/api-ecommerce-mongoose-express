// eslint-disable-next-line import/no-extraneous-dependencies
const sharp = require("sharp");
const Brand = require("../models/brandModel");
const { uploadSingleImage } = require("../middlewares/uploadeImageMiddleWare");
// eslint-disable-next-line import/order
const asyncHandler = require("express-async-handler");
// eslint-disable-next-line import/no-extraneous-dependencies, import/order
const { v4: uuidv4 } = require("uuid");
const factory = require("./handelrsFactory");

// upload single Image
exports.uploadBrandImage = uploadSingleImage("image");

//image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/brands/${filename}`);

  //save image into Our DB
  req.body.image = filename;

  next();
});

//  @des Get All Brands
//  @route GET /api/v1/brands
//  @access Public
exports.getBrands = factory.getAll(Brand);

//  @des Get specific Brand
//  @route GET /api/v1/brands/:id
//  @access Public
exports.getBrand = factory.getOne(Brand);

// @ desc Update Specific Brand
//  @route GET /api/v1/brands/:id
//  @access Private

exports.updateBrand = factory.updateOne(Brand);

// @ desc Delete Specific Brand
//  @route Delete /api/v1/brands/:id
//  @access Private

exports.deleteBrand = factory.deleteOne(Brand);

//  @des Create Brands
//  @route GET /api/v1/brands
//  @access Private
exports.createBrand = factory.createOne(Brand);
