// app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import { responseTimeLogger } from './middleware/responseTimeLogger.js'; // Adjust the path as needed
import rateLimiter from "./middleware/rate-limiter.js"; // Import rate limiter

// ... (Your other imports) ...

import HttpError from "./models/http-error.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";



dotenv.config();

const app = express();

// Enable 'trust proxy' for the app
// Trust only the first proxy (usually sufficient for a setup with a single proxy/load balancer)
app.set('trust proxy', 1); // Trust the first proxy

// OR, if you know the specific proxy IPs, you can specify those
app.set('trust proxy', 'loopback'); // Only trust localhost (for development)
// Middleware to parse JSON and URL-encoded data
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Security middlewares
app.disable("x-powered-by");
app.use(helmet());
app.use(rateLimiter);
app.use(responseTimeLogger); // Add response time logger

// CORS configuration
const corsOptions = {
  origin: "*", // Adjust as needed
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Serve static files (if needed)
app.use(express.static("public"));

// Routes
app.get("/test", (req, res) => {
  res.send("Test endpoint is working");
});

app.get("/", (req, res) => {
  res.send("Test endpoint is working");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/jobs", jobRoutes);


// Error handling (404)
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