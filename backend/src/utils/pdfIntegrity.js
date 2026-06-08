/**
 * pdfIntegrity.js — Utilitas Integritas Dokumen PDF
 *
 * Menyediakan fungsi untuk:
 * 1. Menghitung hash SHA-256 dari buffer PDF
 * 2. Menyisipkan hash ke dalam metadata PDF (Subject field)
 * 3. Memverifikasi integritas PDF berdasarkan hash yang tersimpan
 *
 * Ini adalah short-term fix sesuai audit plan.
 * Mid-term: integrasi PeruriSign atau Privy untuk TTD tersertifikasi UU ITE.
 */

const { PDFDocument } = require('pdf-lib');
const crypto = require('crypto');

/**
 * Hitung hash SHA-256 dari buffer.
 * @param {Buffer} buffer
 * @returns {string} hex string
 */
function calculateHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Sisipkan hash integritas ke dalam metadata PDF.
 * Hash disimpan di field Subject dengan format: "coretax-hash:<sha256hex>"
 * Ini memungkinkan verifikasi ulang tanpa database tambahan.
 *
 * @param {Buffer} pdfBuffer — buffer PDF asli (sebelum ditandai)
 * @returns {Promise<Buffer>} buffer PDF baru dengan metadata hash
 */
async function tambahHashIntegritas(pdfBuffer) {
  const hash = calculateHash(pdfBuffer);

  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

  // Sisipkan metadata
  pdfDoc.setSubject(`coretax-hash:${hash}`);
  pdfDoc.setCreationDate(new Date());
  pdfDoc.setModificationDate(new Date());
  pdfDoc.setProducer('CORETAX RT/RW System');

  const modifiedBuffer = await pdfDoc.save();
  return { buffer: Buffer.from(modifiedBuffer), hash };
}

/**
 * Verifikasi integritas PDF berdasarkan hash di metadata.
 * Bandingkan hash di metadata dengan hash aktual konten.
 *
 * CATATAN: Verifikasi ini bekerja hanya jika PDF TIDAK dimodifikasi
 * setelah embed hash. Jika dimodifikasi (termasuk oleh fungsi ini),
 * hash akan berbeda — ini adalah perilaku yang diharapkan.
 *
 * @param {Buffer} pdfBuffer — buffer PDF yang ingin diverifikasi
 * @returns {Promise<{ valid: boolean, storedHash: string|null, actualHash: string }>}
 */
async function verifikasiIntegritas(pdfBuffer) {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const subject = pdfDoc.getSubject();

    if (!subject || !subject.startsWith('coretax-hash:')) {
      return {
        valid: false,
        storedHash: null,
        actualHash: calculateHash(pdfBuffer),
        message: 'PDF tidak memiliki hash integritas CORETAX.',
      };
    }

    const storedHash  = subject.replace('coretax-hash:', '');
    const actualHash  = calculateHash(pdfBuffer);

    return {
      valid: storedHash === actualHash,
      storedHash,
      actualHash,
      message: storedHash === actualHash ? 'Dokumen valid dan tidak dimodifikasi.' : 'PERINGATAN: Hash tidak cocok — dokumen mungkin telah dimodifikasi.',
    };
  } catch (err) {
    return {
      valid: false,
      storedHash: null,
      actualHash: calculateHash(pdfBuffer),
      message: `Gagal memverifikasi PDF: ${err.message}`,
    };
  }
}

module.exports = { tambahHashIntegritas, verifikasiIntegritas, calculateHash };
