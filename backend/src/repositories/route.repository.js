const pool = require('../config/db');

// Get all routes
const getAllRoutes = async () => {
  const [rows] = await pool.query('SELECT * FROM routes');
  return rows;
};

// Get one route by id
const getRouteById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM routes WHERE id = ?', 
    [id]
  );
  return rows[0];
};

// Create a route
const createRoute = async (name, description) => {
  const [result] = await pool.query(
    'INSERT INTO routes (name, description) VALUES (?, ?)',
    [name, description]
  );
  return result.insertId;
};

// Update a route
const updateRoute = async (id, name, description) => {
  const [result] = await pool.query(
    'UPDATE routes SET name = ?, description = ? WHERE id = ?',
    [name, description, id]
  );
  return result.affectedRows;
};

// Delete a route
const deleteRoute = async (id) => {
  const [result] = await pool.query(
    'DELETE FROM routes WHERE id = ?',
    [id]
  );
  return result.affectedRows;
};

module.exports = {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute
};