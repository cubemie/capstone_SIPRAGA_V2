import { useEffect, useState } from 'react';
import { templateService } from '../../services';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { Link } from 'react-router-dom';

export default function SuperadminDashboard() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    templateService.getAll()
      .then(res => setTemplates(res.data ?? res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader 
        title="Dashboard Superadmin" 
        subtitle="Pusat pengelolaan sistem SIPRAGA V2." 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard icon="📄" label="Template Aktif" value={loading ? '...' : templates.length} colorClass="text-blue-600" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-800 mb-2">Manajemen Template</h3>
          <p className="text-sm text-gray-500 mb-4">Unggah, hapus, dan kelola template surat resmi (.docx/.pdf).</p>
          <Link to="/superadmin/template" className="inline-block px-4 py-2 bg-[#1A4A8A] text-white text-sm font-semibold rounded hover:bg-[#0F2D5C]">
            Kelola Template
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-800 mb-2">Akun RT/RW</h3>
          <p className="text-sm text-gray-500 mb-4">Tambahkan kredensial baru untuk ketua RT dan RW.</p>
          <button onClick={() => alert('Fitur segera hadir')} className="inline-block px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded border border-gray-300 hover:bg-gray-200">
            Tambah Akun (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}
