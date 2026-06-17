const pool = require('../config/db');

const RouteModel = {

  // Get all routes
  getAll: async () => {
    const [rows] = await pool.query('SELECT * FROM routes');
    return rows;
  },

  // Get one route by id
  getById: async (id) => {
    const [rows] = await pool.query(
      'SELECT * FROM routes WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  // Create a route
  create: async (name, description) => {
    const [result] = await pool.query(
      'INSERT INTO routes (name, description) VALUES (?, ?)',
      [name, description]
    );
    return result.insertId;
  },

  // Update a route
  update: async (id, name, description) => {
    const [result] = await pool.query(
      'UPDATE routes SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );
    return result.affectedRows;
  },

  // Delete a route
  delete: async (id) => {
    const [result] = await pool.query(
      'DELETE FROM routes WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

};

module.exports = RouteModel;