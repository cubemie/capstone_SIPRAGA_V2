let pdfQueue = null;
let connection = null;

try {
  const { Queue } = require('bullmq');
  const IORedis = require('ioredis');
  
  let redisConfig;
  if (process.env.REDIS_URL) {
    const u = new URL(process.env.REDIS_URL);
    redisConfig = {
      host: u.hostname,
      port: parseInt(u.port) || 6379,
      username: u.username || 'default',
      password: decodeURIComponent(u.password),
    };
  } else {
    redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      username: 'default',
      password: process.env.REDIS_PASSWORD,
    };
  }

  connection = new IORedis({
    ...redisConfig,
    maxRetriesPerRequest: null,
    lazyConnect: true,
    connectTimeout: 5000,
    retryStrategy: (times) => {
      if (times >= 3) {
        console.warn('[Redis] Gagal konek setelah 3 percobaan — queue dinonaktifkan');
        return null;
      }
      return Math.min(times * 500, 2000);
    },
  });

  connection.on('error', (err) => {
    console.warn('[Redis] Connection error (queue dinonaktifkan):', err.message);
  });

  connection.on('connect', () => {
    console.log('[Redis] Connected — PDF queue aktif');
  });

  pdfQueue = new Queue('pdf-generation', { connection });
  console.log('[Queue] BullMQ PDF queue initialized');
} catch (err) {
  console.warn('[Queue] BullMQ tidak bisa di-inisialisasi — PDF generation akan sync:', err.message);
}

module.exports = { pdfQueue, connection };
