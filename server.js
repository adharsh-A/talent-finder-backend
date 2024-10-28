// // import app from "./app.js";
// // import sequelize from "./config/database.js";

// // // Handling Uncaught Exception
// // process.on("uncaughtException", (err) => {
// //   console.error(`Error: ${err.message}`);
// //   console.error("Shutting down the server due to an uncaught exception");
// //   process.exit(1);
// // });

// // // Sync Database
// // const startServer = async () => {
// //   try {
// //     // Debugging: Log DATABASE_URL to ensure it's correct
// //     console.log("Connecting to:", process.env.DATABASE_URL);

// //     await sequelize.authenticate(); // Validate DB connection
// //     console.log("Database connected successfully.");

// //     await sequelize.sync(); // Sync the database
// //     console.log("Database synced successfully!");
    
// //     // Start your Express server after DB connection is successful
// //     app.listen(process.env.PORT || 3000, () => {
// //       console.log(`Server running on port ${process.env.PORT || 3000}`);
// //     });

// //   } catch (error) {
// //     console.error("Error during database connection/sync:", error); // Log the full error
// //     process.exit(1); // Exit process if database sync fails
// //   }
// // };

// // startServer();

// // // Unhandled Promise Rejection
// // process.on("unhandledRejection", (reason, promise) => {
// //   console.error("Unhandled Rejection at:", promise, "reason:", reason);
// //   process.exit(1);
// // });

// // export default app;





//works with normally consider as checkpoint
// import app from "./app.js";
// import dotenv from "dotenv";
// import sequelize from "./config/database.js";
// import './models/associations.js';

// dotenv.config();

// const port = process.env.PORT || 8080;

// //use when vercel dev


// const startServer = async () => {
//   try {
//     // Only sync in development
//     if (process.env.NODE_ENV !== 'production') {
//       await sequelize.sync({ force: false, alter: false });
//       console.log('Database & tables created!');
//     }

//     const server = app.listen(port, () => {
//       console.log(`Server is working on port ${port}`);
//     });

//     // Graceful shutdown
//     const shutdown = async () => {
//       console.log('Received shutdown signal');
//       await sequelize.close();
//       server.close(() => {
//         console.log('Server closed');
//         process.exit(0);
//       });
//     };

//     process.on('SIGTERM', shutdown);
//     process.on('SIGINT', shutdown);
//     process.on('unhandledRejection', (reason, promise) => {
//       console.error('Unhandled Rejection at:', promise, 'reason:', reason);
//       shutdown();
//     });

//   } catch (error) {
//     console.error("Error starting server:", error);
//     process.exit(1);
//   }
// };

// startServer();
// server.js
import app from "./app.js";
import dotenv from "dotenv";
import { sequelize, connectDatabase } from "./config/database.js";
import './models/associations.js'; // Make sure associations are loaded after database initialization

dotenv.config();

const startServer = async () => {
  try {
    // Only sync in development
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ force: false, alter: false });
      console.log('Database & tables created!');
    }
    await connectDatabase();  // This ensures that the database connection is made once when the server starts

    // Connect to the database (one-time initialization)

    if (process.env.NODE_ENV !== 'production') {
      const port = process.env.PORT || 3000;
      const server = app.listen(port, () => {
        console.log(`Server is working on port ${port}`);
      });

      // Graceful shutdown
      const shutdown = async () => {
        console.log('Received shutdown signal');
        await sequelize.close();  // Close the database connection
        server.close(() => {
          console.log('Server closed');
          process.exit(0);
        });
      };

      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);
      process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        shutdown();
      });
    }

  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
export default app;
