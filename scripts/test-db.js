// scripts/test-db.js
import sequelize from '../config/database.js';

async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection successful');
    
    // Test query
    await sequelize.query('SELECT NOW()');
    console.log('✓ Query execution successful');
    
    // Connection pool status
    const pool = sequelize.connectionManager.pool;
    console.log('Connection pool status:', {
      total: pool.size,
      idle: pool.idle,
      active: pool.length - pool.idle
    });
    
  } catch (error) {
    console.error('Database connection test failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

testDatabaseConnection()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));