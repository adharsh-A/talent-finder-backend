import express from "express";
const router = express.Router();
import {
  getAllClients,
  getClientById,
  clientProfile,
} from "../controllers/client-controllers.js";
import { searchUser, searchByData } from "../controllers/user-controllers.js";

router.get("/", getAllClients);
router.get("/:id", getClientById);
router.post("/client", clientProfile);
router.post("/search", searchUser);
router.post("/searchByData", searchByData);

export default router;
