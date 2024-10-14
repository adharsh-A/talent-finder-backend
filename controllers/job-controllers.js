import Job from "../models/job.js";

export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      limit: 50,
    });
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json(job);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const createJob = async (req, res) => {
  try {
    console.log("Incoming job data:", req.body); // Log the incoming data
    const job = await Job.create(req.body);
    res.status(201).json(job);
  } catch (err) {
    console.error("Error creating job:", err); // Log the error for debugging
    res.status(500).json(err);
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });
    if (!job[0]) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json(job[1][0]);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const deleteJob = async (req, res) => {
  try {
    const count = await Job.destroy({ where: { id: req.params.id } });
    if (count === 0) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
};
