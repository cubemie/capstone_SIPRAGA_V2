const LettersService = require('./letters.service');
const LettersModel = require('./letters.model');
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
      console.log('--- createDraft triggered ---');
      console.log('req.user:', req.user);
      console.log('req.body:', req.body);
      
      const { letter_type_id, workflow_option_id, subject, purpose, fields } = req.body;
      
      // The token payload might have `id` instead of `id_warga` depending on the auth implementation
      const residentId = req.user?.id_warga || req.user?.id || req.user?.id_user;
      
      if (!residentId) {
        throw new Error('Resident ID tidak ditemukan di dalam token JWT');
      }

      const [wargaRows] = await pool.query('SELECT rt, rw FROM warga WHERE id_warga = ?', [residentId]);
      const warga = wargaRows[0];
      let tenantId = 'RW001';

      if (warga?.rw) {
        const rwVal = String(warga.rw).trim();
        const rwCandidate = rwVal.startsWith('RW') ? rwVal : `RW${rwVal.padStart(3, '0')}`;
        const [rwRows] = await pool.query(
          `SELECT rw_id FROM rw WHERE rw_id = ? OR no_rw = ? OR rw_id = ? LIMIT 1`,
          [rwVal, rwVal, rwCandidate]
        );
        tenantId = rwRows[0]?.rw_id || 'RW001';
      }

      const payload = {
        tenant_id: tenantId,
        resident_id: residentId,
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
      res.status(500).json({ success: false, message: "Gagal menyimpan draft", error: error.message });
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

      if (req.user?.role === 'warga') {
        const residentId = req.user?.id_warga;
        if (detail.resident_id !== residentId) {
          return res.status(403).json({ success: false, message: 'Akses ditolak' });
        }
      }

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

      // --- AUTO APPROVE LOGIC ---
      const userRole = req.user?.role;
      const approverId = req.user?.id; // For RT/RW, their id is the approverId

      if (userRole === 'admin_rt' || userRole === 'rt' || userRole === 'admin_rw' || userRole === 'rw') {
        const roleStr = (userRole === 'admin_rt' || userRole === 'rt') ? 'rt' : 'rw';
        
        const [[letter]] = await pool.query(
          `SELECT l.*, lwo.code AS workflow_code 
           FROM letters l
           JOIN letter_workflow_options lwo ON l.workflow_option_id = lwo.id
           WHERE l.uuid = ?`,
          [uuid]
        );

        if (letter) {
           let shouldAutoApprove = false;
           if (roleStr === 'rt' && ['RT_ONLY', 'RT_THEN_RW', 'RT_RW'].includes(letter.workflow_code)) {
               shouldAutoApprove = true;
           } else if (roleStr === 'rw' && ['RW_ONLY'].includes(letter.workflow_code)) {
               shouldAutoApprove = true;
           }

           if (shouldAutoApprove) {
               console.log(`[Auto-Approve] Triggering auto-approve for ${roleStr} on letter ${uuid}`);
               await ApprovalsService.approveLetter(uuid, roleStr, 'Disetujui otomatis oleh pembuat surat', null, approverId);
           }
        }
      }
      // --------------------------

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

  static async uploadPdfClient(req, res) {
    try {
      const { uuid } = req.params;
      const pdfBuffer = req.file?.buffer;
      const type = req.body.type || 'final'; // Dapatkan type dari form data
      
      if (!pdfBuffer) {
        return res.status(400).json({ success: false, message: 'File PDF tidak ditemukan' });
      }

      const [letters] = await pool.query('SELECT id FROM letters WHERE uuid = ?', [uuid]);
      if (!letters.length) {
        return res.status(400).json({ success: false, message: 'Surat tidak ditemukan' });
      }

      const letterId = letters[0].id;
      const fileUrl = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;

      // Hapus tipe yang sama jika sudah ada (opsional) atau insert saja (nanti order by generated_at desc ambil limit 1)
      await pool.query(
        `INSERT INTO letter_pdf_versions (letter_id, version, type, file_url, generated_at)
         VALUES (?, 1, ?, ?, NOW())`,
        [letterId, type, fileUrl]
      );

      res.json({ success: true, message: 'PDF berhasil diunggah' });
    } catch (error) {
      console.error('Error uploadPdfClient:', error);
      res.status(500).json({ success: false, message: 'Gagal mengunggah PDF', error: error.message });
    }
  }

  static async approveLetter(req, res) {
    try {
      const { uuid } = req.params;
      const { notes, signature_url } = req.body;
      const role = req.user?.role;
      const approverId = req.user?.id;

      if (!role || !approverId) {
        return res.status(401).json({ success: false, message: 'Data user tidak valid' });
      }

      const result = await ApprovalsService.approveLetter(uuid, role, notes, signature_url, approverId);
      res.json({ success: true, data: result, message: 'Surat berhasil disetujui' });
    } catch (error) {
      console.error('Error approveLetter:', error);
      res.status(400).json({ success: false, message: error.message || 'Gagal menyetujui surat' });
    }
  }

  static async rejectLetter(req, res) {
    try {
      const { uuid } = req.params;
      const { notes, reason } = req.body;
      const role = req.user?.role;
      const approverId = req.user?.id;

      if (!role || !approverId) {
        return res.status(401).json({ success: false, message: 'Data user tidak valid' });
      }

      await ApprovalsService.rejectLetter(uuid, role, notes || reason, approverId);
      res.json({ success: true, message: 'Surat berhasil ditolak' });
    } catch (error) {
      console.error('Error rejectLetter:', error);
      res.status(400).json({ success: false, message: error.message || 'Gagal menolak surat' });
    }
  }
  static async uploadAttachments(req, res) {
    try {
      const { uuid } = req.params;
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, message: "Tidak ada file yang diunggah" });
      }

      const letter = await LettersModel.getLetterByUuid(uuid);
      if (!letter) {
        return res.status(404).json({ success: false, message: "Surat tidak ditemukan" });
      }

      const supabase = require('../../config/supabase');
      const supabaseBucket = process.env.SUPABASE_BUCKET || 'sipraga-storage';

      const uploadPromises = files.map(async (file) => {
        const fileExt = file.originalname.split('.').pop();
        const fileName = `attachments/${uuid}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from(supabaseBucket)
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: true
          });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from(supabaseBucket)
          .getPublicUrl(fileName);

        await LettersModel.insertAttachment(letter.id, {
          original_name: file.originalname,
          file_url: publicUrlData.publicUrl,
          mime_type: file.mimetype || 'application/octet-stream',
          file_size: file.size || 0,
        });
        return publicUrlData.publicUrl;
      });

      const urls = await Promise.all(uploadPromises);

      res.json({
        success: true,
        message: "Lampiran berhasil diunggah",
        urls
      });
    } catch (error) {
      console.error("Error uploadAttachments:", error);
      res.status(500).json({ success: false, message: "Gagal mengunggah lampiran" });
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
