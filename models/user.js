import { DataTypes } from "sequelize";
import sequelize from "../config/database.js"; // Adjust the path

const User = sequelize.define("User", {
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
    defaultValue: "user",
  },
  data: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  // Add any other fields as needed
});

export default User;
