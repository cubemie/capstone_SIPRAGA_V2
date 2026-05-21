import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckSquare, History, Users, Award, LogOut, Bell, Clock, CheckCircle2, UserCheck, XCircle } from 'lucide-react';

export default function RtRwDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 flex items-center space-x-2 border-b border-slate-800">
          <span className="text-2xl">📮</span>
          <span className="text-lg font-bold">RT-RW CORETAX</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/rtrw/dashboard" className="flex items-center space-x-3 px-4 py-2.5 bg-slate-800 rounded-xl font-medium">
            <CheckSquare className="w-5 h-5" />
            <span>Verifikasi Surat</span>
          </Link>
          <Link to="/rtrw/ajukan" className="flex items-center space-x-3 px-4 py-2.5 hover:bg-slate-800 rounded-xl font-medium transition">
            <FileText className="w-5 h-5" />
            <span>Buat Surat Pengantar</span>
          </Link>
          <Link to="/rtrw/ttd" className="flex items-center space-x-3 px-4 py-2.5 hover:bg-slate-800 rounded-xl font-medium transition">
            <Award className="w-5 h-5" />
            <span>Tanda Tangan Digital</span>
          </Link>
          <Link to="/rtrw/riwayat" className="flex items-center space-x-3 px-4 py-2.5 hover:bg-slate-800 rounded-xl font-medium transition">
            <History className="w-5 h-5" />
            <span>Riwayat Surat</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Link to="/" className="flex items-center space-x-3 px-4 py-2.5 hover:bg-red-800 hover:text-white rounded-xl font-medium transition text-slate-400">
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <div>
            <span className="text-slate-500 font-medium text-sm">Dashboard Pelayanan,</span>
            <h2 className="text-lg font-bold text-slate-800">Bapak Heru Pratama (Ketua RT 001/002)</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 relative bg-slate-100 rounded-full">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">
              HP
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Butuh Verifikasi</span>
                <p className="text-xl font-bold text-slate-800">3</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Menunggu RW</span>
                <p className="text-xl font-bold text-slate-800">2</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Telah Disetujui</span>
                <p className="text-xl font-bold text-slate-800">18</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Ditolak</span>
                <p className="text-xl font-bold text-slate-800">1</p>
              </div>
            </div>
          </div>

          {/* Verification Requests List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h4 className="font-bold text-slate-800">Daftar Surat Masuk (Butuh Persetujuan)</h4>
              <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">
                Ada 3 surat pending
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {/* Row 1 */}
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">Danella Nur Aisyah</span>
                    <span className="text-xs text-slate-400">• NIK: 3201xxxxxxxxxxxx</span>
                  </div>
                  <p className="text-slate-800 font-medium text-sm">Surat Pengantar Domisili (Pengurusan KTP Baru)</p>
                  <span className="text-xs text-slate-400 block">Diajukan pada: 20 Mei 2026</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow">
                    Setujui
                  </button>
                  <button className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition">
                    Tolak
                  </button>
                  <a href="#" className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition">
                    Lihat KTP
                  </a>
                </div>
              </div>

              {/* Row 2 */}
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">Ahmad Fauzi</span>
                    <span className="text-xs text-slate-400">• NIK: 3202xxxxxxxxxxxx</span>
                  </div>
                  <p className="text-slate-800 font-medium text-sm">Surat Keterangan Usaha (SKU) (Pengajuan Kredit Usaha Rakyat)</p>
                  <span className="text-xs text-slate-400 block">Diajukan pada: 19 Mei 2026</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow">
                    Setujui
                  </button>
                  <button className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition">
                    Tolak
                  </button>
                  <a href="#" className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition">
                    Lihat Dokumen
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
