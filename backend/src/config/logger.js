/**
 * logger.js — Konfigurasi Winston Logger
 *
 * Digunakan di seluruh aplikasi untuk structured logging.
 * - development: colorized console output
 * - production: JSON ke console + error ke file error.log
 */

const winston = require('winston');

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const isProduction = process.env.NODE_ENV === 'production';

// ─── Format dev (mudah dibaca di terminal) ────────────────────────────────────
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

// ─── Format production (JSON, cocok untuk log aggregator) ────────────────────
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

// ─── Transports ───────────────────────────────────────────────────────────────
const transports = [
  new winston.transports.Console({
    format: isProduction ? prodFormat : devFormat,
  }),
];

// Di production, tambahkan file transport untuk error
if (isProduction) {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5 MB
      maxFiles: 5,
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProduction ? 'warn' : 'debug'),
  transports,
  // Jangan crash process saat ada uncaught exception di logger itu sendiri
  exitOnError: false,
});

module.exports = logger;
