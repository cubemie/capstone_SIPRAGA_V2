const fs = require('fs');
let code = fs.readFileSync('frontend/src/features/letters/pages/LetterDetailPage.jsx', 'utf-8');
const nd = fs.readFileSync('kode-tambahan.nd', 'utf-8');

// Extract SignatureStatusCard from nd
const sigCardStart = nd.indexOf('function SignatureStatusCard');
const sigCardEnd = nd.indexOf('// Gunakan di dalam LetterDetailPage', sigCardStart);
const sigCardCode = nd.substring(sigCardStart, sigCardEnd).trim();

// Extract TtdApprovalPanel from nd
const ttdPanelStart = nd.indexOf('function TtdApprovalPanel');
const ttdPanelEnd = nd.indexOf('// Di dalam LetterDetailPage', ttdPanelStart);
const ttdPanelCode = nd.substring(ttdPanelStart, ttdPanelEnd).trim();

// Add them to the top of the file, before export default function LetterDetailPage
code = code.replace('export default function LetterDetailPage() {', sigCardCode + '\n\n' + ttdPanelCode + '\n\nexport default function LetterDetailPage() {');

// Replace the old Tindakan (Action) for RT/RW block
const actionBlockRegex = /\{\/\* Tindakan \(Action\) for RT\/RW \*\/\}[\s\S]*?(?=\{\/\* Download PDF Final \*\/\}|<\/div>\s*<\/div>\s*\);\s*\})/g;

// Also add useQuery for my-ttd inside LetterDetailPage
const myTtdQuery = `
  const { data: myTtd } = useQuery({
    queryKey: ['my-ttd'],
    queryFn: async () => {
      if (!['rt', 'rw'].includes(user?.role)) return null;
      const { data } = await api.get('/ttd/current-ttd');
      return data?.data?.ttd_digital || data?.data?.ttd_url || null;
    },
    enabled: ['rt', 'rw'].includes(user?.role),
  });
`;

code = code.replace('  const { data: letter, isLoading } = useQuery({', myTtdQuery + '\n  const { data: letter, isLoading } = useQuery({');

// Replace Action panel usage
code = code.replace(actionBlockRegex, '{/* Action RT/RW */}\n      <TtdApprovalPanel uuid={uuid} status={letter?.status} userTtdUrl={myTtd} />\n\n      ');

// Replace old Download Final PDF with SignatureStatusCard which includes it
const dlFinalPdfRegex = /\{\/\* Download PDF Final \*\/\}[\s\S]*?(?=<\/div>\s*\);\s*\})/g;
code = code.replace(dlFinalPdfRegex, '<SignatureStatusCard letter={letter} />\n    ');

// Add missing imports
if (!code.includes('import { Link }')) {
  code = code.replace('import { useState } from \'react\';', 'import { useState } from \'react\';\nimport { Link } from \'react-router-dom\';');
}

fs.writeFileSync('frontend/src/features/letters/pages/LetterDetailPage.jsx', code);
console.log('Patched LetterDetailPage');
