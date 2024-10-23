import { configDotenv } from "dotenv";
import { Sequelize } from "sequelize";
configDotenv();
//1st way without connection string
// const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
//   host: process.env.DB_HOST,
//   dialect: 'postgres',
// });

const urlofvercel = process.env.DATABASE_URL;
console.log(urlofvercel);
//second way with conncetion string
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  ssl: true,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: console.log, // Enable SQL logging for debugging
});




//test connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

testConnection();

export default sequelize;
