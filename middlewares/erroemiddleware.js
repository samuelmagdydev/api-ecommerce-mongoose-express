const ApiError = require("../utils/apiError");

const sendErrorForDevelopmentMode = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });

const sendErrorForProduction = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

const handelJwtInvalidSignature = () =>
  new ApiError("Invalid Token, Please Login Again...", 401);
const handelJwtExpired = () =>
  new ApiError("Expired Token, Please Login Again...", 401);

const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === "development") {
    sendErrorForDevelopmentMode(err, res);
  } else {
    if (err.name === "JsonWebTokenError") err = handelJwtInvalidSignature();
    if (err.name === "TokenExpiredError") err = handelJwtExpired();

    sendErrorForProduction(err, res);
  }
};

module.exports = globalError;
