import { DataTypes } from "sequelize";
import sequelize from "../config/database.js"; // Adjust the path

const Job = sequelize.define("Job", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // Automatically generate UUIDs
    allowNull: false,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false, // Job title cannot be null
  },
  data: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT, // For longer job descriptions
    allowNull: false,
  },
  salary: {
    type: DataTypes.INTEGER, // Salary as an integer (could also be DECIMAL)
    allowNull: true, // Salary can be NULL
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false, // Location can be NULL
  },
  image: {
    type: DataTypes.STRING, // Store image as a URL or base64-encoded string
    allowNull: true, // Image can be NULL
  },
  isRemote: {
    type: DataTypes.BOOLEAN, // Whether the job is remote or not
    defaultValue: false, // Default value is false (not remote)
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Automatically sets to the current date and time
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Automatically updates on record update
  },
});

export default Job;
