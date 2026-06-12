// backend/src/controllers/superAdminController.js
// Semua handler superadmin di satu file

const pool    = require('../config/db');
const bcrypt  = require('bcryptjs');
const marked  = require('marked');
// puppeteer di-require secara lazy di dalam fungsi previewMarkdownTemplate
// untuk menghindari crash startup akibat dependency yargs yang tidak kompatibel Node v25

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────

const getDashboardStats = async (req, res) => {
  try {
    const [[{ total_warga }]] = await pool.query('SELECT COUNT(*) AS total_warga FROM warga');
    const [[{ total_rt }]]    = await pool.query('SELECT COUNT(*) AS total_rt FROM rt');
    const [[{ total_rw }]]    = await pool.query('SELECT COUNT(*) AS total_rw FROM rw');
    const [[{ total_surat }]] = await pool.query('SELECT COUNT(*) AS total_surat FROM letters');
    const [[{ completed }]]   = await pool.query(
      "SELECT COUNT(*) AS completed FROM letters WHERE status = 'completed'"
    );

    // Daftar RW dengan jumlah warga dan RT di dalamnya
    const [rwList] = await pool.query(
      `SELECT rw.rw_id, rw.no_rw, rw.nama_ketua, rw.kelurahan_desa, rw.is_active,
              COUNT(DISTINCT rt.rt_id)     AS jumlah_rt,
              COUNT(DISTINCT w.id_warga)   AS jumlah_warga
       FROM rw
       LEFT JOIN rt ON rt.rw_id = rw.rw_id
       LEFT JOIN warga w ON w.rw = rw.no_rw
       GROUP BY rw.rw_id
       ORDER BY rw.no_rw`
    );

    res.json({
      success: true,
      data: {
        total_warga, total_rt, total_rw, total_surat,
        surat_selesai: completed,
        rw_list: rwList,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── STATISTIK WARGA PER RW ───────────────────────────────────────────────────

const getWargaStats = async (req, res) => {
  try {
    const { rw_id } = req.params;

    // Ambil data RW
    const [[rw]] = await pool.query('SELECT * FROM rw WHERE rw_id = ?', [rw_id]);
    if (!rw) return res.status(404).json({ success: false, message: 'RW tidak ditemukan' });

    // Statistik umum
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM warga WHERE rw = ?', [rw.no_rw]
    );

    // Distribusi pekerjaan
    const [pekerjaan] = await pool.query(
      `SELECT pekerjaan, COUNT(*) AS jumlah
       FROM warga WHERE rw = ?
       GROUP BY pekerjaan ORDER BY jumlah DESC`,
      [rw.no_rw]
    );

    // Distribusi pendidikan — inferensi dari pekerjaan: 'Sarjana', 'S2', dll
    // (karena tidak ada field pendidikan di schema, kita agregasi dari pekerjaan)
    const sarjana = pekerjaan.filter(p =>
      p.pekerjaan?.toLowerCase().includes('sarjana') ||
      p.pekerjaan?.toLowerCase().includes('mahasis')
    ).reduce((a, b) => a + Number(b.jumlah), 0);

    // Distribusi status perkawinan
    const [statusNikah] = await pool.query(
      `SELECT status_perkawinan, COUNT(*) AS jumlah
       FROM warga WHERE rw = ?
       GROUP BY status_perkawinan`,
      [rw.no_rw]
    );

    // Distribusi jenis kelamin
    const [jenisKelamin] = await pool.query(
      `SELECT jenis_kelamin, COUNT(*) AS jumlah
       FROM warga WHERE rw = ?
       GROUP BY jenis_kelamin`,
      [rw.no_rw]
    );

    // Daftar RT di RW ini
    const [rtList] = await pool.query(
      `SELECT rt.rt_id, rt.no_rt, rt.nama_ketua, rt.is_active,
              COUNT(w.id_warga) AS jumlah_warga
       FROM rt
       LEFT JOIN warga w ON w.rt = rt.no_rt AND w.rw = ?
       WHERE rt.rw_id = ?
       GROUP BY rt.rt_id`,
      [rw.no_rw, rw_id]
    );

    // Kepala keluarga (estimasi: jumlah warga kawin / 2)
    const kawin = statusNikah.find(s => s.status_perkawinan === 'Kawin')?.jumlah ?? 0;

    res.json({
      success: true,
      data: {
        rw,
        total_warga: total,
        kepala_keluarga_est: Math.round(kawin / 2),
        pekerjaan_distribution: pekerjaan,
        status_nikah_distribution: statusNikah,
        jenis_kelamin_distribution: jenisKelamin,
        rt_list: rtList,
        sarjana_est: sarjana,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── MANAJEMEN AKUN RT/RW ─────────────────────────────────────────────────────

const listRT = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT rt.*, rw.no_rw, rw.kelurahan_desa,
              COUNT(l.id) AS total_surat_diproses
       FROM rt
       LEFT JOIN rw ON rt.rw_id = rw.rw_id
       LEFT JOIN letters l ON l.tenant_id = rw.rw_id
       GROUP BY rt.rt_id
       ORDER BY rt.rw_id, rt.no_rt`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const listRW = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT rw.*, COUNT(DISTINCT rt.rt_id) AS jumlah_rt
       FROM rw
       LEFT JOIN rt ON rt.rw_id = rw.rw_id
       GROUP BY rw.rw_id
       ORDER BY rw.no_rw`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { role, id } = req.params;
    const table = role === 'rt' ? 'rt' : role === 'rw' ? 'rw' : null;
    const pkCol  = role === 'rt' ? 'rt_id' : 'rw_id';
    if (!table) return res.status(400).json({ success: false, message: 'Role tidak valid' });

    await pool.query(`DELETE FROM ${table} WHERE ${pkCol} = ?`, [id]);

    // Catat di audit log
    await pool.query(
      `INSERT INTO system_logs (actor_id, actor_role, action, target_type, target_id, detail)
       VALUES (?, 'superadmin', 'DELETE_USER', ?, ?, ?)`,
      [req.user.id, role, id, JSON.stringify({ deleted_id: id, role })]
    );

    res.json({ success: true, message: `Akun ${role.toUpperCase()} berhasil dihapus` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { role, id } = req.params;
    const { new_password } = req.body;
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter' });
    }

    const table = role === 'rt' ? 'rt' : role === 'rw' ? 'rw' : null;
    const pkCol  = role === 'rt' ? 'rt_id' : 'rw_id';
    if (!table) return res.status(400).json({ success: false, message: 'Role tidak valid' });

    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query(`UPDATE ${table} SET password = ? WHERE ${pkCol} = ?`, [hashed, id]);

    await pool.query(
      `INSERT INTO system_logs (actor_id, actor_role, action, target_type, target_id)
       VALUES (?, 'superadmin', 'RESET_PASSWORD', ?, ?)`,
      [req.user.id, role, id]
    );

    res.json({ success: true, message: 'Password berhasil direset' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const toggleActive = async (req, res) => {
  try {
    const { role, id } = req.params;
    const table = role === 'rt' ? 'rt' : 'rw';
    const pkCol  = role === 'rt' ? 'rt_id' : 'rw_id';

    await pool.query(
      `UPDATE ${table} SET is_active = NOT is_active WHERE ${pkCol} = ?`, [id]
    );
    res.json({ success: true, message: 'Status akun berhasil diubah' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── KONFIGURASI INSTANSI ─────────────────────────────────────────────────────

const getConfig = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT config_key, config_value, label FROM instance_config');
    const config = {};
    rows.forEach(r => { config[r.config_key] = { value: r.config_value, label: r.label }; });
    res.json({ success: true, data: config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateConfig = async (req, res) => {
  try {
    const updates = req.body; // { config_key: new_value, ... }
    const entries = Object.entries(updates);

    for (const [key, value] of entries) {
      await pool.query(
        'UPDATE instance_config SET config_value = ?, updated_by = ? WHERE config_key = ?',
        [value, req.user.id, key]
      );
    }

    await pool.query(
      `INSERT INTO system_logs (actor_id, actor_role, action, target_type, detail)
       VALUES (?, 'superadmin', 'UPDATE_CONFIG', 'config', ?)`,
      [req.user.id, JSON.stringify(updates)]
    );

    res.json({ success: true, message: 'Konfigurasi berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── LOG SISTEM ───────────────────────────────────────────────────────────────

const getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, role } = req.query;
    const offset = (page - 1) * limit;

    let where = '1=1';
    const params = [];
    if (action) { where += ' AND action = ?'; params.push(action); }
    if (role)   { where += ' AND actor_role = ?'; params.push(role); }

    const [logs] = await pool.query(
      `SELECT * FROM system_logs WHERE ${where}
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM system_logs WHERE ${where}`, params
    );

    res.json({ success: true, data: { logs, total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── TEMPLATE SURAT MARKDOWN ──────────────────────────────────────────────────

const listMarkdownTemplates = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT lmt.*, lt.name AS letter_type_name
       FROM letter_markdown_templates lmt
       JOIN letter_types lt ON lmt.letter_type_id = lt.id
       ORDER BY lt.name`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createMarkdownTemplate = async (req, res) => {
  try {
    const { letter_type_id, name, markdown_content } = req.body;
    if (!markdown_content) return res.status(400).json({ success: false, message: 'Konten template wajib diisi' });

    // Compile Markdown → HTML
    const html_compiled = marked.parse(markdown_content);

    const [result] = await pool.query(
      `INSERT INTO letter_markdown_templates
         (letter_type_id, name, markdown_content, html_compiled, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [letter_type_id, name, markdown_content, html_compiled, req.user.id]
    );

    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateMarkdownTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, markdown_content, is_active } = req.body;

    const html_compiled = markdown_content ? marked.parse(markdown_content) : undefined;

    await pool.query(
      `UPDATE letter_markdown_templates SET
         name = COALESCE(?, name),
         markdown_content = COALESCE(?, markdown_content),
         html_compiled = COALESCE(?, html_compiled),
         is_active = COALESCE(?, is_active),
         version = version + 1
       WHERE id = ?`,
      [name, markdown_content, html_compiled, is_active, id]
    );

    res.json({ success: true, message: 'Template berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteMarkdownTemplate = async (req, res) => {
  try {
    await pool.query('DELETE FROM letter_markdown_templates WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Preview: render Markdown + data dummy → PDF buffer → kirim sebagai file
const previewMarkdownTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const [[template]] = await pool.query(
      'SELECT * FROM letter_markdown_templates WHERE id = ?', [id]
    );
    if (!template) return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });

    // Ambil konfigurasi instansi untuk kop surat
    const [configRows] = await pool.query('SELECT config_key, config_value FROM instance_config');
    const config = {};
    configRows.forEach(r => { config[r.config_key] = r.config_value; });

    // Data dummy untuk preview
    const dummyData = {
      nama_warga:    'NAMA WARGA (CONTOH)',
      nik:           '3374XXXXXXXXXXXXXXX',
      alamat:        'Jl. Contoh No. 1, RT 001/RW 001',
      keperluan:     'Keperluan surat (contoh)',
      tanggal:       new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      nomor_surat:   '001/RT-001/VII/2026',
      nama_desa:     config.nama_desa || 'NAMA DESA',
      kecamatan:     config.kecamatan || 'KECAMATAN',
      kabupaten:     config.kabupaten_kota || 'KABUPATEN/KOTA',
      provinsi:      config.provinsi || 'PROVINSI',
      kepala_desa:   config.kepala_desa || 'NAMA KEPALA DESA',
      nip_kepala:    config.nip_kepala_desa || '-',
      ...config,
    };

    // Render Markdown dengan replace variabel {{key}} → value
    let renderedMd = template.markdown_content;
    Object.entries(dummyData).forEach(([k, v]) => {
      renderedMd = renderedMd.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v || '');
    });

    // Markdown → HTML
    const htmlContent = marked.parse(renderedMd);

    // Bungkus dalam template HTML yang layak untuk PDF
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.6;
            margin: 0;
            padding: 2cm;
            color: #000;
          }
          h1, h2, h3 { text-align: center; }
          table { width: 100%; border-collapse: collapse; }
          td, th { border: 1px solid #000; padding: 6px 8px; }
          .watermark {
            position: fixed; bottom: 1cm; right: 1cm;
            opacity: 0.15; font-size: 8pt; color: #999;
          }
          hr { border: 1px solid #000; margin: 16px 0; }
          p { margin: 4px 0; }
        </style>
      </head>
      <body>
        ${htmlContent}
        <div class="watermark">PREVIEW — BUKAN SURAT RESMI</div>
      </body>
      </html>
    `;

    // Generate PDF dengan Puppeteer (lazy-require)
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page    = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', margin: { top: '2cm', bottom: '2cm', left: '2.5cm', right: '2cm' } });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="preview-template-${id}.pdf"`,
    });
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDashboardStats, getWargaStats,
  listRT, listRW, deleteUser, resetPassword, toggleActive,
  getConfig, updateConfig,
  getLogs,
  listMarkdownTemplates, createMarkdownTemplate, updateMarkdownTemplate,
  deleteMarkdownTemplate, previewMarkdownTemplate,
};