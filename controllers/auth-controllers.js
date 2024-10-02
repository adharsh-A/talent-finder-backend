import HttpError from "../models/http-error.js";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import bcrypt from "bcryptjs";

export const register = async (req, res, next) => {
  console.log(req.body); // Log the entire request body

  const { username, password, role, data } = req.body;

  // Check if the user already exists

  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    return res.status(400).json({ message: "Username already taken" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the new user
  try {
    const newUser = await User.create({
      username,
      password: hashedPassword,
      role,
      data,
    });
    const token = jwt.sign(
      {
        username: newUser.username,
        password: newUser.password,
        role: newUser.role,
      },
      process.env.JWT_KEY,
      {
        expiresIn: "1h",
      }
    );
    res.status(200).json({
      message: "User created successfully",
      token,
      username: newUser.username,
      role: newUser.role,
    });
  } catch (error) {
    console.error(error);
    return next("An error occurred while creating the user", 500);
  }
};
export const login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { username: username } });
    if (!existingUser) {
      return next(new HttpError("user not found", 500));
    }

    let validPassword = await bcrypt.compare(password, existingUser.password);
    if (!validPassword) {
      return next(new HttpError("wrong password", 500));
    }
    const token = jwt.sign(
      {
        username: existingUser.username,
        password: existingUser.password,
        role: existingUser.role,
      },
      process.env.JWT_KEY,
      {
        expiresIn: "1h",
      }
    );
    res.status(200).json({
      message: "successfully logged in",
      token,
      username: existingUser.username,
      role: existingUser.role,
      data: existingUser.data,
    });
  } catch (err) {
    console.error(err);
  }
};
