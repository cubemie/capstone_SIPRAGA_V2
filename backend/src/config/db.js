/**
 * db.js — MySQL Connection Pool
 *
 * Mendukung dua mode konfigurasi:
 * - Development (lokal): gunakan DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
 * - Production (Railway): gunakan MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE, MYSQLPORT
 *   yang di-inject otomatis oleh Railway MySQL plugin.
 *
 * SSL diaktifkan otomatis jika koneksi ke host eksternal (bukan localhost).
 */

const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host:     process.env.MYSQLHOST     || process.env.DB_HOST     || 'localhost',
  user:     process.env.MYSQLUSER     || process.env.DB_USER     || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME     || 'capstone',
  port:     parseInt(process.env.MYSQLPORT, 10) || 3306,

  connectionLimit:    parseInt(process.env.DB_POOL_LIMIT, 10) || 10,
  connectTimeout:     parseInt(process.env.DB_CONNECT_TIMEOUT, 10) || 10000,
  waitForConnections: true,
  queueLimit:         0,

  // Aktifkan SSL untuk koneksi Railway (host eksternal)
  ssl: (process.env.MYSQLHOST && process.env.MYSQLHOST !== 'localhost')
    ? { rejectUnauthorized: false }
    : undefined,
});

module.exports = db;