const LettersModel = require('./letters.model');
const db = require('../../config/db');
const { v4: uuidv4 } = require('uuid');

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
    return true;
  }
}

module.exports = LettersService;
