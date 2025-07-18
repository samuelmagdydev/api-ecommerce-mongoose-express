const crypto = require("crypto");
// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const createToken = require("../utils/createToken");

const User = require("../models/userModel");

//  @des signup
//  @route GET /api/v1/auth/signup
//  @access Public

exports.signup = asyncHandler(async (req, res, next) => {
  //1 -Create User

  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  //2- Generate Token
  const token = createToken(user._id);

  res.status(201).json({ data: user, token });
});

//  @des login
//  @route GET /api/v1/auth/login
//  @access Public
exports.login = asyncHandler(async (req, res, next) => {
  //1- check if password and enail in Body (validation)
  //2-check if user exist & check if passsword correct
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  //3- generate token
  const token = createToken(user._id);
  //4- send respone to client side
  res.status(200).json({ data: user, token });
});

//@desc make sure that user is Logged In
exports.protect = asyncHandler(async (req, res, next) => {
  //1- check if token exist, if exist get it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError("You Are Not Login Please Login to Access This Route", 401)
    );
  }

  //2- verfiy token(no change happen, expire token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  console.log(decoded);

  //3- check if user exist
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError(
        "The User That Belong To This Token does No Longer Exist",
        401
      )
    );
  }
  //4- check if user change his password after created Token
  if (currentUser.passwordChangedAt) {
    const passChangedTimesStamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    // Password Changed After Token Created
    if (passChangedTimesStamp > decoded.iat) {
      return next(
        new ApiError(
          "User Recently Changed His Password. PLease Login Again",
          401
        )
      );
    }
  }
  req.user = currentUser;
  next();
});
//@desc Authorization (User Permissions)
//["admin","manager"]
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    //1-access roles
    //2-access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(new ApiError("You Are Not Allowed To Acess This Route", 403));
    }
    next();
  });

//  @des forgotPassword
//  @route POST /api/v1/auth/verfiyResetCode
//  @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  //1-get User By Email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There Is No User With This Email ${req.body.email}`, 404)
    );
  }
  //2-if User exists , Generate hash reset random 6 Digits and save it in DB
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  //save Hashed Password Reset Code Into DB
  user.passwordResetCode = hashedResetCode;
  //Add Expiration time For password reset code (10 min)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerfied = false;

  await user.save();
  const message = `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2 style="color: #41415b;">Hi ${user.name},</h2>
    <p>We received a request to reset the password on your <strong>E-ShopApp</strong> account.</p>
    <p style="font-size: 18px; color: #000;">
      <strong>Your reset code is:</strong> 
      <span style="background-color: #f2f2f2; padding: 10px 15px; border-radius: 5px; font-weight: bold;">${resetCode}</span>
    </p>
    <p>Please enter this code in the app to complete the password reset process.</p>
    <p>If you didn’t request this, you can safely ignore this email — your password will remain unchanged.</p>
    <br/>
    <p>Thanks for helping us keep your account secure.</p>
    <p style="margin-top: 30px;">Best regards,<br/><strong>The E-ShopApp Team</strong></p>
  </div>
`;

  //3-send the reset code via email
  try {
    await sendEmail({
      email: user.email,
      subject: "Your Password Reset Code (Valid Only For 10 min)",
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerfied = undefined;

    await user.save();

    return next(new ApiError("There Is An Error In Sending Email", 500));
  }
  res.status(200).json({
    status: "Success",
    message: "Reset Code Send To Email Successfuly",
  });
});

//  @des Verfiy Password Rest Code
//  @route POST /api/v1/auth/forgetPassword
//  @access Public
exports.verfiyPasswordResetCode = asyncHandler(async (req, res, next) => {
  //1- Get User Based On Reset Code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Reset Code Invalid Or Expired"));
  }
  //2-  Reset code valid
  user.passwordResetVerfied = true;
  await user.save();
  res.status(200).json({ status: "Success" });
});

//  @des Reset Password
//  @route POST /api/v1/auth/resetPassword
//  @access Public

exports.resetPassword = asyncHandler(async (req, res, next) => {
  //1- get User Based On Email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There Is Now User With email ${req.body.email}`, 404)
    );
  }
  //2- check reset Code Verfied
  if (!user.passwordResetVerfied) {
    return next(new ApiError("Reset Code Not Verfied", 400));
  }
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerfied = undefined;

  await user.save();
  //3- if everything is ok, Generate Token
  const token = createToken(user._id);
  res.status(200).json({ token });
});
