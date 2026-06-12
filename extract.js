const fs = require('fs');
const content = fs.readFileSync('kode-tambahan.nd', 'utf-8');

const blocks = [];
const lines = content.split('\n');
let inBlock = false;
let currentFile = null;
let currentCode = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Start of a block
  if (line.startsWith('```js') || line.startsWith('```jsx')) {
    inBlock = true;
    currentCode = [];
    currentFile = null;
    continue;
  }
  // End of a block
  if (inBlock && line.startsWith('```')) {
    inBlock = false;
    if (currentFile) {
      blocks.push({ file: currentFile, code: currentCode.join('\n') });
    }
    continue;
  }
  
  if (inBlock) {
    if (!currentFile && line.startsWith('// backend/')) {
      currentFile = line.split(' ')[1];
    }
    if (!currentFile && line.startsWith('// frontend/')) {
      currentFile = line.split(' ')[1];
    }
    currentCode.push(line);
  }
}

for (const b of blocks) {
  const file = b.file.trim();
  const dir = file.substring(0, file.lastIndexOf('/'));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, b.code);
  console.log('Extracted:', file, '(', b.code.split('\n').length, 'lines)');
}
