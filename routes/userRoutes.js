import express from "express";
const router = express.Router();
import {
  deleteUser,
  getAllUsers,
  getUserById,
  updateUserProfile,
} from "../controllers/user-controllers.js";
//api/users
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/talent/:id", deleteUser);//remain
router.put("/update-talent/:id", updateUserProfile);
export default router;
