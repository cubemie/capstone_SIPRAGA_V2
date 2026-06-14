let pdfQueue = null;
let connection = null;

try {
  const { Queue } = require('bullmq');
  const IORedis = require('ioredis');

  connection = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
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
