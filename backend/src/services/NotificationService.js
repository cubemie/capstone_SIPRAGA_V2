/**
 * NotificationService
 *
 * Mengelola pengiriman notifikasi ke warga dan RT/RW:
 * - Email via Nodemailer (SMTP)
 * - WhatsApp via Fonnte API (opsional, jika token tersedia)
 *
 * Dirancang fault-tolerant: jika notif gagal dikirim, error hanya di-log
 * dan tidak mengganggu flow utama aplikasi.
 *
 * Konfigurasi env yang dibutuhkan:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS   — untuk email
 *   FONNTE_TOKEN                                   — untuk WhatsApp (opsional)
 */

const nodemailer = require('nodemailer');

// ─── Transporter Email ─────────────────────────────────────────────────────────

/**
 * Buat transporter Nodemailer dari environment variables.
 * Jika env tidak lengkap, gunakan Ethereal (fake SMTP untuk testing).
 */
async function getTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true untuk port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback: Ethereal fake SMTP (cocok untuk development)
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  console.log('[NotificationService] Menggunakan Ethereal test account:', testAccount.user);
  return transporter;
}

// ─── Template Pesan ───────────────────────────────────────────────────────────

const TEMPLATE_EMAIL = {
  DIAJUKAN: ({ nama, subjek }) => ({
    subject: `[CORETAX] Pengajuan Surat Diterima`,
    text: `Halo ${nama},\n\nPengajuan surat "${subjek}" Anda telah diterima dan sedang dalam proses verifikasi oleh RT/RW.\n\nTerima kasih,\nTim CORETAX`,
    html: `<p>Halo <strong>${nama}</strong>,</p><p>Pengajuan surat <strong>"${subjek}"</strong> Anda telah diterima dan sedang dalam proses verifikasi oleh RT/RW.</p><p>Terima kasih,<br/>Tim CORETAX</p>`,
  }),
  DISETUJUI: ({ nama, subjek }) => ({
    subject: `[CORETAX] Surat Anda Telah Disetujui`,
    text: `Halo ${nama},\n\nSurat "${subjek}" Anda telah disetujui oleh RT/RW. Silakan download surat Anda melalui aplikasi CORETAX.\n\nTerima kasih,\nTim CORETAX`,
    html: `<p>Halo <strong>${nama}</strong>,</p><p>Surat <strong>"${subjek}"</strong> Anda telah <span style="color:green;font-weight:bold;">disetujui</span> oleh RT/RW. Silakan download surat Anda melalui aplikasi CORETAX.</p><p>Terima kasih,<br/>Tim CORETAX</p>`,
  }),
  DITOLAK: ({ nama, subjek, alasan }) => ({
    subject: `[CORETAX] Surat Anda Ditolak`,
    text: `Halo ${nama},\n\nMohon maaf, surat "${subjek}" Anda ditolak oleh RT/RW.\n\nAlasan: ${alasan || 'Tidak disebutkan'}\n\nSilakan ajukan kembali dengan perbaikan yang diperlukan.\n\nTerima kasih,\nTim CORETAX`,
    html: `<p>Halo <strong>${nama}</strong>,</p><p>Mohon maaf, surat <strong>"${subjek}"</strong> Anda <span style="color:red;font-weight:bold;">ditolak</span> oleh RT/RW.</p><p><strong>Alasan:</strong> ${alasan || 'Tidak disebutkan'}</p><p>Silakan ajukan kembali dengan perbaikan yang diperlukan.</p><p>Terima kasih,<br/>Tim CORETAX</p>`,
  }),
  PENGAJUAN_BARU: ({ nama_rtrw, subjek, nama_warga }) => ({
    subject: `[CORETAX] Ada Pengajuan Surat Baru`,
    text: `Halo ${nama_rtrw},\n\nAda pengajuan surat baru dari warga.\n\nWarga: ${nama_warga}\nJenis Surat: ${subjek}\n\nSilakan login ke aplikasi CORETAX untuk memproses pengajuan ini.\n\nTerima kasih,\nTim CORETAX`,
    html: `<p>Halo <strong>${nama_rtrw}</strong>,</p><p>Ada pengajuan surat baru dari warga:</p><ul><li><strong>Warga:</strong> ${nama_warga}</li><li><strong>Jenis Surat:</strong> ${subjek}</li></ul><p>Silakan login ke aplikasi CORETAX untuk memproses pengajuan ini.</p><p>Terima kasih,<br/>Tim CORETAX</p>`,
  }),
};

const TEMPLATE_WA = {
  DIAJUKAN:     ({ nama, subjek }) => `Halo ${nama}, pengajuan surat "${subjek}" Anda telah diterima dan sedang diproses RT/RW. [CORETAX]`,
  DISETUJUI:    ({ nama, subjek }) => `Halo ${nama}, surat "${subjek}" Anda *DISETUJUI*! Silakan buka aplikasi CORETAX untuk download. [CORETAX]`,
  DITOLAK:      ({ nama, subjek, alasan }) => `Halo ${nama}, surat "${subjek}" Anda *DITOLAK*. Alasan: ${alasan || '-'}. Silakan ajukan ulang. [CORETAX]`,
  PENGAJUAN_BARU: ({ nama_rtrw, nama_warga, subjek }) => `Halo ${nama_rtrw}, ada pengajuan surat baru dari ${nama_warga} (${subjek}). Segera cek di CORETAX. [CORETAX]`,
};

// ─── Fungsi Publik ────────────────────────────────────────────────────────────

class NotificationService {
  /**
   * Kirim notifikasi email.
   * @param {Object} params
   * @param {string} params.email      — alamat email tujuan
   * @param {string} params.event      — 'DIAJUKAN' | 'DISETUJUI' | 'DITOLAK' | 'PENGAJUAN_BARU'
   * @param {Object} params.data       — data untuk template (nama, subjek, alasan, dll)
   */
  static async kirimEmail({ email, event, data }) {
    if (!email || !event || !TEMPLATE_EMAIL[event]) return;

    try {
      const transporter = await getTransporter();
      const template    = TEMPLATE_EMAIL[event](data);

      const info = await transporter.sendMail({
        from: `"CORETAX RT/RW" <${process.env.SMTP_USER || 'noreply@coretax.id'}>`,
        to: email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });

      console.log(`[NotificationService] Email terkirim ke ${email} (${event}):`, info.messageId);

      // Tampilkan preview URL untuk Ethereal (development only)
      if (nodemailer.getTestMessageUrl(info)) {
        console.log('[NotificationService] Preview URL:', nodemailer.getTestMessageUrl(info));
      }
    } catch (err) {
      // Jangan crash app jika notif gagal — hanya log
      console.error(`[NotificationService] Gagal kirim email ke ${email}:`, err.message);
    }
  }

  /**
   * Kirim notifikasi WhatsApp via Fonnte API.
   * @param {Object} params
   * @param {string} params.no_hp   — nomor HP tujuan (format: 08xx atau 628xx)
   * @param {string} params.event   — event key (DIAJUKAN, DISETUJUI, dll)
   * @param {Object} params.data    — data untuk template
   */
  static async kirimWA({ no_hp, event, data }) {
    if (!no_hp || !event || !TEMPLATE_WA[event]) return;
    if (!process.env.FONNTE_TOKEN) {
      console.log('[NotificationService] FONNTE_TOKEN tidak di-set, WA notification dilewati.');
      return;
    }

    try {
      const pesan = TEMPLATE_WA[event](data);
      const response = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': process.env.FONNTE_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target: no_hp, message: pesan }),
      });

      const result = await response.json();
      console.log(`[NotificationService] WA terkirim ke ${no_hp} (${event}):`, result);
    } catch (err) {
      // Jangan crash app jika WA gagal — hanya log
      console.error(`[NotificationService] Gagal kirim WA ke ${no_hp}:`, err.message);
    }
  }

  /**
   * Helper: kirim email + WA sekaligus berdasarkan event.
   * @param {Object} params
   * @param {string} params.email   — email warga/rtrw
   * @param {string} [params.no_hp] — nomor HP warga/rtrw (opsional)
   * @param {string} params.event   — event key
   * @param {Object} params.data    — data template
   */
  static async kirimNotifikasi({ email, no_hp, event, data }) {
    await Promise.allSettled([
      NotificationService.kirimEmail({ email, event, data }),
      no_hp ? NotificationService.kirimWA({ no_hp, event, data }) : Promise.resolve(),
    ]);
  }
}

module.exports = NotificationService;
