import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const Step8Success = ({ wizard, navigate }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-8">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[var(--color-status-disetujui-bg)] flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--color-status-disetujui-text)]" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)] mb-4">Pengajuan Berhasil!</h2>
      <p className="text-base sm:text-lg text-[var(--color-ink-secondary)] mb-8 max-w-lg">
        Surat pengantar Anda telah berhasil diajukan dan saat ini sedang menunggu persetujuan dari pengurus RT/RW terkait.
      </p>

      <div className="bg-[var(--color-surface-muted)] border border-[var(--color-surface-border)] rounded-lg p-6 max-w-md w-full mb-8 text-left space-y-3">
        <div className="flex justify-between">
          <span className="text-[var(--color-ink-secondary)]">Nomor Pengajuan</span>
          <span className="font-mono text-[var(--color-ink)] font-medium">{wizard.draftUuid?.split('-')[0].toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-ink-secondary)]">Tanggal</span>
          <span className="text-[var(--color-ink)] font-medium">{new Date().toLocaleDateString('id-ID')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-ink-secondary)]">Jenis Surat</span>
          <span className="text-[var(--color-ink)] font-medium">{wizard.selectedType?.name}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
        <button
          onClick={() => navigate('/warga/riwayat')}
          className="px-6 py-3 border border-[var(--color-surface-border)] rounded-lg font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] transition-colors"
        >
          Cek Status Pengajuan
        </button>
        <button
          onClick={() => navigate('/warga/dashboard')}
          className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
};

export default Step8Success;
