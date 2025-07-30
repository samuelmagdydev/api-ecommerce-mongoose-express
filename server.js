const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
// eslint-disable-next-line import/no-extraneous-dependencies
const cors = require("cors");
// eslint-disable-next-line import/no-extraneous-dependencies
const compression = require("compression");
// eslint-disable-next-line import/no-extraneous-dependencies
const rateLimit = require("express-rate-limit");
// eslint-disable-next-line import/no-extraneous-dependencies
const hpp = require("hpp");
const dbConnection = require("./config/database");

dotenv.config({ path: "config.env" });
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/erroemiddleware");
const mountRoutes = require("./Routes");
const { webhookCheckout } = require("./Services/orderService");

//connect to database
dbConnection();
//express app
const app = express();

// Enable other domains to access the API
app.use(cors());
// app.options("*", cors()); // for preflight requests
app.use(
  cors({
    origin: "*", // أو حدد دومين معين زي: "http://localhost:3000"
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

// compress the response
app.use(compression());

// CheckOut WebHook

app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

//Middlewares

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode : ${process.env.NODE_ENV}`);
}




// Limit each IP to 100 requests per `window` (here, per 15 minutes).
// const limiter = rateLimit({
// 	windowMs: 15 * 60 * 1000,
// 	limit: 5,
//   message:'Too Many Requested Created From This Ip , Please Try Again After 15 Minutes',
//   standardHeaders: true,
//   legacyHeaders: false,
// })

// // Apply the rate limiting middleware to all requests.
// app.use('/api',limiter)

app.use(
  hpp({
    whitelist: ["price", "sold", "quantity", "ratingAverage", "ratingQuantity"],
  })
);
//MountRoutes

mountRoutes(app);

app.all("/{*any}", (req, res, next) => {
  const error = new ApiError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );
  next(error);
});

//Global errorHandling Middleware
app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App Running On port ${PORT}`);
});

//handel rejection outside express
process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection Errors : ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting Down...`);

    process.exit(1);
  });
});
