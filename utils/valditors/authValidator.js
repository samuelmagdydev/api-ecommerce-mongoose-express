const { check } = require("express-validator");
const { default: slugify } = require("slugify");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");

exports.signupValidator = [
  check("name")
    .notEmpty()
    .withMessage("User Required")
    .isLength({ min: 3 })
    .withMessage("Too Short User Name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email Required")
    .isEmail()
    .withMessage("Inavlid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("Email Already exsist"));
        }
      })
    ),
  check("password")
    .notEmpty()
    .withMessage("Password Is Required")
    .isLength({ min: 6 })
    .withMessage("Password Must Be AT Least 6 Characters ")
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("Confirm Password Incorrect");
      }
      return true;
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password Conifrmation Required"),
  validatorMiddleware,
];

exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email Required")
    .isEmail()
    .withMessage("Inavlid email address"),
   
  check("password")
    .notEmpty()
    .withMessage("Password Is Required")
    .isLength({ min: 6 })
    .withMessage("Password Must Be AT Least 6 Characters "),
    
  validatorMiddleware,
];
