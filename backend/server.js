const app = require('./src/app');
const pool = require('./src/config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    connection.release();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    process.exit(1);
  }
}

startServer();