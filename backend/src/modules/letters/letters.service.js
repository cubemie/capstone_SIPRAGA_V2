const LettersModel = require('./letters.model');
const db = require('../../config/db');

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

      // 1. Insert into letters table (draft status)
      const [result] = await connection.query(
        `INSERT INTO letters 
          (tenant_id, resident_id, letter_type_id, workflow_option_id, subject, purpose, status, current_step) 
         VALUES (?, ?, ?, ?, ?, ?, 'draft', 1)`,
        [tenant_id, resident_id, letter_type_id, workflow_option_id, subject, purpose]
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
      const [uuidResult] = await connection.query(`SELECT uuid FROM letters WHERE id = ?`, [letterId]);
      return uuidResult[0].uuid;

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
    const letter = await LettersModel.getLetterByUuid(uuid);
    if (!letter) {
      throw new Error("Letter not found");
    }

    // Get dynamic field values
    const fields = await LettersModel.getFieldValues(letter.id);
    
    return {
      ...letter,
      fields
    };
  }

  /**
   * Submit a drafted letter to the first workflow step
   */
  static async submitLetter(uuid) {
    const letter = await LettersModel.getLetterByUuid(uuid);
    if (!letter) throw new Error("Letter not found");
    if (letter.status !== 'draft') throw new Error("Only draft letters can be submitted");

    // Get workflow step 1
    const steps = typeof letter.workflow_steps === 'string' ? JSON.parse(letter.workflow_steps) : letter.workflow_steps;
    const firstStep = steps.find(s => s.step === 1);
    
    if (!firstStep) throw new Error("Invalid workflow configuration");

    // Determine status based on first step role
    let newStatus = 'submitted';
    if (firstStep.role === 'admin_rt') {
      newStatus = 'in_review_rt';
    } else if (firstStep.role === 'admin_rw') {
      newStatus = 'in_review_rw';
    }

    const success = await LettersModel.updateLetterStatus(letter.id, newStatus, 1);
    return success;
  }
}

module.exports = LettersService;
