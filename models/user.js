import { DataTypes } from "sequelize";
import {sequelize} from "../config/database.js"; // Adjust the path
import Job from "./job.js";


const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  username: { 
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "password123",
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "talent",
  },
  data: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'Users',
});

// Export User model for use in associations
export default User;
