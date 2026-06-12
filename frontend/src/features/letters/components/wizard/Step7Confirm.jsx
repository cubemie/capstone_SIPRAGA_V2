import React from 'react';

const Step7Confirm = ({ wizard }) => {
  return (
    <div className="space-y-6">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Konfirmasi Pengajuan</h2>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          Pastikan semua data yang Anda masukkan sudah benar sebelum mengirimkan pengajuan ke RT/RW.
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden text-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Ringkasan Data</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-gray-500 font-medium">Jenis Surat</div>
            <div className="col-span-2 text-gray-900 font-semibold">{wizard.selectedType?.name}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-gray-500 font-medium">Alur Persetujuan</div>
            <div className="col-span-2 text-gray-900">{wizard.selectedWorkflow?.name}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-gray-500 font-medium">Subjek</div>
            <div className="col-span-2 text-gray-900">{wizard.letterContent.subject}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-gray-500 font-medium">Keperluan</div>
            <div className="col-span-2 text-gray-900">{wizard.letterContent.purpose}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-gray-500 font-medium">Lampiran</div>
            <div className="col-span-2 text-gray-900">{wizard.attachments.length} Dokumen</div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 flex items-start gap-3">
        <svg className="w-5 h-5 mt-0.5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>Dengan menekan tombol <strong>Kirim Pengajuan</strong>, Anda menyatakan bahwa seluruh data dan dokumen yang dilampirkan adalah benar dan dapat dipertanggungjawabkan.</p>
      </div>
    </div>
  );
};

export default Step7Confirm;
