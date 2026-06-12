import React from 'react';
import DynamicField from '../shared/DynamicField';

const Step2FillData = ({ wizard }) => {
  if (!wizard.selectedType) {
    return <div className="p-8 text-center text-red-500">Silakan pilih jenis surat terlebih dahulu.</div>;
  }

  if (wizard.isLoadingFields) {
    return <div className="p-8 text-center text-gray-500">Memuat form...</div>;
  }

  const fields = wizard.templateFields || [];

  if (fields.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Tidak ada data tambahan yang perlu diisi untuk surat ini.</p>
        <p className="text-sm mt-2">Data diri Anda (Nama, NIK, dll) akan otomatis ditambahkan ke dalam surat.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Lengkapi Data Surat</h2>
        <p className="text-gray-500 text-sm">Template: <span className="font-semibold">{wizard.selectedType.name}</span></p>
      </div>

      <div className="space-y-5 bg-gray-50 p-6 rounded-xl border border-gray-100">
        {fields.map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            
            <DynamicField 
              field={field} 
              value={wizard.fieldValues[field.field_key]} 
              onChange={(val) => {
                wizard.setFieldValues(prev => ({ ...prev, [field.field_key]: val }));
              }} 
            />
            
            {field.help_text && (
              <p className="mt-1 text-xs text-gray-500">{field.help_text}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Step2FillData;
