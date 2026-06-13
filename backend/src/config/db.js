// backend/src/config/db.js
// GANTI SELURUH ISI FILE INI

const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
  host:     process.env.DB_HOST     || '127.0.0.1',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'capstone',
  port:     parseInt(process.env.DB_PORT, 10) || 3306,

  connectionLimit:    10,
  connectTimeout:     10000,
  waitForConnections: true,
  queueLimit:         0,
});

// Log koneksi hanya di development, tanpa expose password
if (process.env.NODE_ENV !== 'production') {
  console.log(`[DB] Connecting to ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || 'capstone'}`);
}

module.exports = db;