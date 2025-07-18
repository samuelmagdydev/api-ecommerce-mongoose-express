const express = require("express");
const {
  getBrandValidator,
  createBrandValidator,
  deleateBarndValidator,
  updateBrandValidator,
} = require("../utils/valditors/brandValidator");
const {
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
  createBrand,
  uploadBrandImage,
  resizeImage,
} = require("../Services/brandService");

const router = express.Router();
const authService = require("../Services/authService");

router
  .route("/")
  .get(getBrands)
  .post(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    uploadBrandImage,
    resizeImage,
    createBrandValidator,
    createBrand
  );

router
  .route("/:id")
  .get(getBrandValidator, getBrand)
  .put(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    uploadBrandImage,
    resizeImage,
    updateBrandValidator,
    updateBrand
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleateBarndValidator,
    deleteBrand
  );

module.exports = router;
