const LettersService = require('./letters.service');
const ApprovalsService = require('./sub-modules/approvals/approvals.service');

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
        tenant_id: req.user?.tenant_id || 1, // Fallback for dev
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
}

module.exports = LettersController;
