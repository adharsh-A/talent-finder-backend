// associations.js
import User from './user.js';
import Job from './job.js';
import JobApplication from './job-application.js';

// Define associations
User.hasMany(Job, { 
  foreignKey: 'clientId', 
  as: 'jobs',
  onDelete: 'CASCADE'
});

Job.belongsTo(User, { 
  foreignKey: 'clientId', 
  as: 'client'
});

User.hasMany(JobApplication, {
  foreignKey: 'userId',
  as: 'applications',
  onDelete: 'CASCADE'
});

Job.hasMany(JobApplication, {
  foreignKey: 'jobId',
  as: 'applications',
  onDelete: 'CASCADE'
});

JobApplication.belongsTo(Job, { 
  foreignKey: 'jobId', as: 'job'
});

JobApplication.belongsTo(User, { 
  foreignKey: 'userId',
  as: 'user'
});