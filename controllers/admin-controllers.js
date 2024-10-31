import Job from "../models/job.js";
import User from "../models/user.js"; 
import JobApplication from "../models/job-application.js";
import { Op } from "sequelize";
import { Sequelize } from "sequelize";

// Admin controller functions
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      include: [
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    await job.destroy();
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    const applications = await JobApplication.findAll({
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Job,
          include: [{
            model: User,
            as: 'employer',
            attributes: ['id', 'name', 'email']
          }]
        }
      ]
    });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getApplicationStats = async (req, res) => {
  try {
    const totalApplications = await JobApplication.count();
    const pendingApplications = await JobApplication.count({
      where: { status: 'pending' }
    });
    const acceptedApplications = await JobApplication.count({
      where: { status: 'accepted' }
    });
    const rejectedApplications = await JobApplication.count({
      where: { status: 'rejected' }
    });

    res.status(200).json({
      total: totalApplications,
      pending: pendingApplications,
      accepted: acceptedApplications,
      rejected: rejectedApplications
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const employerCount = await User.count({
      where: { role: 'employer' }
    });
    const jobSeekerCount = await User.count({
      where: { role: 'jobseeker' }
    });

    res.status(200).json({
      total: totalUsers,
      employers: employerCount,
      jobSeekers: jobSeekerCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobStats = async (req, res) => {
  try {
    const totalJobs = await Job.count();
    const activeJobs = await Job.count({
      where: { status: 'active' }
    });
    const closedJobs = await Job.count({
      where: { status: 'closed' }
    });
    
    const jobsByCategory = await Job.findAll({
      attributes: ['category', [Sequelize.fn('COUNT', '*'), 'count']],
      group: ['category']
    });

    res.status(200).json({
      total: totalJobs,
      active: activeJobs,
      closed: closedJobs,
      byCategory: jobsByCategory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.update({ role: req.body.role });
    res.status(200).json({ message: "User role updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSystemMetrics = async (req, res) => {
  try {
    const lastWeek = new Date(new Date() - 7 * 24 * 60 * 60 * 1000);
    
    const newUsers = await User.count({
      where: {
        createdAt: {
          [Op.gte]: lastWeek
        }
      }
    });
    
    const newJobs = await Job.count({
      where: {
        createdAt: {
          [Op.gte]: lastWeek
        }
      }
    });
    
    const newApplications = await JobApplication.count({
      where: {
        createdAt: {
          [Op.gte]: lastWeek
        }
      }
    });

    res.status(200).json({
      newUsersLastWeek: newUsers,
      newJobsLastWeek: newJobs,
      newApplicationsLastWeek: newApplications
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
