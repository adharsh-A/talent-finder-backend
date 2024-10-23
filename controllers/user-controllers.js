import bcrypt from 'bcryptjs';
import HttpError from "../models/http-error.js";
import { Op } from "sequelize";
import User from "../models/user.js";

import NodeCache from "node-cache";

// Create a new cache instance
const userCache = new NodeCache({ stdTTL: 3600 }); // TTL (time to live) in seconds

export const getAllUsers = async (req, res) => {
  const { page = 1, limit = 50 } = req.query; // Default values for page and limit
  const skip = (page - 1) * limit;
  const cacheKey = `users_page_${page}_limit_${limit}`; // Unique cache key based on page and limit

  try {
    // Check if data is already in cache
    const cachedData = userCache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData); // Return cached data if available
    }

    // Use Promise.all to run both queries concurrently
    const [users, total] = await Promise.all([
      User.findAll({
        exclude: ["password"],
        where: { role: "talent" },
        offset: skip,
        limit: Number(limit),
      }),
      User.count({ where: { role: "talent" } }), // Count only users with role 'talent'
    ]);

    const responseData = {
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      users,
    };

    // Store the response data in cache
    userCache.set(cacheKey, responseData);

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] }, // Only return these columns
    });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.destroy({ where: { id: req.params.id } });
    res.status(200).json({
      message: "User deleted successfully",
      data: user,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

export const searchUser = async (req, res) => {
  const { username } = req.query;
  try {
    const users = await User.findAll({
      where: { username: { [Op.like]: `%${username}%` } },
    });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const searchByData = async (req, res) => {
  // Destructure with default values
  const { name, occupation, skill, experience, limit, currentPage } = req.body;
  console.log(skill);

  // Validate limit and currentPage
  if (!limit || limit <= 0) {
    return res
      .status(400)
      .json({ message: "Limit must be a positive number." });
  }
  if (!currentPage || currentPage <= 0) {
    return res
      .status(400)
      .json({ message: "Current page must be a positive number." });
  }

  // Validate limit and currentPage to ensure they are numbers
  const parsedLimit = Number(limit);
  const parsedCurrentPage = Number(currentPage);

  console.log(limit);
  console.log(currentPage);
  // Check if the parsed values are valid
  if (isNaN(parsedLimit) || parsedLimit <= 0) {
    return res
      .status(400)
      .json({ message: "Limit must be a positive number." });
  }
  if (isNaN(parsedCurrentPage) || parsedCurrentPage <= 0) {
    return res
      .status(400)
      .json({ message: "Current page must be a positive number." });
  }

  try {
    const whereConditions = [];
    whereConditions.push({ role: "talent" });

    // Filter by name (case-insensitive search)
    if (name) {
      whereConditions.push({
        name: {
          [Op.like]: `%${name}%`, // Case-insensitive partial match
        },
      });
    }

    // Filter by occupation (in the data JSON object)
    if (occupation) {
      whereConditions.push({
        "data.occupation": {
          [Op.like]: `%${occupation}%`, // Case-insensitive partial match
        },
      });
    }

    // Filter by experience (exact match or partial, depending on your needs)
    if (experience) {
      whereConditions.push({
        "data.experience": {
          [Op.like]: `%${experience}%`, // Matches any record containing the value of experience
        },
      });
    }
    

    // Filter by skills (assuming skills is an array and you're looking for a match in any of the skills)
    if (skill) {
      whereConditions.push({
        "data.skills": {
          [Op.overlap]: [skill.toLowerCase()], // Check if the skills array contains the provided skill, ignoring case
        },
      });
    }
    

    // Calculate offset for pagination
    const offset = (parsedCurrentPage - 1) * parsedLimit;

    // Combine all conditions using Op.and to ensure all filters apply
    const { count, rows } = await User.findAndCountAll({
      where: {
        [Op.and]: whereConditions,
      },
      limit: parsedLimit, // Limit for pagination
      offset: isNaN(offset) ? 0 : offset,
    });

    // Return the filtered users along with pagination info
    res.status(200).json({
      totalPages: Math.ceil(count / parsedLimit), // Calculate total pages
      currentPage: Number(parsedCurrentPage),
      users: rows,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Server error while searching users" });
  }
};

export const updateUserProfile = async (req, res) => {
  const { id } = req.params;
  console.log("User ID:", id);
  console.log("Request Body:", req.body);

  // Destructure the incoming fields from the request body
  const {
    skills,
    occupation,
    experience,
    portfolio,
    additionalInfo,
    role,
    clientCompany,
    companyLocation,
    clientContactEmail,
    clientWebsite,
    clientContactPhone,
  } = req.body;

  // Prepare the update data
  let updatedata;

  // Check if the role is not "client" and update accordingly
  if (role !== "client") {
    // If skills are provided, split them into an array
    const skillsArray = skills?.split(",").map((skill) => skill.trim()) || [];

    // Set updated data for non-client users
    updatedata = {
      skills: skillsArray,
      occupation,
      experience,
      portfolio,
      additionalInfo,
    };
  } else {
    // Set updated data for client users
    updatedata = {
      clientCompany,
      companyLocation,
      clientContactEmail,
      clientWebsite,
      clientContactPhone,
    };
  }

  try {
    // Check if the user exists
    const userExists = await User.findOne({ where: { id } });
    console.log("User exists:", userExists);

    if (!userExists) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update the user and return the updated user data
    const [updatedCount, updatedUsers] = await User.update(
      { data: updatedata }, // Update the 'data' field with the prepared object
      {
        where: { id }, // Ensure the correct user is being updated
        returning: true, // Return the updated user(s)
      }
    );

    // Check if the update was successful
    if (updatedCount === 0) {
      return res.status(404).json({ message: "No changes made to the user." });
    }

    // Log and return the updated user information
    console.log("Updated User:", updatedUsers[0]);
    return res.status(200).json({
      message: "User updated successfully.",
      data: updatedUsers[0], // Return the first updated user
    });
  } catch (err) {
    // Handle any errors
    console.error("Error during update:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message, // Return the error message
    });
  }
};

export const updateProfile = async (req, res) => {
  const { id } = req.params;
  console.log(object);
  const {
    name,
    username,
    skills,
    occupation,
    experience,
    portfolio,
    additionalInfo,
  } = req.body;
  const skillsArray = skills.split(",").map((skill) => skill.trim());
  const updatedata = {
    name,
    username,
    skills: skillsArray,
    occupation,
    experience,
    portfolio,
    additionalInfo,
  };
  try {
    const userExists = await User.findOne({ where: { id: id } });
    if (!userExists) {
      return res.status(404).json({ message: "User not found." });
    }
    const [updatedCount, updatedUsers] = await User.update(updatedata, {
      where: { id: id }, // Fix typo here
      returning: true, // Return the updated user(s)
    });
    if (updatedCount === 0) {
      return res.status(404).json({ message: "No changes made to the user." });
    }
    console.log(updatedUsers);
    return res.status(200).json({
      message: "User updated successfully.",
      data: updatedUsers[0], // Return the first updated user
    });
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      details: err.message, // Return the error message
    });
  }
};

export const bulkUploadUsers = async (req, res) => {
  try {
    const sampleData = req.body;

    // Hash passwords and prepare users for bulk creation
    const usersToCreate = await Promise.all(
      sampleData.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return {
          ...user,
          password: hashedPassword,
        };
      })
    );

    // Bulk create users
    const users = await User.bulkCreate(usersToCreate, { returning: true });

    res.status(200).json({
      message: `${users.length} sample users uploaded successfully`,
      users,
    });
  } catch (error) {
    console.error("Error uploading sample data:", error);
    res.status(500).json({ message: "Failed to upload sample users" });
  }
};
