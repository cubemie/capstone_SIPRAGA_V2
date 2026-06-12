import React from 'react';

const Step3ContentBuilder = ({ wizard }) => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Keterangan Tambahan</h2>
        <p className="text-gray-500 text-sm">Isi subjek dan keperluan surat secara rinci</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subjek / Perihal <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={wizard.letterContent.subject}
            onChange={(e) => wizard.setLetterContent(prev => ({ ...prev, subject: e.target.value }))}
            placeholder={`Pengajuan ${wizard.selectedType?.name || 'Surat'}`}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Keperluan <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            value={wizard.letterContent.purpose}
            onChange={(e) => wizard.setLetterContent(prev => ({ ...prev, purpose: e.target.value }))}
            placeholder="Contoh: Untuk keperluan mengurus pendaftaran sekolah anak..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border min-h-[120px]"
            rows={4}
          />
          <p className="mt-1 text-xs text-gray-500">Penjelasan ini akan dibaca oleh RT/RW untuk verifikasi.</p>
        </div>
      </div>
    </div>
  );
};

export default Step3ContentBuilder;
