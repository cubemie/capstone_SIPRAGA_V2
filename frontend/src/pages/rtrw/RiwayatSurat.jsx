import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Calendar, FileText, CheckCircle2, XCircle } from 'lucide-react';

export default function RiwayatSurat() {
  const [searchTerm, setSearchTerm] = useState('');

  const history = [
    {
      id: 1,
      tanggal: '18 Mei 2026',
      warga: 'Rian Hidayat',
      subjek: 'Surat Pengantar Nikah (N1-N4)',
      status: 'approved_rw',
      statusText: 'Disetujui RW (Selesai)',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    {
      id: 2,
      tanggal: '10 Mei 2026',
      warga: 'Siti Rahma',
      subjek: 'Surat Keterangan Kematian',
      status: 'approved_rw',
      statusText: 'Disetujui RW (Selesai)',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    {
      id: 3,
      tanggal: '03 Mei 2026',
      warga: 'Joko Susilo',
      subjek: 'Surat Keterangan Tidak Mampu (SKTM)',
      status: 'rejected_rt',
      statusText: 'Ditolak RT',
      statusColor: 'bg-rose-100 text-rose-800 border-rose-200'
    }
  ];

  const filteredHistory = history.filter(item =>
    item.warga.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subjek.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-4">
          <Link to="/rtrw/dashboard" className="text-white hover:text-slate-200 transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">📮 Riwayat Pengarsipan Surat</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Arsip Surat Pengantar</h2>
            <p className="text-slate-500 text-xs">Menyimpan data seluruh surat pengantar warga yang telah diproses.</p>
          </div>

          {/* Search Box */}
          <div className="relative rounded-xl shadow-sm max-w-sm w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari warga atau nama surat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
            />
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-150">
                <tr>
                  <th className="px-6 py-4">Tanggal Proses</th>
                  <th className="px-6 py-4">Nama Warga</th>
                  <th className="px-6 py-4">Jenis Surat / Pengantar</th>
                  <th className="px-6 py-4">Status Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{item.tanggal}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">{item.warga}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.subjek}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${item.statusColor}`}>
                        {item.statusText}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                      Tidak ada riwayat surat yang cocok dengan pencarian Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
