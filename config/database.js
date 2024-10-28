// config/database.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

let sequelize;
let isInitialized = false;

const initializeDatabase = async () => {
  if (isInitialized) {
    return sequelize;
  }

  try {
    console.log("attempting to connect to database......");
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is not defined in environment variables");
    }

    sequelize = new Sequelize(databaseUrl, {
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
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
    });

    // Single connection test
    await sequelize.authenticate();
    console.log('\x1b[42m\x1b[30m%s\x1b[0m', '✓ Database connection established successfully 🎉');
    isInitialized = true;
    return sequelize;

  } catch (error) {
    console.error('Unable to initialize database:', error);
    throw error;
  }
};

// Export the initialized instance
export default await initializeDatabase();