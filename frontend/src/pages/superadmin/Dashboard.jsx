import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Map, FileCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTemplate } from '../../hooks/useTemplate';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';

const fetchStats = async () => {
  const res = await api.get('/superadmin/stats');
  return res.data.data;
};

export default function SuperAdminDashboard() {
  const { data: templates, loading: loadingTemplates } = useTemplate();
  
  const { data: stats } = useQuery({
    queryKey: ['superadmin-stats'],
    queryFn: fetchStats,
  });


  return (
    <div className="p-6 space-y-6">
      {/* Admin Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold mb-2">Pusat Pengelolaan Template Surat &amp; Pengguna</h3>
          <p className="text-slate-400 text-sm max-w-xl">
            Kelola berkas acuan (template) surat keterangan pengantar desa dan atur kewenangan pengguna Ketua RT/RW di seluruh wilayah kelurahan.
          </p>
        </div>
        <Link to="/superadmin/template" className="bg-white text-slate-950 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-100 transition shadow self-start md:self-auto">
          Kelola Template
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Warga', value: stats?.total_warga ?? '—', color: 'bg-blue-50 text-blue-700' },
          { label: 'Jumlah RT', value: stats?.total_rt ?? '—', color: 'bg-green-50 text-green-700' },
          { label: 'Jumlah RW', value: stats?.total_rw ?? '—', color: 'bg-purple-50 text-purple-700' },
          {
            label: 'Surat V2',
            value: stats?.surat_v2?.reduce((a, b) => a + Number(b.total), 0) ?? '—',
            color: 'bg-orange-50 text-orange-700',
          },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-lg p-4 ${color}`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm mt-1 opacity-70">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Template Surat</span>
            <p className="text-xl font-bold text-slate-800">
              {loadingTemplates ? '—' : `${templates.length} Aktif`}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Admin Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h4 className="font-bold text-slate-800 mb-4">Pengaturan Cepat</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition cursor-pointer">
            <h5 className="font-bold text-sm text-slate-900 mb-1">Manajemen Akun RT/RW</h5>
            <p className="text-slate-500 text-xs">Tambah, hapus, atau atur sandi kredensial akun Ketua RT dan Ketua RW.</p>
          </div>
          <div className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition cursor-pointer">
            <h5 className="font-bold text-sm text-slate-900 mb-1">Konfigurasi Instansi</h5>
            <p className="text-slate-500 text-xs">Atur nama desa, kecamatan, kabupaten, serta logo resmi kop surat.</p>
          </div>
          <div className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition cursor-pointer">
            <h5 className="font-bold text-sm text-slate-900 mb-1">Log Sistem</h5>
            <p className="text-slate-500 text-xs">Pantau seluruh audit trail tindakan dan log aktivitas server.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
