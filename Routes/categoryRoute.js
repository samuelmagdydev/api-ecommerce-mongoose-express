const express = require("express");

const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleateCategoryValidator,
} = require("../utils/valditors/categoryValidator");
const {
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  createCategory,
  uploadCategoreyImage,
  resizeImage,
} = require("../Services/CategoryService");

const authService = require("../Services/authService");

const subcategoriesRoute = require("./subCategoryRoute");

const router = express.Router();

// Nested Route
router.use("/:categoryId/subcategories", subcategoriesRoute);

router
  .route("/")
  .get(getCategories)
  .post(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    uploadCategoreyImage,
    resizeImage,
    createCategoryValidator,
    createCategory
  );

router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    uploadCategoreyImage,
    resizeImage,
    updateCategoryValidator,
    updateCategory
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleateCategoryValidator,
    deleteCategory
  );

module.exports = router;
