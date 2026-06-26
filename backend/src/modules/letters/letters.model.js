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
              lt.name  AS letter_type_name,
              lt.code  AS letter_type_code,
              lwo.name AS workflow_name,
              lwo.steps AS workflow_steps,
              lwo.code AS workflow_code,
              COALESCE(
                w.nama,
                (SELECT value FROM letter_field_values lfv2 JOIN letters l2 ON lfv2.letter_id=l2.id WHERE l2.uuid=l.uuid AND lfv2.field_key='_pemohon_nama' LIMIT 1)
              ) AS resident_name,
              COALESCE(
                w.NIK,
                (SELECT value FROM letter_field_values lfv3 JOIN letters l3 ON lfv3.letter_id=l3.id WHERE l3.uuid=l.uuid AND lfv3.field_key='_pemohon_nik' LIMIT 1)
              ) AS resident_nik
       FROM letters l
       JOIN letter_types lt            ON l.letter_type_id     = lt.id
       JOIN letter_workflow_options lwo ON l.workflow_option_id = lwo.id
       LEFT JOIN warga w               ON l.resident_id = w.id_warga AND l.resident_id IS NOT NULL
       WHERE l.uuid = ?`,
      [uuid]
    );
    return rows[0] || null;
  },

  async getDetailByUuid(uuid) {
    const [rows] = await db.query(
      `SELECT l.*,
              lt.name AS letter_type_name,
              lwo.code AS workflow_code,
              COALESCE(
                w.nama,
                (SELECT value FROM letter_field_values lfv JOIN letters lx ON lfv.letter_id=lx.id WHERE lx.uuid=l.uuid AND lfv.field_key='_pemohon_nama' LIMIT 1)
              ) AS resident_name,
              COALESCE(
                w.NIK,
                (SELECT value FROM letter_field_values lfv2 JOIN letters lx2 ON lfv2.letter_id=lx2.id WHERE lx2.uuid=l.uuid AND lfv2.field_key='_pemohon_nik' LIMIT 1)
              ) AS resident_nik,
              lwo.name AS workflow_name, lwo.steps AS workflow_steps
       FROM letters l
       JOIN letter_types lt ON l.letter_type_id = lt.id
       LEFT JOIN warga w ON l.resident_id = w.id_warga AND l.resident_id IS NOT NULL
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
              COALESCE(r.nama_ketua, rw.nama_ketua) AS approver_name,
              CASE WHEN r.rt_id IS NOT NULL THEN 'rt' ELSE 'rw' END AS approver_role
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

    // Attachments
    const [attachments] = await db.query(
      `SELECT original_name, file_url, mime_type, uploaded_at
       FROM letter_attachments
       WHERE letter_id = ?
       ORDER BY uploaded_at ASC`,
      [letter.id]
    );

    return {
      ...letter,
      field_values: fieldValues,
      approvals,
      pdf_versions: pdfVersions,
      attachments,
    };
  },

  async getInboxByRole(role, tenantId) {
    let whereClause;
    let params;

    if (role === 'rt' || role === 'admin_rt') {
      whereClause = `l.status IN ('submitted', 'in_review_rt') AND l.tenant_id = ?`;
      params = [tenantId];
    } else if (role === 'rw' || role === 'admin_rw') {
      whereClause = `l.status IN ('approved_rt', 'in_review_rw') AND l.tenant_id = ?`;
      params = [tenantId];
    } else {
      return [];
    }

    const [rows] = await db.query(
      `SELECT l.uuid, l.status, l.subject, l.purpose, l.created_at,
              lt.name  AS letter_type_name,
              COALESCE(
                w.nama,
                (SELECT value FROM letter_field_values lfv WHERE lfv.letter_id = l.id AND lfv.field_key = '_pemohon_nama' LIMIT 1)
              ) AS resident_name,
              COALESCE(
                w.NIK,
                (SELECT value FROM letter_field_values lfv2 WHERE lfv2.letter_id = l.id AND lfv2.field_key = '_pemohon_nik' LIMIT 1)
              ) AS resident_nik
       FROM letters l
       JOIN letter_types lt ON l.letter_type_id = lt.id
       LEFT JOIN warga w    ON l.resident_id = w.id_warga AND l.resident_id IS NOT NULL
       WHERE ${whereClause}
       ORDER BY l.created_at DESC`,
      params
    );
    return rows;
  },

  async getMyLetters(residentId) {
    const [rows] = await db.query(
      `SELECT l.*,
              lt.name  AS letter_type_name,
              lwo.name AS workflow_name
       FROM letters l
       JOIN letter_types lt            ON l.letter_type_id     = lt.id
       JOIN letter_workflow_options lwo ON l.workflow_option_id = lwo.id
       WHERE l.resident_id = ?
       ORDER BY l.created_at DESC`,
      [residentId]
    );
    return rows;
  },

  async getLetterById(id) {
    const [rows] = await db.query(
      `SELECT l.*,
              lt.name  AS letter_type_name,
              lt.code  AS letter_type_code,
              lwo.name AS workflow_name,
              lwo.steps AS workflow_steps,
              lwo.code AS workflow_code,
              COALESCE(
                w.nama,
                (SELECT value FROM letter_field_values lfv WHERE lfv.letter_id = l.id AND lfv.field_key = '_pemohon_nama' LIMIT 1)
              ) AS resident_name,
              COALESCE(
                w.NIK,
                (SELECT value FROM letter_field_values lfv2 WHERE lfv2.letter_id = l.id AND lfv2.field_key = '_pemohon_nik' LIMIT 1)
              ) AS resident_nik
       FROM letters l
       JOIN letter_types lt            ON l.letter_type_id     = lt.id
       JOIN letter_workflow_options lwo ON l.workflow_option_id = lwo.id
       LEFT JOIN warga w               ON l.resident_id = w.id_warga AND l.resident_id IS NOT NULL
       WHERE l.id = ?`,
      [id]
    );
    return rows[0] || null;
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

  async insertAttachment(letterId, attachment) {
    const { original_name, file_url, mime_type, file_size } = attachment;
    const [result] = await db.query(
      `INSERT INTO letter_attachments (letter_id, original_name, file_url, mime_type, file_size)
       VALUES (?, ?, ?, ?, ?)`,
      [letterId, original_name, file_url, mime_type, file_size]
    );
    return result.insertId;
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
