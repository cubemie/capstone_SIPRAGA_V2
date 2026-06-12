const fs = require('fs');
const content = fs.readFileSync('c:/muti/SMT 6/capstone_rtrw/capstone_RT-RW_CORETAX/kode-tambahan.nd', 'utf8');
const sqlBlocks = content.match(/```sql([\s\S]*?)```/g);
if (sqlBlocks) {
  const sql = sqlBlocks.map(b => b.replace(/```sql|```/g, '')).join('\n');
  fs.writeFileSync('c:/muti/SMT 6/capstone_rtrw/capstone_RT-RW_CORETAX/database/kode-tambahan.sql', sql);
}
