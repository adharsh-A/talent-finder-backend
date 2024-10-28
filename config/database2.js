// config/database.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    
    this.initialize();
    Database.instance = this;
  }

  initialize() {
    if (!this.sequelize) {
      const databaseUrl = process.env.DATABASE_URL;
      
      if (!databaseUrl) {
        throw new Error("DATABASE_URL is not defined");
      }

      this.sequelize = new Sequelize(databaseUrl, {
        dialect: 'postgres',
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        logging: process.env.NODE_ENV === 'development'
      });
    }
    return this.sequelize;
  }

  async connect() {
    if (!this.isConnected) {
      try {
        await this.sequelize.authenticate();
        console.log('Database connection established successfully');
        this.isConnected = true;
      } catch (error) {
        console.error('Unable to connect to database:', error);
        throw error;
      }
    }
    return this.sequelize;
  }

  getInstance() {
    return this.sequelize;
  }
}

// Create and export a single instance
const database = new Database();
export default database.getInstance();

// Export connect method for explicit connection management
export const connectDatabase = () => database.connect(); 
//server js for this
// server.js
import app from "./app.js";
import dotenv from "dotenv";
import sequelize, { connectDatabase } from "./config/database.js";
import './models/associations.js';

dotenv.config();

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Explicitly connect to database
    await connectDatabase();

    // Sync models in development only
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ force: false, alter: false });
      console.log('Database & tables created!');
    }

    app.listen(port, () => {
      console.log(`Server is working on port ${port}`);
    });

  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();