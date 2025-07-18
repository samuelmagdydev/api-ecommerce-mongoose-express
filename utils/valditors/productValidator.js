const { check, body } = require("express-validator");
const { default: slugify } = require("slugify");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Category = require("../../models/CategoryModel");
const subCategories = require("../../models/subCategoryModel");

exports.createProductValidator = [
  check("title")
    .notEmpty()
    .withMessage("Product Required")
    .isLength({ min: 3 })
    .withMessage("Too Short Product Name")
    .isLength({ max: 32 })
    .withMessage("Too Long Product Name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("description")
    .notEmpty()
    .withMessage("Description Required")
    .isLength({ max: 2000 })
    .withMessage("Too Long Description Name"),

  check("quantity")
    .notEmpty()
    .withMessage("Product Required")
    .isNumeric()
    .withMessage("Product Quantity Must Be Number"),

  check("sold")
    .optional()
    .isNumeric()
    .withMessage("Product Sold Must Be Number"),

  check("price")
    .notEmpty()
    .withMessage("Product Price Is Required")
    .isNumeric()
    .withMessage("Product Price Must Be Number")
    .isLength({ max: 20 })
    .withMessage("Too Long Product Price"),

  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Product Sold Must Be Number")
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.price < value) {
        throw new Error("PriceAfterDiscount Must Be Lower Than Price");
      }
      return true;
    }),

  check("colors")
    .optional()
    .isArray()
    .withMessage("AvailableColors Should Be array of String"),

  check("imageCover").notEmpty().withMessage("Product ImageCover Is Required"),

  check("images")
    .optional()
    .isArray()
    .withMessage("images Should Be array of String"),

  check("category")
    .notEmpty()
    .withMessage("Product Must Be Belong To Category")
    .isMongoId()
    .withMessage("Invalid Id Format")
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`No Category With This ID : ${categoryId}`)
          );
        }
      })
    ),

  check("subCategories")
    .optional()
    .isMongoId()
    .withMessage("Invalid Id Format")
    .custom((subcategoriesIds) =>
      subCategories
        .find({ _id: { $exists: true, $in: subcategoriesIds } })
        .then((result) => {
          if (result.length < 1 || result.length !== subcategoriesIds.length) {
            return Promise.reject(new Error(`InValid Sub Categories IDS`));
          }
        })
    )
    .custom((val, { req }) =>
      subCategories
        .find({ category: req.body.category })
        .then((subcategories) => {
          // console.log(subcategories);
          const subCategoriesIdsInDB = [];
          subcategories.forEach((subcCategory) => {
            subCategoriesIdsInDB.push(subcCategory._id.toString());
          });
          const checker = (target, arr) =>
            target.every((v) => subCategoriesIdsInDB.includes(v));
          if (!checker(val, subCategoriesIdsInDB)) {
            return Promise.reject(
              new Error(` Sub Categories Not Belong To This Categorey`)
            );
          }
        })
    ),

  check("brand").optional().isMongoId().withMessage("Invalid Id Format"),

  check("ratingAverage")
    .optional()
    .isNumeric()
    .withMessage("Rating Average Must Be Number")
    .isLength({ min: 1 })
    .withMessage("Rating Must Be Above Or Equal 1.0")
    .isLength({ max: 5 })
    .withMessage("Rating Must Be Below Or Equal 5.0"),

  check("ratingquantity")
    .optional()
    .isNumeric()
    .withMessage("Rating quantity Must Be Number"),

  validatorMiddleware,
];

exports.getProductValidator = [
  check("id").isMongoId().withMessage("Invalid Product ID Format"),
  validatorMiddleware,
];

exports.updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid Product ID Format"),
  body("title")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.deleateProductValidator = [
  check("id").isMongoId().withMessage("Invalid Product ID Format"),
  validatorMiddleware,
];
