import User from './user.js';
import Job from './job.js';

// Define associations
User.hasMany(Job, { foreignKey: 'clientId', as: 'jobs' }); // A user can have many jobs
Job.belongsTo(User, { foreignKey: 'clientId', as: 'client' }); // A job belongs to a client
 