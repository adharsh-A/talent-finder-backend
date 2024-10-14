import express from "express";
const router = express.Router();
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from "../controllers/job-controllers.js";
//api/jobs
router.get("/", getAllJobs);
router.get("/:id", getJobById);

router.post("/", createJob);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);
export default router;
