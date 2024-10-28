import { DataTypes } from "sequelize";
import {sequelize} from "../config/database.js";
import Job from "./job.js";
import User from "./user.js";

// JobApplication data model
const JobApplication = sequelize.define("JobApplication", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    jobId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Jobs',
        key: 'id',
        },
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
        },
      onDelete: "CASCADE",
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
      validate: {
        isIn: [["pending", "rejected", "accepted"]],
      },
    },
}, {
    tableName: 'JobApplications',
});

export default JobApplication;
  