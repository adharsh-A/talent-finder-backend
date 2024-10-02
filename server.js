import app from "./app.js";
import sequelize from "./config/database.js"; // Adjust the path as needed

// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
});

// Config
// (any additional configuration can go here)

// Cloudinary Configuration
/* cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
}); */

const port = process.env.PORT || 8080;

const startServer = async () => {
  try {
    // Syncing the database
    await sequelize.sync(); // Syncs the database and creates tables if they don't exist
    console.log("Database synced!");

    // Start the server after syncing the database
    const server = app.listen(port, () => {
      console.log(`Server is working on http://localhost:${port}`);
    });

    // Unhandled Promise Rejection
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    console.error("Error syncing database:", error);
    process.exit(1); // Exit the process if database sync fails
  }
};

// Start the server
startServer();
