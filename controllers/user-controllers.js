import HttpError from "../models/http-error.js";
import { Op } from "sequelize";
import User from "../models/user.js";

export const getAllUsers = async (req, res) => {
  const { page, limit } = req.query;
  const skip = (page - 1) * limit;
  const users = await User.findAll({
    offset: skip, // skip equivalent in Sequelize
    limit: Number(limit) // limit equivalent in Sequelize
  });
  
  const total = await User.count(); // Count the total number of users
  
  res.json({
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    users
  });
  // try {
  //   const users = await User.findAll({
  //     attributes: ["id", "username", "role","data","name"], // Only return these columns
  //   });
  //   res.status(200).json(users);
  // } catch (err) {
  //   res.status(500).json(err);
  // }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: {exclude: ["password"]}, // Only return these columns
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
  const { name, occupation, skills, experience, limit, currentPage} = req.body;
  console.log("data received:", name, occupation, skills, experience, limit, currentPage);

  // Validate limit and currentPage to ensure they are numbers
  const parsedLimit = Number(limit);
  const parsedCurrentPage = Number(currentPage);

  console.log(limit);
  console.log(currentPage);
  // Check if the parsed values are valid
  if (isNaN(parsedLimit) || parsedLimit <= 0) {
    return res.status(400).json({ message: "Limit must be a positive number." });
  }
  if (isNaN(parsedCurrentPage) || parsedCurrentPage <= 0) {
    return res.status(400).json({ message: "Current page must be a positive number." });
  }

  try {
    const whereConditions = [];

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
        "data.experience": experience, // Exact match (adjust if you need partial match)
      });
    }

    // Filter by skills (assuming skills is an array and you're looking for a match in any of the skills)
    if (skills) {
      whereConditions.push({
        "data.skills": {
          [Op.contains]: [skills], // Checks if skills array contains the provided skill
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
      offset: isNaN(offset) ? 0 : offset
    });

    // Return the filtered users along with pagination info
    res.status(200).json({
      totalPages: Math.ceil(count / parsedLimit), // Calculate total pages
      currentPage: Number(parsedCurrentPage),
      users: rows,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: 'Server error while searching users' });
  }
};


export const updateUserProfile = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  console.log(req.body);

  const { skills, occupation, experience, portfolio, additionalInfo } = req.body;
  const skillsArray = skills.split(",").map((skill) => skill.trim());
  
  const updatedata = {
    skills: skillsArray,
    occupation,
    experience,
    portfolio,
    additionalInfo,
  };

  try {
    // Check if the user exists
    const userExists = await User.findOne({ where: { id: id } });
    console.log("userExists:", userExists);
    if (!userExists) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update the user and get the count and updated user data
    const [updatedCount, updatedUsers] = await User.update(
      {data: updatedata}, // Update fields directly without wrapping in 'data'
      {
        where: { id: id }, // Fix typo here
        returning: true, // Return the updated user(s)
      }
    );

    // Check if the update was successful
    if (updatedCount === 0) {
      return res
        .status(404)
        .json({ message: "No changes made to the user." });
    }

    // Log updated user information
    console.log(updatedUsers); // Log the array of updated users
    console.log("user updated");
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

export const updateProfile=async(req,res)=>{
  const {id}=req.params;
  const {name,username,skills,occupation,experience,portfolio,additionalInfo}=req.body;
const updatedata={
  name,
  username,
  skills,
  occupation,
  experience,
  portfolio,
  additionalInfo,
}
  try{
    const userExists=await User.findOne({where:{id:id}});
    if(!userExists){
      return res.status(404).json({message:"User not found."});
    }
    const [updatedCount,updatedUsers]=await User.update(updatedata, 
      {
        where: { id: id }, // Fix typo here
        returning: true, // Return the updated user(s)
      }
    );
    if (updatedCount === 0) {
      return res
        .status(404)
        .json({ message: "No changes made to the user." });
    }
    console.log(updatedUsers);
    return res.status(200).json({
      message: "User updated successfully.",
      data: updatedUsers[0], // Return the first updated user
    });
  }catch(err){
    return res.status(500).json({
      error: "Internal server error",
      details: err.message, // Return the error message
    });
  }

}
