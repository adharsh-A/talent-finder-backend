import { DataTypes } from "sequelize";
import sequelize from "../config/database.js"; // Adjust the path
import User from "./user.js";

const Job = sequelize.define("Job", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  clientId: {
    type: DataTypes.UUID, // Assuming 'clientId' is a UUID
    allowNull: false,
    references: {
      model: 'Users', // Reference to User model
      key: 'id', // User's primary key
    },
    onDelete: 'CASCADE',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  data: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  salary: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isRemote: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'Jobs',
});

// Export Job model for use in associations
export default Job;
