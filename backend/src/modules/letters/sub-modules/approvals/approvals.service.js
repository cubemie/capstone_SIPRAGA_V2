const pool = require('../../../../config/db.js');
const { pdfQueue } = require('../../../../config/queue.js');

const STATUS_TRANSITIONS = {
  // RT_ONLY workflow
  RT_ONLY: {
    rt: { from: ['submitted', 'in_review_rt'], to: 'completed' },
  },
  // RT_THEN_RW workflow
  RT_THEN_RW: {
    rt: { from: ['submitted', 'in_review_rt'], to: 'approved_rt' },
    rw: { from: ['approved_rt', 'in_review_rw'], to: 'completed' },
  },
};

const approveLetter = async (letterId, role, notes = null, signatureUrl = null, approverId) => {
  // if letterId is uuid, we need to convert to ID first, or adjust query.
  // wait, the controller passed `uuid` to `ApprovalsService.approveLetter(uuid, role)`.
  const [[letter]] = await pool.query(
    `SELECT l.*, lwo.code AS workflow_code
     FROM letters l
     JOIN letter_workflow_options lwo ON l.workflow_option_id = lwo.id
     WHERE l.uuid = ?`,
    [letterId] // letterId is actually uuid here
  );

  if (!letter) throw new Error('Surat tidak ditemukan');

  const workflow = STATUS_TRANSITIONS[letter.workflow_code];
  if (!workflow) throw new Error('Workflow tidak dikenal');

  // Map role admin_rt/admin_rw to rt/rw if necessary
  const normalizedRole = role === 'admin_rt' ? 'rt' : role === 'admin_rw' ? 'rw' : role;
  
  const transition = workflow[normalizedRole];
  if (!transition) throw new Error(`Role ${normalizedRole} tidak bisa approve workflow ini`);
  if (!transition.from.includes(letter.status)) {
    throw new Error(`Status saat ini (${letter.status}) tidak bisa di-approve`);
  }

  const nextStatus = transition.to;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Insert approval history (using letter.id)
    await conn.query(
      `INSERT INTO letter_approvals (letter_id, approver_id, step, action, notes, signature_url, acted_at)
       VALUES (?, ?, ?, 'approved', ?, ?, NOW())`,
      [letter.id, approverId, letter.current_step, notes, signatureUrl]
    );

    // Update status surat
    const updateFields =
      nextStatus === 'completed'
        ? 'status = ?, completed_at = NOW(), current_step = current_step + 1'
        : 'status = ?, current_step = current_step + 1';

    await conn.query(`UPDATE letters SET ${updateFields} WHERE id = ?`, [
      nextStatus,
      letter.id,
    ]);

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  // Trigger PDF final jika selesai
  if (nextStatus === 'completed') {
    await pdfQueue.add('generate-pdf', { letterId: letter.id, type: 'final' });
  }

  return { nextStatus };
};

const rejectLetter = async (letterUuid, role, notes, approverId) => {
  const [[letter]] = await pool.query('SELECT * FROM letters WHERE uuid = ?', [letterUuid]);
  if (!letter) throw new Error('Surat tidak ditemukan');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO letter_approvals (letter_id, approver_id, step, action, notes, acted_at)
       VALUES (?, ?, ?, 'rejected', ?, NOW())`,
      [letter.id, approverId, letter.current_step, notes]
    );

    const normalizedRole = role === 'admin_rt' ? 'rt' : role === 'admin_rw' ? 'rw' : role;

    await conn.query(
      `UPDATE letters SET status = 'rejected' WHERE id = ?`,
      [letter.id]
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

module.exports = {
  approveLetter,
  rejectLetter,
};
