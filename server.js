// import app from "./app.js";
// import sequelize from "./config/database.js";

// // Handling Uncaught Exception
// process.on("uncaughtException", (err) => {
//   console.error(`Error: ${err.message}`);
//   console.error("Shutting down the server due to an uncaught exception");
//   process.exit(1);
// });

// // Sync Database
// const startServer = async () => {
//   try {
//     // Debugging: Log DATABASE_URL to ensure it's correct
//     console.log("Connecting to:", process.env.DATABASE_URL);

//     await sequelize.authenticate(); // Validate DB connection
//     console.log("Database connected successfully.");

//     await sequelize.sync(); // Sync the database
//     console.log("Database synced successfully!");
    
//     // Start your Express server after DB connection is successful
//     app.listen(process.env.PORT || 3000, () => {
//       console.log(`Server running on port ${process.env.PORT || 3000}`);
//     });

//   } catch (error) {
//     console.error("Error during database connection/sync:", error); // Log the full error
//     process.exit(1); // Exit process if database sync fails
//   }
// };

// startServer();

// // Unhandled Promise Rejection
// process.on("unhandledRejection", (reason, promise) => {
//   console.error("Unhandled Rejection at:", promise, "reason:", reason);
//   process.exit(1);
// });

// export default app;

import app from "./app.js";
import dotenv from "dotenv";
import sequelize from "./config/database.js"; // Adjust the path as needed
import User from "./models/user.js";
import Job from "./models/job.js";
import JobApplication from "./models/job-application.js";
import './models/associations.js'; // Import associations after models

dotenv.config();

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
    await sequelize.sync({ force: false, alter: true });

    console.log('Database & tables created!');

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

