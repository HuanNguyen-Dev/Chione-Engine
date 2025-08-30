const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'pass',
  database: process.env.DB_NAME || 'usersdb',
  connectionLimit: 5,
});

// Init logic without messing with exports
(async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('Connection successful.');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      );
      CREATE TABLE IF NOT EXISTS simulations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        name VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS particle_coordinates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        simulation_id INT,
        system_coordinate_history_x JSON,
        system_coordinate_history_y JSON,
        system_coordinate_history_z JSON,
        FOREIGN KEY (simulation_id) REFERENCES simulations(id)
      );
    `);
  } catch (err) {
    console.error('DB init failed:', err.message);
  } finally {
    if (conn) {
      conn.release();
      console.log('Releasing connection...');
    }
  }
})();

module.exports = pool;