const app = require('./app');
const ensureSuratWorkflowColumns = require('./bootstrap/ensureSuratWorkflowColumns');
require('./modules/letters/sub-modules/pdf/pdf.queue.js');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await ensureSuratWorkflowColumns();
  } catch (error) {
    console.warn('[server] Tidak dapat menyiapkan workflow pengajuan_surat (opsional):', error.message);
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 Backend running at http://localhost:${PORT}`);
  });
})();
