import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Send, HelpCircle, User, Bell, LogOut, CheckCircle2, Clock, XCircle } from 'lucide-react';

export default function WargaDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 flex items-center space-x-2 border-b border-blue-800">
          <span className="text-2xl">📮</span>
          <span className="text-lg font-bold">RT-RW CORETAX</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/warga/dashboard" className="flex items-center space-x-3 px-4 py-2.5 bg-blue-800 rounded-xl font-medium">
            <User className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link to="/warga/ajukan" className="flex items-center space-x-3 px-4 py-2.5 hover:bg-blue-800 rounded-xl font-medium transition">
            <Send className="w-5 h-5" />
            <span>Ajukan Surat</span>
          </Link>
          <Link to="/warga/status" className="flex items-center space-x-3 px-4 py-2.5 hover:bg-blue-800 rounded-xl font-medium transition">
            <FileText className="w-5 h-5" />
            <span>Status Surat</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-blue-800">
          <Link to="/" className="flex items-center space-x-3 px-4 py-2.5 hover:bg-red-800 hover:text-white rounded-xl font-medium transition text-slate-300">
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-900 md:hidden flex items-center space-x-2">
            <span>📮 RT-RW CORETAX</span>
          </h1>
          <div className="hidden md:block">
            <span className="text-slate-500 font-medium text-sm">Selamat Datang kembali,</span>
            <h2 className="text-lg font-bold text-slate-800">Danella Nur Aisyah</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 relative bg-slate-100 rounded-full">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
              DN
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Butuh Surat Pengantar RT/RW?</h3>
              <p className="text-slate-200 text-sm max-w-xl">
                Ajukan surat pengantar resmi secara digital sekarang. Proses verifikasi langsung dipantau oleh ketua RT & RW setempat.
              </p>
            </div>
            <Link to="/warga/ajukan" className="bg-white text-blue-900 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-100 transition shadow self-start md:self-auto">
              + Ajukan Surat Baru
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-sm text-slate-500 font-medium">Menunggu Persetujuan</span>
                <p className="text-2xl font-bold text-slate-800">1</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-sm text-slate-500 font-medium">Disetujui & Selesai</span>
                <p className="text-2xl font-bold text-slate-800">4</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-sm text-slate-500 font-medium">Pengajuan Ditolak</span>
                <p className="text-2xl font-bold text-slate-800">0</p>
              </div>
            </div>
          </div>

          {/* Recent Letters Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h4 className="font-bold text-slate-800">Status Pengajuan Terakhir</h4>
              <Link to="/warga/status" className="text-xs text-blue-600 font-bold hover:underline">
                Lihat Semua
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-500">
                <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-150">
                  <tr>
                    <th className="px-6 py-3">Tanggal</th>
                    <th className="px-6 py-3">Subjek / Jenis Surat</th>
                    <th className="px-6 py-3">Tujuan</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/55 transition">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">20 Mei 2026</td>
                    <td className="px-6 py-4 whitespace-nowrap">Surat Pengantar Domisili</td>
                    <td className="px-6 py-4 whitespace-nowrap">Pengurusan KTP Baru</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">
                        Menunggu RT
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/55 transition">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">10 April 2026</td>
                    <td className="px-6 py-4 whitespace-nowrap">Surat Keterangan Usaha (SKU)</td>
                    <td className="px-6 py-4 whitespace-nowrap">Pengajuan Kredit Bank</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold">
                        Disetujui RW
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
