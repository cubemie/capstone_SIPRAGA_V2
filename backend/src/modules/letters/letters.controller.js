const LettersService = require('./letters.service');
const ApprovalsService = require('./sub-modules/approvals/approvals.service');
const pool = require('../../config/db');
const PdfService = require('./sub-modules/pdf/pdf.service');


class LettersController {
  
  static async getLetterTypes(req, res) {
    try {
      const types = await LettersService.getAvailableLetterTypes();
      res.json({ success: true, data: types });
    } catch (error) {
      console.error("Error getLetterTypes:", error);
      res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
    }
  }

  static async getTemplateFields(req, res) {
    try {
      const { typeId } = req.params;
      const fields = await LettersService.getTemplateFields(typeId);
      res.json({ success: true, data: fields });
    } catch (error) {
      console.error("Error getTemplateFields:", error);
      res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
    }
  }

  static async getWorkflowOptions(req, res) {
    try {
      const options = await LettersService.getWorkflowOptions();
      res.json({ success: true, data: options });
    } catch (error) {
      console.error("Error getWorkflowOptions:", error);
      res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
    }
  }

  static async createDraft(req, res) {
    try {
      // In a real app, tenant_id and resident_id comes from req.user (auth token)
      // For now, assuming they are sent in body or mocked
      const { letter_type_id, workflow_option_id, subject, purpose, fields } = req.body;
      
      const payload = {
        tenant_id: req.tenantId,
        resident_id: req.user.id_warga,
        letter_type_id,
        workflow_option_id,
        subject,
        purpose,
        fields
      };

      const uuid = await LettersService.createDraft(payload);
      res.status(201).json({ success: true, data: { uuid }, message: "Draft berhasil disimpan" });
    } catch (error) {
      console.error("Error createDraft:", error);
      res.status(500).json({ success: false, message: "Gagal menyimpan draft" });
    }
  }

  static async getInbox(req, res) {
    try {
      const { role } = req.user;
      const tenantId = req.tenantId;
      const LettersModel = require('./letters.model');
      const letters = await LettersModel.getInboxByRole(role, tenantId);
      return res.json({ success: true, message: 'Inbox berhasil diambil', data: letters });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Gagal mengambil inbox', error: err.message });
    }
  }

  static async getMyLetters(req, res) {
    try {
      const residentId = req.user.id_warga;
      const letters = await LettersService.getMyLetters(residentId);
      res.json({ success: true, data: letters });
    } catch (error) {
      console.error("Error getMyLetters:", error);
      res.status(500).json({ success: false, message: "Gagal memuat surat" });
    }
  }

  static async getLetterDetail(req, res) {
    try {
      const { uuid } = req.params;
      const detail = await LettersService.getLetterDetail(uuid);
      res.json({ success: true, data: detail });
    } catch (error) {
      console.error("Error getLetterDetail:", error);
      res.status(404).json({ success: false, message: error.message || "Surat tidak ditemukan" });
    }
  }

  static async submitLetter(req, res) {
    try {
      const { uuid } = req.params;
      await LettersService.submitLetter(uuid);
      res.json({ success: true, message: "Surat berhasil diajukan" });
    } catch (error) {
      console.error("Error submitLetter:", error);
      res.status(400).json({ success: false, message: error.message || "Gagal mengajukan surat" });
    }
  }

  static async getPreviewPdf(req, res) {
    try {
      const { uuid } = req.params;

      const [letters] = await pool.query('SELECT id FROM letters WHERE uuid = ?', [uuid]);
      if (!letters.length) {
        return res.status(404).json({ success: false, message: 'Surat tidak ditemukan' });
      }

      const letterId = letters[0].id;

      const [existing] = await pool.query(
        `SELECT file_url FROM letter_pdf_versions
         WHERE letter_id = ? AND type = 'preview'
         ORDER BY generated_at DESC LIMIT 1`,
        [letterId]
      );

      if (existing.length) {
        return res.json({
          success: true,
          message: 'PDF preview tersedia',
          data: { pdf_url: existing[0].file_url }
        });
      }

      const pdfBuffer = await PdfService.createPdfForLetter(uuid);

      await pool.query(
        `INSERT INTO letter_pdf_versions (letter_id, version, type, file_url, generated_at)
         VALUES (?, 1, 'preview', ?, NOW())`,
        [letterId, `data:application/pdf;base64,${pdfBuffer.toString('base64')}`]
      );

      return res.json({
        success: true,
        message: 'PDF preview berhasil digenerate',
        data: { pdf_url: `data:application/pdf;base64,${pdfBuffer.toString('base64')}` }
      });
    } catch (error) {
      console.error("Error getPreviewPdf:", error);
      res.status(500).json({ success: false, message: "Gagal generate PDF preview", error: error.message });
    }
  }

  static async approveLetter(req, res) {
    try {
      const { uuid } = req.params;
      const role = req.user?.role || 'admin_rt'; // Fallback for dev
      const result = await ApprovalsService.approveLetter(uuid, role);
      res.json({ success: true, data: result, message: "Surat berhasil disetujui" });
    } catch (error) {
      console.error("Error approveLetter:", error);
      res.status(400).json({ success: false, message: error.message || "Gagal menyetujui surat" });
    }
  }

  static async rejectLetter(req, res) {
    try {
      const { uuid } = req.params;
      const role = req.user?.role || 'admin_rt'; // Fallback for dev
      const { reason } = req.body;
      const result = await ApprovalsService.rejectLetter(uuid, role, reason);
      res.json({ success: true, data: result, message: "Surat berhasil ditolak" });
    } catch (error) {
      console.error("Error rejectLetter:", error);
      res.status(400).json({ success: false, message: error.message || "Gagal menolak surat" });
    }
  }
  static async verifyByQrToken(req, res) {
    try {
      const { qrToken } = req.params;

      const [rows] = await pool.query(
        `SELECT l.letter_number, l.status, l.completed_at,
                lt.name AS letter_type_name,
                w.nama AS resident_name
         FROM letters l
         JOIN letter_types lt ON l.letter_type_id = lt.id
         JOIN warga w ON l.resident_id = w.id_warga
         WHERE l.qr_token = ?`,
        [qrToken]
      );

      if (!rows.length) {
        return res.status(404).json({ valid: false, message: 'Surat tidak ditemukan' });
      }

      const letter = rows[0];
      return res.json({
        valid: true,
        letter_number: letter.letter_number,
        letter_type: letter.letter_type_name,
        resident_name: letter.resident_name,
        status: letter.status,
        completed_at: letter.completed_at,
      });
    } catch (err) {
      return res.status(500).json({ valid: false, message: 'Server error' });
    }
  }
}

module.exports = LettersController;
