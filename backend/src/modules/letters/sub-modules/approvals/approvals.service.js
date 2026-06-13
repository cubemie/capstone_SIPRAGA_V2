const pool = require('../../../../config/db.js');
const { v4: uuidv4 } = require('uuid');

let pdfQueue = null;
try {
  const queueModule = require('../../../../config/queue.js');
  pdfQueue = queueModule.pdfQueue;
} catch (e) {
  console.warn('[Approvals] BullMQ tidak aktif — PDF generation akan di-skip:', e.message);
}

const STATUS_TRANSITIONS = {
  RT_ONLY: {
    rt: { from: ['submitted', 'in_review_rt'], to: 'completed' },
  },
  RT_THEN_RW: {
    rt: { from: ['submitted', 'in_review_rt'], to: 'approved_rt' },
    rw: { from: ['approved_rt', 'in_review_rw'], to: 'completed' },
  },
};

async function generateLetterNumber(letterTypeCode, tenantId) {
  const [[{ count }]] = await pool.query(
    `SELECT COUNT(*) as count FROM letters 
     WHERE status = 'completed' 
     AND MONTH(completed_at) = MONTH(NOW()) 
     AND YEAR(completed_at) = YEAR(NOW())`
  );
  const seq = String(parseInt(count) + 1).padStart(3, '0');
  const monthRoman = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][new Date().getMonth()];
  const year = new Date().getFullYear();
  return `${seq}/${letterTypeCode || 'SK'}/${tenantId || 'RT'}/${monthRoman}/${year}`;
}

const approveLetter = async (letterUuid, role, notes = null, signatureUrl = null, approverId) => {
  const [[letter]] = await pool.query(
    `SELECT l.*, lwo.code AS workflow_code, lt.code AS letter_type_code
     FROM letters l
     JOIN letter_workflow_options lwo ON l.workflow_option_id = lwo.id
     JOIN letter_types lt ON l.letter_type_id = lt.id
     WHERE l.uuid = ?`,
    [letterUuid]
  );

  if (!letter) throw new Error('Surat tidak ditemukan');

  const workflow = STATUS_TRANSITIONS[letter.workflow_code];
  if (!workflow) throw new Error(`Workflow tidak dikenal: ${letter.workflow_code}`);

  const normalizedRole = role === 'admin_rt' ? 'rt' : role === 'admin_rw' ? 'rw' : role;

  const transition = workflow[normalizedRole];
  if (!transition) {
    throw new Error(`Role "${normalizedRole}" tidak bisa approve di workflow "${letter.workflow_code}"`);
  }
  if (!transition.from.includes(letter.status)) {
    throw new Error(
      `Status saat ini "${letter.status}" tidak bisa di-approve. Harus salah satu dari: ${transition.from.join(', ')}`
    );
  }

  const nextStatus = transition.to;
  const isCompleted = nextStatus === 'completed';

  let letterNumber = null;
  let qrToken = null;
  if (isCompleted) {
    letterNumber = await generateLetterNumber(letter.letter_type_code, letter.tenant_id);
    qrToken = uuidv4();
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO letter_approvals (letter_id, approver_id, step, action, notes, signature_url, acted_at)
       VALUES (?, ?, ?, 'approved', ?, ?, NOW())`,
      [letter.id, approverId, letter.current_step, notes, signatureUrl]
    );

    if (isCompleted) {
      await conn.query(
        `UPDATE letters 
         SET status = ?, current_step = current_step + 1,
             completed_at = NOW(), letter_number = ?, qr_token = ?
         WHERE id = ?`,
        [nextStatus, letterNumber, qrToken, letter.id]
      );
    } else {
      await conn.query(
        `UPDATE letters SET status = ?, current_step = current_step + 1 WHERE id = ?`,
        [nextStatus, letter.id]
      );
    }

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  if (isCompleted && pdfQueue) {
    pdfQueue.add('generate-pdf', { letterId: letter.id, type: 'final' }).catch(err => {
      console.error('[Approvals] Gagal enqueue PDF job:', err.message);
    });
  }

  return { nextStatus, letterNumber, qrToken };
};

const rejectLetter = async (letterUuid, role, notes, approverId) => {
  const [[letter]] = await pool.query('SELECT * FROM letters WHERE uuid = ?', [letterUuid]);
  if (!letter) throw new Error('Surat tidak ditemukan');

  const normalizedRole = role === 'admin_rt' ? 'rt' : role === 'admin_rw' ? 'rw' : role;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO letter_approvals (letter_id, approver_id, step, action, notes, acted_at)
       VALUES (?, ?, ?, 'rejected', ?, NOW())`,
      [letter.id, approverId, letter.current_step, notes]
    );

    await conn.query(
      `UPDATE letters SET status = 'rejected', rejected_by_role = ? WHERE id = ?`,
      [normalizedRole, letter.id]
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

module.exports = { approveLetter, rejectLetter };
