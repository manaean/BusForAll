const app = require('./src/app');
const { sequelize } = require('./src/models');
const TrackingService = require('./src/services/tracking.service');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connected via Sequelize');

    // Sync models (creates tables if they don't exist; won't overwrite existing ones)
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Database synced');

    // Bus tracking simulation — updates progress every 5 seconds
    setInterval(async () => {
      try { await TrackingService.tickAll(); } catch (e) { /* silent */ }
    }, 5000);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Startup failed:', error.message);
    process.exit(1);
  }
}

startServer();
