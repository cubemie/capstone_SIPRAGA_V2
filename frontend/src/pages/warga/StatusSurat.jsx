import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, XCircle, Download, FileText, ExternalLink } from 'lucide-react';

export default function StatusSurat() {
  const letters = [
    {
      id: 1,
      tanggal: '20 Mei 2026',
      subjek: 'Surat Pengantar Domisili',
      keperluan: 'Pengurusan KTP Baru',
      status: 'pending_rt',
      statusText: 'Menunggu Verifikasi RT',
      statusColor: 'bg-amber-100 text-amber-800 border-amber-200',
      reason: null
    },
    {
      id: 2,
      tanggal: '10 April 2026',
      subjek: 'Surat Keterangan Usaha (SKU)',
      keperluan: 'Pengajuan Kredit Bank Mandiri',
      status: 'approved',
      statusText: 'Disetujui RW (Selesai)',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      reason: null,
      downloadUrl: '#'
    },
    {
      id: 3,
      tanggal: '05 Maret 2026',
      subjek: 'Surat Keterangan Tidak Mampu (SKTM)',
      keperluan: 'Beasiswa Kuliah Anak',
      status: 'rejected',
      statusText: 'Ditolak RT',
      statusColor: 'bg-rose-100 text-rose-800 border-rose-200',
      reason: 'Foto KK pendukung buram / tidak terbaca dengan jelas.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Header */}
      <header className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-4">
          <Link to="/warga/dashboard" className="text-white hover:text-slate-200 transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">📮 Status Pengajuan Surat Anda</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Daftar Pengajuan</h2>
            <p className="text-slate-500 text-xs">Lacak progres persetujuan surat pengantar RT dan RW Anda di sini.</p>
          </div>
          <Link to="/warga/ajukan" className="bg-blue-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-800 transition shadow">
            + Buat Pengajuan Baru
          </Link>
        </div>

        <div className="space-y-4">
          {letters.map((letter) => (
            <div key={letter.id} className="bg-white rounded-2xl border border-slate-250 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow transition duration-150">
              <div className="space-y-3 flex-1">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-semibold text-slate-400">{letter.tanggal}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${letter.statusColor}`}>
                    {letter.statusText}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{letter.subjek}</h3>
                  <p className="text-slate-500 text-sm mt-1">Keperluan: {letter.keperluan}</p>
                </div>
                {letter.reason && (
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-800">
                    <span className="font-bold block mb-1">Alasan Penolakan:</span>
                    {letter.reason}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0">
                {letter.status === 'approved' ? (
                  <a
                    href={letter.downloadUrl}
                    className="w-full md:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow"
                  >
                    <Download className="w-4 h-4" />
                    Unduh Surat (Signed)
                  </a>
                ) : letter.status === 'rejected' ? (
                  <Link
                    to="/warga/ajukan"
                    className="w-full md:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    Ajukan Ulang
                  </Link>
                ) : (
                  <button className="w-full md:w-auto px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" />
                    Sedang Diproses
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
