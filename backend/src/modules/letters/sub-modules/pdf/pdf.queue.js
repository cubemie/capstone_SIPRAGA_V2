const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const PdfService = require('./pdf.service');
const AttachmentsService = require('../attachments/attachments.service');
const LettersModel = require('../../letters.model');

// Connect to Redis
const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
});

// Create the Queue
const pdfQueue = new Queue('pdf-generation', { connection: redisConnection });

// Worker: processes the jobs in the background
const pdfWorker = new Worker('pdf-generation', async (job) => {
  const { letterUuid } = job.data;
  console.log(`[Worker] Started generating PDF for letter: ${letterUuid}`);

  try {
    // 1. Generate PDF buffer
    const pdfBuffer = await PdfService.createPdfForLetter(letterUuid);
    
    // 2. Upload to Supabase
    const fileUrl = await AttachmentsService.uploadPdf(pdfBuffer, letterUuid);
    
    // 3. Save fileUrl to database (we might need a new column or table for this, 
    //    but for now let's say we update a hypothetical 'document_url' column 
    //    or simply return it so the workflow can handle it)
    console.log(`[Worker] Successfully generated and uploaded PDF: ${fileUrl}`);
    
    // Note: The letter status is already 'completed' or 'approved_rw', 
    // We just need to attach this PDF.
    return fileUrl;
    
  } catch (error) {
    console.error(`[Worker] Failed generating PDF for ${letterUuid}:`, error);
    throw error;
  }
}, { connection: redisConnection });

pdfWorker.on('completed', (job, returnvalue) => {
  console.log(`Job ${job.id} completed with result ${returnvalue}`);
});

pdfWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error ${err.message}`);
});

module.exports = {
  pdfQueue
};
