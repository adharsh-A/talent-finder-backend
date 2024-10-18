import app from "./app.js";
import sequelize from "./config/database.js"; // Adjust the path if necessary

// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.error(`Error: ${err.message}`);
  console.error("Shutting down the server due to an uncaught exception");
  process.exit(1);
});

// Sync Database
const startServer = async () => {
  try {
    await sequelize.authenticate(); // Ensures the database connection is valid
    await sequelize.sync(); // Sync the database and create tables if they don't exist
    console.log("Database connected and synced successfully!");
  } catch (error) {
    console.error("Error syncing the database:", error);
    process.exit(1); // Exit process if database sync fails
  }
};

startServer();

// Unhandled Promise Rejection
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Optionally, you could shut down the process safely or log the error in a monitoring tool
  process.exit(1);
});

export default app; // Export the app for Vercel to handle server-side

// import app from "./app.js";
// import dotenv from "dotenv";
// import sequelize from "./config/database.js"; // Adjust the path as needed
// dotenv.config();

// // Handling Uncaught Exception
// process.on("uncaughtException", (err) => {
//   console.log(`Error: ${err.message}`);
//   console.log(`Shutting down the server due to Uncaught Exception`);
//   process.exit(1);
// });

// // Config
// // (any additional configuration can go here)

// // Cloudinary Configuration
// /* cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// }); */

// const port = process.env.PORT || 8080;

// const startServer = async () => {
//   try {
//     // Syncing the database
//     await sequelize.sync({force: true}); // Syncs the database and creates tables if they don't exist
//     console.log("Database synced!");

//     // Start the server after syncing the database
//     const server = app.listen(port, () => {
//       console.log(`Server is working on http://localhost:${port}`);
//     });

//     // Unhandled Promise Rejection
//     process.on('unhandledRejection', (reason, promise) => {
//       console.error('Unhandled Rejection at:', promise, 'reason:', reason);
//       server.close(() => {
//         process.exit(1);
//       });
//     });
//   } catch (error) {
//     console.error("Error syncing database:", error);
//     process.exit(1); // Exit the process if database sync fails
//   }
// };

// // Start the server
// startServer();
