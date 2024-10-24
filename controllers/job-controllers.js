import Job from "../models/job.js";
import User from "../models/user.js";
export const getAllJobs = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  try {
    // Get total count of jobs for pagination
    const totalJobs = await Job.count();  

    // Get jobs with pagination
    const jobs = await Job.findAll({
      offset: skip,
      limit: Number(limit),
    });

    res.status(200).json({
      jobs,
      currentPage: Number(page),
      totalPages: Math.ceil(totalJobs / limit),
      totalJobs,
    });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong", details: err });
  }
};


export const getJobById = async (req, res) => {
  console.log(req.params.id);
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [
        {
          model: User, // Ensure User is imported
          as: 'client', // Use the alias defined in the association
          attributes: { exclude: ['password'] }, // Exclude the password field
        },
      ],
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json(job);
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

export const createJob = async (req, res) => {
  try {
    const { clientId, title, skills,experience, description, salary, location, image, isRemote } = req.body;

    // Validate required fields
    if (!clientId || !title || !description || !location) {
      return res.status(400).json({ error: "clientId, title, description, and location are required." });
    }

    console.log("Incoming job data:", req.body); // Log the incoming data

    // Create a new job with the validated data
    const job = await Job.create({
      clientId,
      title,
      data: { // Assuming `data` is a JSON or JSONB column in your Sequelize model
        skills,
        experience
      },
      description,
      salary,
      location,
      image,
      isRemote,
    });
    res.status(201).json(job);
  } catch (err) {
    console.error("Error creating job:", err); // Log the error for debugging
    res.status(500).json({ error: "An error occurred while creating the job." });
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
