const mysql = require('mysql2/promise');
require('dotenv').config(); // Pastikan dotenv dipanggil

const db = mysql.createPool({
  // Paksa pakai variabel DB_... dari .env kamu
  host:     process.env.DB_HOST     || '127.0.0.1',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME     || 'capstone',
  port:     parseInt(process.env.DB_PORT, 10) || 3306,

  connectionLimit:    10,
  connectTimeout:     10000,
  waitForConnections: true,
  queueLimit:         0,
});

// Debugging: Munculkan log di terminal saat backend jalan
console.log("=== DB CONNECTION INFO ===");
console.log("Connecting to:", process.env.DB_HOST || '127.0.0.1');
console.log("User:", process.env.DB_USER || 'root');
console.log("Password yang dipakai:", process.env.DB_PASSWORD || 'root');
console.log("==========================");

module.exports = db;