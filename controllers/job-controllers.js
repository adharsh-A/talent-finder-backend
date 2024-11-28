import Job from "../models/job.js";
import User from "../models/user.js";
import { Op } from "sequelize";
import { Sequelize } from "sequelize";
import JobApplication from "../models/job-application.js";


import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 3600 }); // TTL (time to live) in seconds

export const getAllJobs = async (req, res) => {
  const startTime = Date.now();
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  const cacheKey = `jobs_page_${page}_limit_${limit}`;

  try {
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      const endTime = Date.now();
      const elapsedTime = endTime - startTime;
      console.log(`Elapsed time: ${elapsedTime}ms`);
      console.log("Returning cached data");
      return res.json(cachedData);
    }

    const totalJobs = await Job.count();
    const jobs = await Job.findAll({
      offset: skip,
      limit: Number(limit),
    });

    const endTime = Date.now();
    const elapsedTime = endTime - startTime;
    console.log(`Elapsed time: ${elapsedTime}ms`);

    const responseData = {
      jobs,
      currentPage: Number(page),
      totalPages: Math.ceil(totalJobs / limit),
      totalJobs,
    };

    cache.set(cacheKey, responseData);

    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong", details: err });
  }
};
export const getJobsBySearch = async (req, res) => {
  const { experience, skills, location, salary, title } = req.body;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  const cacheKey = `jobs_search_page_${page}_limit_${limit}_experience_${experience}_skills_${skills}_location_${location}_salary_${salary}_title_${title}`;
  const startTime = Date.now();

  try {
    const cachedData = cache.get(cacheKey);
    if (cachedData) { 
      const endTime = Date.now();
      const elapsedTime = endTime - startTime;
      console.log(`Elapsed time: ${elapsedTime}ms`);
      console.log("Returning cached data");
      return res.json(cachedData);
    }

    const jobs = await Job.findAll({
      where: {
        ...(experience && { experience }),
        ...(skills && { skills: { [Op.contains]: [skills] } }),
        ...(location && { location }),
        ...(salary && { salary }),
        ...(title && { title: { [Op.iLike]: `%${title}%` } }),
      },
      offset: skip,
      limit: Number(limit),
    });

    const endTime = Date.now();
    const elapsedTime = endTime - startTime;
    console.log(`Elapsed time: ${elapsedTime}ms`);

    const responseData = {
      jobs,
      currentPage: Number(page),
      totalPages: Math.ceil(jobs.length / limit),
      totalJobs: jobs.length,
    };

    cache.set(cacheKey, responseData);
    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong", details: err });
  }
}


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
    // Find the existing job by ID
    const job = await Job.findOne({ where: { id: req.params.id } });

    // Check if the job exists
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Update the job by merging existing data with new values from req.body
    //only gets update the  firld which are provided
    const updatedJob = await job.update({
      ...job.toJSON(),  // Keep the current job data
      ...req.body       // Override with new values from req.body
    });

    // Return the updated job
    res.status(200).json(updatedJob);
  } catch (err) {
    console.error(err);  // Log the error for debugging
    res.status(500).json({ error: "An error occurred while updating the job." });
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
export const applyJob = async (req, res) => {
  try {
    const { jobId } = req.params;  // Get jobId from URL parameters
    const userId = req.body.userId;    // Assuming you have user info in req.user from auth middleware
    const io = req.app.get('io');
    // Check if job exists
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: "Job not found" 
      });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Check if user has already applied
    const existingApplication = await JobApplication.findOne({
      where: {
        jobId,
        userId
      }
    });

    if (existingApplication) {
      console.log("already applied");
      io.emit("notification", {
        message: "You have already applied for this job",
        type: "error"
      });
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job"
      });
    }
    io.emit("notification", {
      message: "You have successfully applied for this job",
      type: "success"
    });

    // Create new job application
    const jobApplication = await JobApplication.create({
      jobId,
      userId,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: "Job application created successfully",
      data: jobApplication  
    });

  } catch (error) {
    console.error('Error in applyJob:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export const getApplicationsByJobId = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applications = await JobApplication.findAll({
      where: { jobId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] },
        },
      ],
    });
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json(err);
  }
}
export const getApplicationsByUserId = async (req, res) => {
  try {
    const applications = await JobApplication.findAll({
      where: { userId: req.params.userId },
      include: [
        {
          model: Job,
          as: 'job',
          attributes: { exclude: ['description'] },
          include: [
            {
              model: User, // Assuming you have a Client model
              as: 'client',   // Adjust this to the correct alias used in your associations
              attributes: { exclude: ['password'] },
            },
          ],
        },
      ],
    });
    
    res.status(200).json(applications);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "An error occurred while fetching applications.", details: err });
  }

}
export const updateStatus = async (req, res) => {
  try {
    const { applicationId, status } = req.body;

    // Find the application by its ID
    const application = await JobApplication.findOne({ where: { id: applicationId } });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Update the application status
    application.status = status;
    await application.save();

    res.status(200).json({ message: "Application status updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err });
    console.log(err);
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const { applicationId } = req.query;
    console.log(applicationId);
    if (!applicationId) {
      return res.status(400).json({ message: "Application ID is required" });
    }
    console.log("came here 0");
    const jobApplication = await JobApplication.findByPk(applicationId);
    if (!jobApplication) {
      return res.status(404).json({ message: "Application not found" });
    }
    await jobApplication.destroy();
    res.status(200).json({ message: "Application deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err });
  }
};

export const getJobsByClientId = async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const jobs = await Job.findAll({ where: { clientId } });
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json(err);
  }
}   