import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";

import HttpError from "./models/http-error.js";
import rateLimiter from "./middleware/rate-limiter.js";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" })); // For parsing JSON data
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded data
app.disable("x-powered-by");

// CORS configuration
const corsOptions = {
  origin: "*", // Allows this specific origin
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
};
//rate limiter
app.use(rateLimiter);

// Handle preflight requests for all routes
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // This enables the server to respond to the preflight requests with appropriate CORS headers

//prevent xss attacksand clickjacking
app.use(helmet());

app.use(express.static("public"));

app.get("/", (req, res) => {
  console.log("working");
  res.send("Hello World!");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/jobs", jobRoutes);

//invalid route
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  return next(error);
});

//error handler
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

export default app;
