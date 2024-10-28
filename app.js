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
import { responseTimeLogger } from './middleware/responseTimeLogger.js'; // Adjust the path as needed


// Load environment variables
dotenv.config();

const app = express();

app.use(responseTimeLogger);

// Enable trust proxy for rate limiting
app.set('trust proxy', 1); // Important when behind a proxy


// Middleware to parse JSON and URL-encoded data
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Security middlewares
app.disable("x-powered-by"); // Disable 'x-powered-by' header for security
app.use(helmet()); // Secure headers
app.use(rateLimiter); // Rate limiter to prevent excessive requests

// CORS configuration
const corsOptions = {
  origin: "*", // Adjust as necessary, "*" allows all origins
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
};
app.use(cors(corsOptions)); // Enable CORS for all routes
app.options("*", cors(corsOptions)); // Handle preflight requests

// Serve static files from 'public' directory
app.use(express.static("public"));

// Routes

app.get("/test", (req, res) => {
  try {
    
    res.send("Test endpoint is working");
    console.log("root route accepted");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/jobs", jobRoutes);

// Handle invalid routes (404)
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  return next(error);
});

// Global error handling middleware
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

export default app;
