import express from "express";
const router = express.Router();
import {
  deleteUser,
  getAllUsers,
  getUserById,
  updateUserProfile,
  updateProfile,
  bulkUploadUsers
} from "../controllers/user-controllers.js";
//api/users
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/talent/:id", deleteUser);//remain
//put method is used for updating a resource
router.put("/update-talent/:id", updateUserProfile);
router.put("/update-profile/:id", updateProfile);
router.post("/bulk-upload",bulkUploadUsers);
export default router;
