import React from 'react';

const Step8Success = ({ wizard, navigate }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Pengajuan Berhasil!</h2>
      <p className="text-lg text-gray-600 mb-8 max-w-lg">
        Surat pengantar Anda telah berhasil diajukan dan saat ini sedang menunggu persetujuan dari pengurus RT/RW terkait.
      </p>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md w-full mb-8 text-left space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-500">Nomor Pengajuan</span>
          <span className="font-mono text-gray-900 font-medium">{wizard.draftUuid?.split('-')[0].toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Tanggal</span>
          <span className="text-gray-900 font-medium">{new Date().toLocaleDateString('id-ID')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Jenis Surat</span>
          <span className="text-gray-900 font-medium">{wizard.selectedType?.name}</span>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => navigate('/warga/riwayat')}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cek Status Pengajuan
        </button>
        <button
          onClick={() => navigate('/warga/dashboard')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
};

export default Step8Success;
