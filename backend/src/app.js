const express = require('express');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Bus For All API is running!' });
});

module.exports = app; // ← this line is the important one