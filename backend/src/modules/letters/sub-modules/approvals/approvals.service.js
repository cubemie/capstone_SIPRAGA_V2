const pool = require('../../../../config/db.js');
const { v4: uuidv4 } = require('uuid');
const NotificationService = require('../../../../services/NotificationService');

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
  RT_RW: {
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

async function getResidentContext(letterId) {
  const [[resident]] = await pool.query(
    `SELECT w.id_warga, w.nama, w.email, w.no_hp
     FROM letters l
     JOIN warga w ON l.resident_id = w.id_warga
     WHERE l.id = ?`,
    [letterId]
  );

  return resident || null;
}

async function getRwContext(tenantId) {
  const [[rw]] = await pool.query(
    `SELECT rw_id, no_rw, nama_ketua
     FROM rw
     WHERE rw_id = ?
     LIMIT 1`,
    [tenantId]
  );

  return rw || null;
}

async function notifySuperadmins(title, message, link, letterUuid = null) {
  const [superadmins] = await pool.query('SELECT id FROM superadmin');

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

const approveLetter = async (letterUuid, role, notes = null, signatureUrl = null, approverId) => {
  console.log('[ApprovalsService.approveLetter] Called with params:', { letterUuid, role, notes, signatureUrl, approverId });
  const [[letter]] = await pool.query(
    `SELECT l.*, lwo.code AS workflow_code, lt.code AS letter_type_code
     FROM letters l
     JOIN letter_workflow_options lwo ON l.workflow_option_id = lwo.id
     JOIN letter_types lt ON l.letter_type_id = lt.id
     WHERE l.uuid = ?`,
    [letterUuid]
  );

  console.log('[ApprovalsService.approveLetter] Found letter:', letter);
  if (!letter) throw new Error('Surat tidak ditemukan');

  const workflow = STATUS_TRANSITIONS[letter.workflow_code];
  console.log('[ApprovalsService.approveLetter] Workflow code:', letter.workflow_code, 'Workflow config:', workflow);
  if (!workflow) throw new Error(`Workflow tidak dikenal: ${letter.workflow_code}`);

  const normalizedRole = role === 'admin_rt' ? 'rt' : role === 'admin_rw' ? 'rw' : role;
  console.log('[ApprovalsService.approveLetter] Normalized role:', normalizedRole);

  const transition = workflow[normalizedRole];
  console.log('[ApprovalsService.approveLetter] Transition for role:', transition);
  if (!transition) {
    throw new Error(`Role "${normalizedRole}" tidak bisa approve di workflow "${letter.workflow_code}"`);
  }
  console.log('[ApprovalsService.approveLetter] Letter status:', letter.status, 'Allowed from states:', transition.from);
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

  const resident = await getResidentContext(letter.id);

  if (nextStatus === 'approved_rt') {
    const rw = await getRwContext(letter.tenant_id);

    if (rw) {
      await NotificationService.createInAppNotification({
        recipientId: rw.rw_id,
        recipientRole: 'rw',
        recipientMeta: { no_rw: rw.no_rw },
        type: 'NEW_LETTER',
        title: 'Surat baru menunggu persetujuan RW',
        message: `${resident?.nama || 'Seorang warga'} sudah lolos verifikasi RT untuk "${letter.subject}".`,
        link: `/rtrw/surat/${letterUuid}`,
        letterUuid,
      });
    } else {
      await notifySuperadmins(
        'Mapping RW surat belum ditemukan',
        `Surat "${letter.subject}" sudah disetujui RT tetapi akun RW tenant ${letter.tenant_id} belum ditemukan.`,
        '/superadmin/akun',
        letterUuid
      );
    }
  }

  if (isCompleted && resident) {
    await Promise.allSettled([
      NotificationService.createInAppNotification({
        recipientId: resident.id_warga,
        recipientRole: 'warga',
        type: 'APPROVED',
        title: 'Surat sudah disetujui',
        message: `Surat "${letter.subject}" sudah selesai diproses.`,
        link: `/warga/surat/${letterUuid}`,
        letterUuid,
      }),
      NotificationService.kirimNotifikasi({
        email: resident.email,
        no_hp: resident.no_hp || null,
        event: 'DISETUJUI',
        data: { nama: resident.nama, subjek: letter.subject },
      }),
    ]);
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

  const resident = await getResidentContext(letter.id);

  if (resident) {
    await Promise.allSettled([
      NotificationService.createInAppNotification({
        recipientId: resident.id_warga,
        recipientRole: 'warga',
        type: 'REJECTED',
        title: 'Surat ditolak',
        message: `Surat "${letter.subject}" ditolak${notes ? `: ${notes}` : '.'}`,
        link: `/warga/surat/${letterUuid}`,
        letterUuid,
      }),
      NotificationService.kirimNotifikasi({
        email: resident.email,
        no_hp: resident.no_hp || null,
        event: 'DITOLAK',
        data: { nama: resident.nama, subjek: letter.subject, alasan: notes },
      }),
    ]);
  }
};

module.exports = { approveLetter, rejectLetter };
