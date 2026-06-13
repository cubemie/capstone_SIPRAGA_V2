const LettersModel = require('./letters.model');
const db = require('../../config/db');
const { v4: uuidv4 } = require('uuid');
const NotificationService = require('../../services/NotificationService');

async function getSubmissionRecipients(letter) {
  const [[resident]] = await db.query(
    `SELECT id_warga, nama, email, no_hp, rt, rw
     FROM warga
     WHERE id_warga = ?`,
    [letter.resident_id]
  );

  if (!resident) {
    return { resident: null, rtRecipient: null, rwRecipient: null };
  }

  const [[rwRecipient]] = await db.query(
    `SELECT rw_id, no_rw, nama_ketua
     FROM rw
     WHERE rw_id = ?
     LIMIT 1`,
    [letter.tenant_id]
  );

  const [[rtRecipient]] = await db.query(
    `SELECT rt_id, no_rt, nama_ketua
     FROM rt
     WHERE rw_id = ? AND no_rt = ?
     LIMIT 1`,
    [letter.tenant_id, String(resident.rt || '').trim()]
  );

  return { resident, rtRecipient, rwRecipient };
}

async function notifySuperadmins(title, message, link, letterUuid = null) {
  const [superadmins] = await db.query('SELECT id FROM superadmin');

  await Promise.allSettled(
    superadmins.map((admin) =>
      NotificationService.createInAppNotification({
        recipientId: admin.id,
        recipientRole: 'superadmin',
        type: 'REMINDER',
        title,
        message,
        link,
        letterUuid,
      })
    )
  );
}

class LettersService {
  /**
   * Get all available letter types
   */
  static async getAvailableLetterTypes() {
    return await LettersModel.getLetterTypes();
  }

  /**
   * Get dynamic fields for a specific letter type
   */
  static async getTemplateFields(letterTypeId) {
    return await LettersModel.getTemplateFields(letterTypeId);
  }

  /**
   * Get available workflow options
   */
  static async getWorkflowOptions() {
    return await LettersModel.getWorkflowOptions();
  }

  /**
   * Create a new letter draft
   */
  static async createDraft(payload) {
    const { tenant_id, resident_id, letter_type_id, workflow_option_id, subject, purpose, fields } = payload;
    
    // Start transaction
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Generate UUID di aplikasi — tidak bergantung DEFAULT (UUID()) MySQL
      const letterUuid = uuidv4();

      // 1. Insert into letters table (draft status)
      const [result] = await connection.query(
        `INSERT INTO letters 
          (uuid, tenant_id, resident_id, letter_type_id, workflow_option_id, subject, purpose, status, current_step) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', 1)`,
        [letterUuid, tenant_id, resident_id, letter_type_id, workflow_option_id, subject, purpose]
      );
      
      const letterId = result.insertId;

      // 2. Insert dynamic fields into letter_field_values
      if (fields && fields.length > 0) {
        const values = fields.map(f => [letterId, f.field_key, f.value]);
        await connection.query(
          `INSERT INTO letter_field_values (letter_id, field_key, value) VALUES ?`,
          [values]
        );
      }

      await connection.commit();
      
      // 3. Return the UUID of the created letter
      return letterUuid;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get my letters
   */
  static async getMyLetters(residentId) {
    return await LettersModel.getMyLetters(residentId);
  }

  /**
   * Get detail of a letter by its UUID
   */
  static async getLetterDetail(uuid) {
    const detail = await LettersModel.getDetailByUuid(uuid);
    if (!detail) {
      throw new Error("Letter not found");
    }
    return detail;
  }

  /**
   * Submit draft → status: submitted
   *
   * FIX: Tidak langsung set in_review_rt. Status 'submitted' berarti
   * surat sudah dikirim warga dan menunggu RT membukanya.
   * RT yang akan mengubah ke 'in_review_rt' saat membuka/memproses surat.
   *
   * Jika ingin otomatis masuk in_review_rt saat submit, uncomment
   * bagian newStatus di bawah.
   */
  static async submitLetter(uuid) {
    const letter = await LettersModel.getLetterByUuid(uuid);
    if (!letter) throw new Error('Surat tidak ditemukan');
    if (letter.status !== 'draft') throw new Error('Hanya surat berstatus draft yang bisa disubmit');

    // Langsung set 'submitted' — RT akan memprosesnya dari inbox
    const newStatus = 'submitted';

    const success = await LettersModel.updateLetterStatus(letter.id, newStatus, 1);
    if (!success) throw new Error('Gagal mengupdate status surat');

    const { resident, rtRecipient, rwRecipient } = await getSubmissionRecipients(letter);
    const letterLink = `/rtrw/surat/${uuid}`;

    if (resident) {
      await Promise.allSettled([
        NotificationService.createInAppNotification({
          recipientId: resident.id_warga,
          recipientRole: 'warga',
          type: 'NEW_LETTER',
          title: 'Pengajuan surat berhasil dikirim',
          message: `Surat "${letter.subject}" sudah masuk ke alur verifikasi.`,
          link: `/warga/surat/${uuid}`,
          letterUuid: uuid,
        }),
        NotificationService.kirimNotifikasi({
          email: resident.email,
          no_hp: resident.no_hp || null,
          event: 'DIAJUKAN',
          data: { nama: resident.nama, subjek: letter.subject },
        }),
      ]);
    }

    if (rtRecipient) {
      await NotificationService.createInAppNotification({
        recipientId: rtRecipient.rt_id,
        recipientRole: 'rt',
        type: 'NEW_LETTER',
        title: 'Surat baru menunggu verifikasi RT',
        message: `${resident?.nama || 'Seorang warga'} mengajukan "${letter.subject}".`,
        link: letterLink,
        letterUuid: uuid,
      });
    } else if (rwRecipient) {
      await NotificationService.createInAppNotification({
        recipientId: rwRecipient.rw_id,
        recipientRole: 'rw',
        recipientMeta: { no_rw: rwRecipient.no_rw },
        type: 'REMINDER',
        title: 'Surat baru belum punya RT tujuan',
        message: `Surat "${letter.subject}" dari ${resident?.nama || 'warga'} perlu dicek karena akun RT terkait belum ditemukan.`,
        link: letterLink,
        letterUuid: uuid,
      });
      await notifySuperadmins(
        'Mapping RT warga belum lengkap',
        `Surat "${letter.subject}" dari ${resident?.nama || 'warga'} tidak menemukan akun RT yang sesuai.`,
        '/superadmin/akun',
        uuid
      );
    }

    return true;
  }
}

module.exports = LettersService;
