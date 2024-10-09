import HttpError from "../models/http-error.js";
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
  const { data } = req.body;

  try {
    // Assuming 'data' is a JSON column and we want to match against specific keys
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { "data.skills": { [Op.like]: `%${data}%` } },
          { "data.experience": { [Op.like]: `%${data}%` } }, // Replace with actual key
          { "data.education": { [Op.like]: `%${data}%` } }, // Replace with actual key
          // Add more keys as needed
        ],
      },
    });

    res.status(200).json(users);
  } catch (err) {
    console.error(err); // Log error for debugging
    res
      .status(500)
      .json({ error: "An error occurred while searching for users." });
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
