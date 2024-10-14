import { DataTypes } from "sequelize";
import sequelize from "../config/database.js"; // Adjust the path

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
  // Add any other fields as needed
});

export default User;
