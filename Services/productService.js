const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const { uploadMixOfImages } = require("../middlewares/uploadeImageMiddleWare");
const factory = require("./handelrsFactory");

exports.uploadProductImages = uploadMixOfImages([
  {
    name: "imageCover",
    maxCount: 1,
  },

  {
    name: "images",
    maxCount: 4,
  },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  //  console.log(req.files);

  // Image Processing For ImageCover
  if (req.files.imageCover) {
    const imageCoverFilename = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/products/${imageCoverFilename}`);

    //save image into Our DB
    req.body.imageCover = imageCoverFilename;
  }

  // Image Processing For Images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/products/${imageName}`);

        //save image into Our DB
        req.body.images.push(imageName);
      })
    );
    next();
  }
});

//  @des Get All products
//  @route GET /api/v1/products
//  @access Public
exports.getProducts = factory.getAll(Product, "Products");

//  @des Get specific products
//  @route GET /api/v1/products/:id
//  @access Public
exports.getProduct = factory.getOne(Product,"reviews");

//  @des Create products
//  @route GET /api/v1/products
//  @access Private
exports.createProduct = factory.createOne(Product);

// @ desc Update Specific products
//  @route GET /api/v1/products/:id
//  @access Private

exports.updateProduct = factory.updateOne(Product);

// @ desc Delete Specific products
//  @route Delete /api/v1/products/:id
//  @access Private

exports.deleteProduct = factory.deleteOne(Product);
