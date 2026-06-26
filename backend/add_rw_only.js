const pool = require('./src/config/db');
async function run() {
  try {
    const [rows] = await pool.query("SELECT id FROM letter_workflow_options WHERE code = 'RW_ONLY'");
    if(rows.length === 0) {
      await pool.query("INSERT INTO letter_workflow_options (code, name, description, steps, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)", ['RW_ONLY', 'Kirim ke RW Saja', 'Pengajuan surat hanya akan dikirimkan ke Ketua RW untuk disetujui.', '["rw"]', 3, 1]);
      console.log("Inserted RW_ONLY");
    } else {
      console.log("RW_ONLY already exists");
    }
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
