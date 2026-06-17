import React from 'react';
import { CheckCircle2, ClipboardList, Home, Bell, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Step8Success = ({ wizard, navigate }) => {
  const shortId = wizard.draftUuid
    ? `#${wizard.draftUuid.split('-')[0].toUpperCase()}`
    : '#-';

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-8 max-w-lg mx-auto w-full">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6 border-4 border-emerald-100">
        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)] mb-2">
        Pengajuan Berhasil!
      </h2>
      <p className="text-[var(--color-ink-secondary)] mb-8 text-sm sm:text-base">
        Surat <strong>{wizard.selectedType?.name}</strong> Anda telah dikirim dan sedang menunggu verifikasi RT/RW.
      </p>

      {/* Nomor Pengajuan Card */}
      <div className="bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] rounded-2xl p-5 w-full mb-8">
        <p className="text-xs text-[var(--color-primary)] font-semibold uppercase tracking-wider mb-1">
          Nomor Pengajuan
        </p>
        <p className="text-3xl font-mono font-bold text-[var(--color-primary)] mb-3">
          {shortId}
        </p>
        <div className="flex justify-between text-sm text-[var(--color-ink-secondary)] pt-3 border-t border-[var(--color-brand-100)]">
          <span>Tanggal</span>
          <span className="font-medium text-[var(--color-ink)]">
            {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="flex justify-between text-sm text-[var(--color-ink-secondary)] pt-2">
          <span>Alur</span>
          <span className="font-medium text-[var(--color-ink)]">
            {wizard.selectedWorkflow?.name || '-'}
          </span>
        </div>
      </div>

      {/* Langkah Berikutnya */}
      <div className="bg-[var(--color-surface-muted)] rounded-xl p-4 w-full text-left mb-8 space-y-3">
        <p className="text-xs font-semibold text-[var(--color-ink-secondary)] uppercase tracking-wider">
          Langkah Berikutnya
        </p>
        {[
          { icon: Clock, text: 'RT akan memproses surat Anda dalam 1-3 hari kerja' },
          { icon: Bell, text: 'Anda akan mendapat notifikasi email/WhatsApp saat ada update' },
          { icon: ClipboardList, text: 'Pantau status surat kapan saja di halaman "Surat Saya"' },
        ].map(({ icon: Icon, text }, i) => (
          <div key={i} className="flex items-start gap-3 text-sm text-[var(--color-ink-secondary)]">
            <Icon className="w-4 h-4 mt-0.5 text-[var(--color-primary)] flex-shrink-0" />
            <span>{text}</span>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button
          onClick={() => navigate('/warga/riwayat')}
          className="flex-1 py-3 border border-[var(--color-surface-border)] rounded-xl font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] transition-colors inline-flex items-center justify-center gap-2"
        >
          <ClipboardList className="w-4 h-4" />
          Lihat Status Surat
        </button>
        <button
          onClick={() => navigate('/warga/dashboard')}
          className="flex-1 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-dark)] transition-colors inline-flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
};

export default Step8Success;