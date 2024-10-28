// config/database.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.BACKEND_URL_FOR_TALENT;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 5,  // Maximum number of connections in the pool
    min: 0,  // Minimum number of connections in the pool
    acquire: 30000,  // Maximum time (in milliseconds) that pool will try to get a connection before throwing an error
    idle: 10000  // Maximum time (in milliseconds) that a connection can be idle before being released
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

// This function is only called once to check the connection during server startup.
const connectDatabase = async () => {
  try {
    console.log("Attempting to connect to the database...");
    await sequelize.authenticate();
    console.log('\x1b[42m\x1b[30m%s\x1b[0m', '✓ Database connection established successfully 🎉');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

export { sequelize, connectDatabase };
