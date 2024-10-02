import express from "express";
const router = express.Router();
import {
  deleteUser,
  getAllUsers,
  getUserById,
  updateUserProfile,
  userProfile,
} from "../controllers/user-controllers.js";
//api/users
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/talent", userProfile);
router.put("/talent/:id", deleteUser);
router.patch("/talent/:id", updateUserProfile);
export default router;
