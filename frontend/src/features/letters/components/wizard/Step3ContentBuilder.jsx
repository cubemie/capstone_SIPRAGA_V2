
const Step3ContentBuilder = ({ wizard }) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="mb-2 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--color-ink)]">Keterangan Tambahan</h2>
        <p className="text-[var(--color-ink-secondary)] text-sm">Isi subjek dan keperluan surat secara rinci</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">
            Subjek / Perihal <span className="text-[var(--color-danger)]">*</span>
          </label>
          <input
            type="text"
            required
            value={wizard.letterContent.subject}
            onChange={(e) => wizard.setLetterContent(prev => ({ ...prev, subject: e.target.value }))}
            placeholder={`Pengajuan ${wizard.selectedType?.name || 'Surat'}`}
            className="block w-full rounded-md border-[var(--color-surface-border)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] p-2.5 border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">
            Keperluan <span className="text-[var(--color-danger)]">*</span>
          </label>
          <textarea
            required
            value={wizard.letterContent.purpose}
            onChange={(e) => wizard.setLetterContent(prev => ({ ...prev, purpose: e.target.value }))}
            placeholder="Contoh: Untuk keperluan mengurus pendaftaran sekolah anak..."
            className="block w-full rounded-md border-[var(--color-surface-border)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] p-2.5 border min-h-[120px]"
            rows={4}
          />
          <p className="mt-1 text-xs text-[var(--color-ink-secondary)]">Penjelasan ini akan dibaca oleh RT/RW untuk verifikasi.</p>
        </div>
      </div>
    </div>
  );
};

export default Step3ContentBuilder;
