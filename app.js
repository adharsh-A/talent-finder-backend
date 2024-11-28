// app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import { createServer } from "http";
import { Server } from "socket.io";
import { responseTimeLogger } from './middleware/responseTimeLogger.js';
import rateLimiter from './middleware/rate-limiter.js';
import HttpError from './models/http-error.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import jobRoutes from './routes/jobRoutes.js';

dotenv.config(); // Load environment variables

const app = express();
const httpServer = createServer(app); // Create an HTTP server with express

// Set up Socket.IO with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust this for production if needed
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  },
  pingTimeout: 60000, // Close connection if client doesn't respond for 60 seconds
});

// Socket.IO connection event handling
io.on("connection", (socket) => {
  // console.log(socket);
  const token = socket.handshake.auth.token; // Retrieve token
  const userId = socket.handshake.query.id; // Retrieve userId

  // Verify token (you might want to add your own token verification logic here)
  if (!token) {
    socket.disconnect(); // Disconnect if no token is present
    console.log("User disconnected due to missing token");
    return;
  }

  console.log(`User connected: ${socket.id} with userId: ${userId}`);

  // Join a room based on userId
  socket.join(userId);

  // Handle other events like joining/leaving rooms, private messages, typing status, etc.

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on("leave_room", (room) => {
    socket.leave(room);
    console.log(`User ${socket.id} left room: ${room}`);
  });

  socket.on("private_message", ({ room, message }) => {
    io.to(room).emit("receive_message", {
      message,
      sender: socket.id,
      timestamp: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Make the Socket.IO instance accessible via the app
app.set('io', io);

// General middleware setup
app.set('trust proxy', 1);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.disable("x-powered-by");
app.use(helmet()); // Security middleware
app.use(rateLimiter); // Rate limiting middleware
app.use(responseTimeLogger); // Response time logging middleware

// CORS setup
const corsOptions = {
  origin: "*", // Adjust for production
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests

// Serve static files from the public directory
app.use(express.static("public"));

// API routes
app.get("/test", (req, res) => {
  res.send("Test endpoint is working");
});

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/jobs", jobRoutes);

// Error handling for 404
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  return next(error);
});

// General error handling middleware
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

// Export both app and httpServer for server and Socket.IO usage
export { app, httpServer };
