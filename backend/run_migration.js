require('dotenv').config();
process.env.DB_HOST = '127.0.0.1';
const db = require('./src/config/db.js');

const query = `
CREATE TABLE IF NOT EXISTS letter_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  letter_id INT NOT NULL,
  file_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (letter_id) REFERENCES letters(id) ON DELETE CASCADE
);
`;

db.query(query)
  .then(() => {
    console.log('Table letter_attachments created!');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
