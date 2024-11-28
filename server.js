// server.js
import { app, httpServer } from './app.js';
import dotenv from 'dotenv';
import { sequelize, connectDatabase } from './config/database.js';
import './models/associations.js'; // Ensure associations are set up

dotenv.config(); // Load environment variables

// Track connected sockets for cleanup during shutdown
let connectedSockets = new Set();

const startServer = async () => {
  try {
    // Sync the database in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ force: false, alter: false });
      console.log('Database & tables created!');
    }

    // Initialize database connection
    await connectDatabase();

    // Get the Socket.IO instance from the app
    const io = app.get('io');

    // Handle Socket.IO connections
    io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);
      connectedSockets.add(socket);
      // Handle socket disconnection
      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        connectedSockets.delete(socket);
      });

      // Handle socket errors
      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });
    });

    // Set the port dynamically (for Render or similar environments)
    const port = process.env.PORT || 3000;
    const server = httpServer.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    // Graceful shutdown function
    const shutdown = async () => {
      console.log('Received shutdown signal, initiating graceful shutdown...');

      // Disconnect all connected sockets
      console.log(`Closing ${connectedSockets.size} socket connections...`);
      connectedSockets.forEach(socket => socket.disconnect(true));
      connectedSockets.clear();

      // Close Socket.IO server
      io.close(() => {
        console.log('Socket.IO server closed');
      });

      // Close the HTTP server
      const serverClosePromise = new Promise(resolve => {
        server.close(() => {
          console.log('HTTP server closed');
          resolve();
        });
      });

      // Close the database connection
      const dbClosePromise = sequelize.close()
        .then(() => console.log('Database connection closed'))
        .catch(err => console.error('Error closing database:', err));

      // Wait for all shutdown processes with a timeout
      try {
        await Promise.race([
          Promise.all([serverClosePromise, dbClosePromise]),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Shutdown timeout')), 10000))
        ]);
        console.log('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    // Handle shutdown signals
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    // Handle unhandled rejections and uncaught exceptions
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      shutdown();
    });
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      shutdown();
    });

  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
export default app;