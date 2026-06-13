import React from 'react';
import DynamicField from '../shared/DynamicField';

const Step2FillData = ({ wizard }) => {
  if (!wizard.selectedType) {
    return <div className="p-8 text-center text-[var(--color-danger)]">Silakan pilih jenis surat terlebih dahulu.</div>;
  }

  if (wizard.isLoadingFields) {
    return <div className="p-8 text-center text-[var(--color-ink-secondary)]">Memuat form...</div>;
  }

  const fields = wizard.templateFields || [];

  if (fields.length === 0) {
    return (
      <div className="p-6 sm:p-8 text-center text-[var(--color-ink-secondary)]">
        <p>Tidak ada data tambahan yang perlu diisi untuk surat ini.</p>
        <p className="text-sm mt-2">Data diri Anda (Nama, NIK, dll) akan otomatis ditambahkan ke dalam surat.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="mb-2 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--color-ink)]">Lengkapi Data Surat</h2>
        <p className="text-[var(--color-ink-secondary)] text-sm">Template: <span className="font-semibold text-[var(--color-ink)]">{wizard.selectedType.name}</span></p>
      </div>

      <div className="space-y-5 bg-[var(--color-surface-muted)] p-4 sm:p-6 rounded-xl border border-[var(--color-surface-border)]">
        {fields.map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">
              {field.label} {field.is_required && <span className="text-[var(--color-danger)]">*</span>}
            </label>

            <DynamicField
              field={field}
              value={wizard.fieldValues[field.field_key]}
              onChange={(val) => {
                wizard.setFieldValues(prev => ({ ...prev, [field.field_key]: val }));
              }}
            />

            {field.help_text && (
              <p className="mt-1 text-xs text-[var(--color-ink-secondary)]">{field.help_text}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Step2FillData;
