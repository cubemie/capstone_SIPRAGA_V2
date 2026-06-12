const db = require('../../config/db');

const LettersModel = {
  // --------------------------------------------------------------------------
  // MASTER DATA
  // --------------------------------------------------------------------------

  async getLetterTypes() {
    const [rows] = await db.query(
      `SELECT * FROM letter_types WHERE is_active = TRUE ORDER BY sort_order ASC`
    );
    return rows;
  },

  async getLetterTypeById(id) {
    const [rows] = await db.query(`SELECT * FROM letter_types WHERE id = ?`, [id]);
    return rows[0];
  },

  async getTemplateFields(letterTypeId) {
    const [rows] = await db.query(
      `SELECT * FROM letter_template_fields 
       WHERE letter_type_id = ? 
       ORDER BY sort_order ASC`,
      [letterTypeId]
    );
    return rows;
  },

  async getWorkflowOptions() {
    const [rows] = await db.query(
      `SELECT * FROM letter_workflow_options WHERE is_active = TRUE ORDER BY sort_order ASC`
    );
    return rows;
  },

  // --------------------------------------------------------------------------
  // LETTER DRAFTS & SUBMISSION
  // --------------------------------------------------------------------------

  async createLetterDraft(letterData) {
    const { tenant_id, resident_id, letter_type_id, workflow_option_id, subject, purpose } = letterData;
    const [result] = await db.query(
      `INSERT INTO letters 
        (tenant_id, resident_id, letter_type_id, workflow_option_id, subject, purpose, status, current_step) 
       VALUES (?, ?, ?, ?, ?, ?, 'draft', 1)`,
      [tenant_id, resident_id, letter_type_id, workflow_option_id, subject, purpose]
    );
    return result.insertId;
  },

  async getLetterByUuid(uuid) {
    const [rows] = await db.query(
      `SELECT l.*, 
              t.name as letter_type_name, 
              w.name as workflow_name, w.steps as workflow_steps,
              r.nama as resident_name, r.nik as resident_nik
       FROM letters l
       JOIN letter_types t ON l.letter_type_id = t.id
       JOIN letter_workflow_options w ON l.workflow_option_id = w.id
       JOIN warga r ON l.resident_id = r.id_warga
       WHERE l.uuid = ?`,
      [uuid]
    );
    return rows[0];
  },

  async getDetailByUuid(uuid) {
    const [rows] = await db.query(
      `SELECT l.*,
              lt.name AS letter_type_name,
              w.nama AS resident_name, w.NIK AS resident_nik,
              lwo.name AS workflow_name, lwo.steps AS workflow_steps
       FROM letters l
       JOIN letter_types lt ON l.letter_type_id = lt.id
       JOIN warga w ON l.resident_id = w.id_warga
       JOIN letter_workflow_options lwo ON l.workflow_option_id = lwo.id
       WHERE l.uuid = ?`,
      [uuid]
    );
    if (!rows.length) return null;

    const letter = rows[0];

    // Field values
    const [fieldValues] = await db.query(
      'SELECT field_key, value FROM letter_field_values WHERE letter_id = ?',
      [letter.id]
    );

    // Approval history
    const [approvals] = await db.query(
      `SELECT la.*, 
              COALESCE(r.nama_ketua, rw.nama_ketua) AS approver_name
       FROM letter_approvals la
       LEFT JOIN rt r ON la.approver_id = r.rt_id
       LEFT JOIN rw rw ON la.approver_id = rw.rw_id
       WHERE la.letter_id = ?
       ORDER BY la.acted_at ASC`,
      [letter.id]
    );

    // PDF versions
    const [pdfVersions] = await db.query(
      `SELECT type, file_url, generated_at
       FROM letter_pdf_versions
       WHERE letter_id = ?
       ORDER BY generated_at DESC`,
      [letter.id]
    );

    return {
      ...letter,
      field_values: fieldValues,
      approvals,
      pdf_versions: pdfVersions,
    };
  },

  async getInboxByRole(role, tenantId) {
    let statusFilter;
    if (role === 'rt') {
      statusFilter = `l.status IN ('submitted', 'in_review_rt') AND l.tenant_id = ?`;
    } else if (role === 'rw') {
      statusFilter = `l.status IN ('approved_rt', 'in_review_rw')`;
    } else {
      return [];
    }

    const params = role === 'rt' ? [tenantId] : [];
    const [rows] = await db.query(
      `SELECT l.uuid, l.status, l.created_at, l.subject,
              lt.name AS letter_type_name,
              w.nama AS resident_name
       FROM letters l
       JOIN letter_types lt ON l.letter_type_id = lt.id
       JOIN warga w ON l.resident_id = w.id_warga
       WHERE ${statusFilter}
       ORDER BY l.created_at DESC`,
      params
    );
    return rows;
  },

  async getMyLetters(residentId) {
    const [rows] = await db.query(
      `SELECT l.*, 
              t.name as letter_type_name, 
              w.name as workflow_name
       FROM letters l
       JOIN letter_types t ON l.letter_type_id = t.id
       JOIN letter_workflow_options w ON l.workflow_option_id = w.id
       WHERE l.resident_id = ?
       ORDER BY l.created_at DESC`,
      [residentId]
    );
    return rows;
  },

  async getLetterById(id) {
    const [rows] = await db.query(
      `SELECT l.*, 
              t.name as letter_type_name, 
              w.name as workflow_name, w.steps as workflow_steps,
              r.nama as resident_name, r.nik as resident_nik
       FROM letters l
       JOIN letter_types t ON l.letter_type_id = t.id
       JOIN letter_workflow_options w ON l.workflow_option_id = w.id
       JOIN warga r ON l.resident_id = r.id_warga
       WHERE l.id = ?`,
      [id]
    );
    return rows[0];
  },

  async updateLetterStatus(id, status, current_step = 1, letter_number = null, qr_token = null) {
    const query = `
      UPDATE letters 
      SET status = ?, current_step = ?
          ${status === 'submitted' ? ', submitted_at = CURRENT_TIMESTAMP' : ''}
          ${status === 'completed' ? ', completed_at = CURRENT_TIMESTAMP' : ''}
          ${letter_number ? ', letter_number = ?' : ''}
          ${qr_token ? ', qr_token = ?' : ''}
      WHERE id = ?
    `;
    
    const params = [status, current_step];
    if (letter_number) params.push(letter_number);
    if (qr_token) params.push(qr_token);
    params.push(id);

    const [result] = await db.query(query, params);
    return result.affectedRows > 0;
  },

  // --------------------------------------------------------------------------
  // FIELD VALUES
  // --------------------------------------------------------------------------

  async saveFieldValues(letterId, fields) {
    // Delete existing fields for this letter (if updating)
    await db.query(`DELETE FROM letter_field_values WHERE letter_id = ?`, [letterId]);
    
    if (!fields || fields.length === 0) return;

    const values = fields.map(f => [letterId, f.field_key, f.value]);
    await db.query(
      `INSERT INTO letter_field_values (letter_id, field_key, value) VALUES ?`,
      [values]
    );
  },

  async getFieldValues(letterId) {
    const [rows] = await db.query(
      `SELECT field_key, value FROM letter_field_values WHERE letter_id = ?`,
      [letterId]
    );
    // Convert to object: { key: value }
    const fieldMap = {};
    rows.forEach(row => {
      fieldMap[row.field_key] = row.value;
    });
    return fieldMap;
  },

  // --------------------------------------------------------------------------
  // PDF TEMPLATES
  // --------------------------------------------------------------------------
  
  async getPdfTemplate(letterTypeId, tenantId) {
    // Try to get tenant-specific template first, fallback to global (tenant_id IS NULL)
    const [rows] = await db.query(
      `SELECT * FROM letter_pdf_templates 
       WHERE letter_type_id = ? AND (tenant_id = ? OR tenant_id IS NULL)
       ORDER BY tenant_id DESC LIMIT 1`,
      [letterTypeId, tenantId]
    );
    return rows[0];
  }

};

module.exports = LettersModel;
