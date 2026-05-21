import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, CheckSquare, History, Award, LogOut, Bell, Clock, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSurat } from '../../hooks/useSurat';
import { suratService } from '../../services/suratService';

export default function RtRwDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: suratMasuk, loading, error, refetch } = useSurat('masuk');

  const [actionLoading, setActionLoading] = useState(null); // ID surat yang sedang diproses

  const handleLogout = () => {
    logout();
    navigate('/login-rtrw');
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    const { error: err } = await suratService.approveSurat(id);
    setActionLoading(null);
    if (!err) refetch();
  };

  const handleReject = async (id) => {
    const alasan = prompt('Masukkan alasan penolakan:');
    if (!alasan) return;
    setActionLoading(id);
    const { error: err } = await suratService.rejectSurat(id, alasan);
    setActionLoading(null);
    if (!err) refetch();
  };

  // Stats
  const pendingCount = suratMasuk.filter(s => s.status === 'pending_rt' || s.status === 'pending_rw').length;

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
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-red-800 hover:text-white rounded-xl font-medium transition text-slate-400"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <div>
            <span className="text-slate-500 font-medium text-sm">Dashboard Pelayanan,</span>
            <h2 className="text-lg font-bold text-slate-800">
              {user?.nama || user?.username || 'Petugas RT/RW'}
              {user?.role && (
                <span className="ml-2 text-xs font-semibold text-slate-400 uppercase">({user.role})</span>
              )}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 relative bg-slate-100 rounded-full">
              <Bell className="w-5 h-5" />
              {pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
              )}
            </button>
            <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">
              {(user?.nama || user?.username || 'RT')?.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Butuh Verifikasi</span>
                <p className="text-xl font-bold text-slate-800">{loading ? '—' : pendingCount}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Total Masuk</span>
                <p className="text-xl font-bold text-slate-800">{loading ? '—' : suratMasuk.length}</p>
              </div>
            </div>
          </div>

          {/* Verification Requests List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h4 className="font-bold text-slate-800">Daftar Surat Masuk (Butuh Persetujuan)</h4>
              {!loading && pendingCount > 0 && (
                <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">
                  Ada {pendingCount} surat pending
                </span>
              )}
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Memuat surat masuk...</span>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="m-6 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && suratMasuk.length === 0 && (
              <div className="py-16 text-center text-slate-400 text-sm">
                Tidak ada surat yang membutuhkan verifikasi saat ini.
              </div>
            )}

            {/* List */}
            {!loading && !error && suratMasuk.length > 0 && (
              <div className="divide-y divide-slate-100">
                {suratMasuk.map((surat) => (
                  <div
                    key={surat.id}
                    className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{surat.nama_warga || surat.warga?.nama}</span>
                        <span className="text-xs text-slate-400">• NIK: {surat.nik_warga || surat.warga?.nik}</span>
                      </div>
                      <p className="text-slate-800 font-medium text-sm">
                        {surat.jenis_surat || surat.subjek}
                        {surat.keperluan && ` (${surat.keperluan})`}
                      </p>
                      <span className="text-xs text-slate-400 block">
                        Diajukan pada: {new Date(surat.created_at || surat.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(surat.id)}
                        disabled={actionLoading === surat.id}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow disabled:opacity-60"
                      >
                        {actionLoading === surat.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Setujui'}
                      </button>
                      <button
                        onClick={() => handleReject(surat.id)}
                        disabled={actionLoading === surat.id}
                        className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition disabled:opacity-60"
                      >
                        Tolak
                      </button>
                      {surat.dokumen_url && (
                        <a
                          href={surat.dokumen_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                        >
                          Lihat Dokumen
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
