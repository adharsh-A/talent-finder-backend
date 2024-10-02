import HttpError from "../models/http-error.js";
import jwt from "jsonwebtoken";

export const isAuthenticatedUser = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer ")
    ) {
      throw new HttpError("Authentication failed! Token missing.", 401);
    }
    const token = req.headers.authorization.split(" ")[1]; // Authorization: 'Bearer TOKEN'
    console.log('Extracted Token:', token);
    if (!token) {
      throw new Error("Authentication failed!");
    }
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.user = { userId: decodedToken.username, role: decodedToken.role };
    console.error("req.user:", req.user);
    next();
  } catch (err) {
    const error = new HttpError("Authentication failed!", 403);
    return next(error);
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {

    console.log("req.role:", req.user.role);
    if (!roles.includes(req.user.role)) {
      return next(
        new HttpError(
          `Role: ${req.user.role} is not allowed to access this resouce `,
          403
        )
      );
    }
    next();
  };
};
export default { isAuthenticatedUser, authorizeRoles };