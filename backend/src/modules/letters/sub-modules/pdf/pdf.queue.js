const { Worker } = require('bullmq');
const { connection } = require('../../../../config/queue.js');
const PdfService = require('./pdf.service.js');
const pool = require('../../../../config/db.js');
const LettersModel = require('../../letters.model.js');

const worker = new Worker(
  'pdf-generation',
  async (job) => {
    const { letterId, type } = job.data;
    console.log(`[PDF Queue] Processing job ${job.id} — letterId: ${letterId}, type: ${type}`);

    try {
      const letter = await LettersModel.getLetterById(letterId);
      if (!letter) throw new Error('Letter not found');

      const pdfBuffer = await PdfService.createPdfForLetter(letter.uuid);

      // Simpan ke letter_pdf_versions
      await pool.query(
        `INSERT INTO letter_pdf_versions (letter_id, version, type, file_url, generated_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [letterId, 1, type || 'preview', `data:application/pdf;base64,${pdfBuffer.toString('base64')}`]
      );

      console.log(`[PDF Queue] Job ${job.id} selesai`);
    } catch (err) {
      console.error(`[PDF Queue] Job ${job.id} gagal:`, err.message);
      throw err;
    }
  },
  { connection }
);

worker.on('failed', (job, err) => {
  console.error(`[PDF Queue] Job ${job?.id} failed:`, err.message);
});

module.exports = worker;
