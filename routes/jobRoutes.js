import express from "express";
const router = express.Router();
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyJob,
  getApplicationsByJobId,
  getApplicationsByUserId,
  updateStatus,
  deleteApplication,
getJobsByClientId
} from "../controllers/job-controllers.js";
//api/jobs
router.get("/", getAllJobs);
router.get("/:id", getJobById);

router.post("/", createJob);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);

router.post('/:jobId/apply', applyJob);
router.get("/applications/:jobId", getApplicationsByJobId);
router.get("/applications-user/:userId", getApplicationsByUserId);
router.put("/application/status", updateStatus);
router.delete("/application/delete", deleteApplication);
router.get("/client/:clientId", getJobsByClientId);
export default router;
