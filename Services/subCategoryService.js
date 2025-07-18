const subCategoryModel = require("../models/subCategoryModel");
const factory = require("./handelrsFactory");

exports.setCategoryIdToBody = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

//  @access Private
exports.createSubCategory = factory.createOne(subCategoryModel);
// nested route
//Get  GET /api/v1/subcategories/:categoryid/subcategories

//  @des Get All SubCategories
//  @route GET /api/v1/subcategories
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  console.log(req.params);
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObj = filterObject;
  next();
};

exports.getSubCategories = factory.getAll(subCategoryModel);

//  @des Get specific SubCategories by id
//  @route GET /api/v1/subcategories/:id
//  @access Public
exports.getSubCategory = factory.getOne(subCategoryModel);

//  @des Get update SubCategories by id
//  @route GET /api/v1/subcategories/:id
//  @access Private
exports.updateSubCategory = factory.updateOne(subCategoryModel);

// @ desc Delete Specific Category
//  @route Delete /api/v1/categories/:id
//  @access Private

exports.deleteSubCategory = factory.deleteOne(subCategoryModel);
