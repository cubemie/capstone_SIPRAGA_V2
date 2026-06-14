const mysql = require('mysql2/promise');
async function seed() {
  const c = await mysql.createConnection({host:'127.0.0.1', port:3307, user:'root', password:'root', database:'capstone'});
  await c.query(`INSERT IGNORE INTO letter_workflow_options (id, code, name, description, steps, sort_order) VALUES 
    (1, 'RT_ONLY', 'Kirim ke RT Saja', 'Pengajuan surat hanya akan dikirimkan ke Ketua RT untuk disetujui.', '["rt"]', 1),
    (2, 'RT_RW', 'Kirim ke RT lalu RW', 'Pengajuan surat akan dikirimkan ke Ketua RT, dan setelah disetujui akan diteruskan ke Ketua RW.', '["rt", "rw"]', 2)`);
  console.log('Seeded workflows via 3307 to docker DB!');
  c.end();
}
seed().catch(console.error);
