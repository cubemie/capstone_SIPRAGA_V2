import React from 'react';
import { AlertCircle, Info } from 'lucide-react';

const Step7Confirm = ({ wizard }) => {
  return (
    <div className="space-y-6">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent-dark)] mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-ink)]">Konfirmasi Pengajuan</h2>
        <p className="text-[var(--color-ink-secondary)] mt-2 max-w-md mx-auto">
          Pastikan semua data yang Anda masukkan sudah benar sebelum mengirimkan pengajuan ke RT/RW.
        </p>
      </div>

      <div className="bg-[var(--color-surface-muted)] border border-[var(--color-surface-border)] rounded-xl overflow-hidden text-sm">
        <div className="px-6 py-4 border-b border-[var(--color-surface-border)]">
          <h3 className="font-semibold text-[var(--color-ink)]">Ringkasan Data</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-[var(--color-ink-secondary)] font-medium">Jenis Surat</div>
            <div className="col-span-2 text-[var(--color-ink)] font-semibold">{wizard.selectedType?.name}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-[var(--color-ink-secondary)] font-medium">Alur Persetujuan</div>
            <div className="col-span-2 text-[var(--color-ink)]">{wizard.selectedWorkflow?.name}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-[var(--color-ink-secondary)] font-medium">Subjek</div>
            <div className="col-span-2 text-[var(--color-ink)]">{wizard.letterContent.subject}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-[var(--color-ink-secondary)] font-medium">Keperluan</div>
            <div className="col-span-2 text-[var(--color-ink)]">{wizard.letterContent.purpose}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-[var(--color-ink-secondary)] font-medium">Lampiran</div>
            <div className="col-span-2 text-[var(--color-ink)]">{wizard.attachments.length} Dokumen</div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] rounded-xl p-4 text-sm text-[var(--color-primary)] flex items-start gap-3">
        <Info className="w-5 h-5 mt-0.5 text-[var(--color-primary)] flex-shrink-0" />
        <p>Dengan menekan tombol <strong>Kirim Pengajuan</strong>, Anda menyatakan bahwa seluruh data dan dokumen yang dilampirkan adalah benar dan dapat dipertanggungjawabkan.</p>
      </div>
    </div>
  );
};

export default Step7Confirm;
