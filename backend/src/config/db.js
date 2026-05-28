const mysql = require('mysql2/promise');

/**
 * Connection pool MySQL.
 *
 * Konfigurasi:
 * - connectionLimit  : maks koneksi paralel (default 10)
 * - connectTimeout   : batas waktu koneksi awal (ms)
 * - waitForConnections: antri jika pool penuh (tidak langsung error)
 * - queueLimit       : maks antrian (0 = tidak terbatas)
 */
const db = mysql.createPool({
  host:             process.env.DB_HOST     || 'localhost',
  user:             process.env.DB_USER     || 'root',
  password:         process.env.DB_PASSWORD || '',
  database:         process.env.DB_NAME     || 'capstone',
  connectionLimit:  parseInt(process.env.DB_POOL_LIMIT, 10) || 10,
  connectTimeout:   parseInt(process.env.DB_CONNECT_TIMEOUT, 10) || 10000, // 10 detik
  waitForConnections: true,
  queueLimit:       0,
});

module.exports = db;