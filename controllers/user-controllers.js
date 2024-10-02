import HttpError from "../models/http-error.js";
import User from "../models/user.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "role"], // Only return these columns
    });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "username", "role"], // Only return these columns
    });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const userProfile = async (req, res) => {
  const { data } = req.body;

  try {
    const user = await User.update({ data }, { where: { id: req.params.id } });
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
  const { data } = req.query;

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

// Update user profile
export const updateUserProfile = async (req, res) => {
  const { data } = req.body; // Extract 'data' from request body
  const userId = req.params.id; // Get user ID from request parameters

  try {
    // Check if the user exists
    const userExists = await User.findOne({ where: { id: userId } });
    if (!userExists) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update the user and get the count and updated user data
    const [updatedCount, updatedUsers] = await User.update(
      { data },
      {
        where: { id: userId },
        returning: true, // This option should be included here
      }
    );

    // Check if the update was successful
    if (updatedCount === 0) {
      return res
        .status(404)
        .json({ message: "User not found or no changes made." });
    }

    // Log updated user information
    console.log(updatedUsers); // Log the array of updated users

    return res.status(200).json({
      message: "User updated successfully.",
      data: updatedUsers[0].data, // Return the first updated user
    });
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      details: err.message, // Return the error message
    });
  }
};
