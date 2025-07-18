const express = require("express");

const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleateProductValidator,
} = require("../utils/valditors/productValidator");
const {
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  createProduct,
  uploadProductImages,
  resizeProductImages,
} = require("../Services/productService");
const authService = require("../Services/authService");
const reviwRoute=require("./reviewRoute");

const router = express.Router();

// POST /products/af;oja;fjka;foj/reviews
// Get /products/af;oja;fjka;foj/reviews
// GET /products/af;oja;fjka;foj/reviews/af;oja;fjka;foj
router.use("/:productId/reviews", reviwRoute);

router
  .route("/")
  .get(getProducts)
  .post(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    uploadProductImages,
    resizeProductImages,
    createProductValidator,
    createProduct
  );

router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    uploadProductImages,
    resizeProductImages,
    updateProductValidator,
    updateProduct
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleateProductValidator,
    deleteProduct
  );

module.exports = router;
