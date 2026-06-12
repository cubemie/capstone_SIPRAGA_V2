const pool = require('../../../config/db');

class PublicController {
  static async verifyLetter(req, res) {
    try {
      const { uuid } = req.params;

      const [letters] = await pool.query(
        `SELECT l.uuid, l.status, l.created_at, l.subject,
                w.nama AS resident_name, w.NIK AS resident_nik,
                lt.name AS letter_type_name
         FROM letters l
         JOIN warga w ON l.resident_id = w.id_warga
         JOIN letter_types lt ON l.letter_type_id = lt.id
         WHERE l.uuid = ? AND l.status = 'completed'`,
        [uuid]
      );

      if (!letters.length) {
        return res.status(404).json({ success: false, message: 'Surat tidak valid atau belum selesai.' });
      }

      const letter = letters[0];
      return res.json({ success: true, data: letter, message: 'Surat valid' });
    } catch (err) {
      console.error('Error verifyLetter:', err);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  }
}

module.exports = PublicController;
