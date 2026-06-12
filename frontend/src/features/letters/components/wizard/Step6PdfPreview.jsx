import React, { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';

const Step6PdfPreview = ({ wizard }) => {
  const [previewFile, setPreviewFile] = useState(null);
  const { user } = useAuth();

  const handlePreview = (file) => {
    // Create an object URL for the selected file
    const url = URL.createObjectURL(file);
    setPreviewFile({ file, url });
  };

  const closePreview = () => {
    if (previewFile?.url) {
      URL.revokeObjectURL(previewFile.url);
    }
    setPreviewFile(null);
  };

  return (
    <div className="space-y-6 flex flex-col h-full relative">
      <div className="mb-4 flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-900">Preview Draft Surat</h2>
        <p className="text-gray-500 text-sm">Periksa kembali tampilan surat sebelum dikirim</p>
      </div>

      <div className="bg-gray-100 rounded-lg border border-gray-200 flex-1 flex flex-col items-center justify-center p-8 min-h-[400px]">
        {/* Placeholder for actual PDF rendering via react-pdf */}
        <div className="bg-white w-full max-w-lg aspect-[1/1.414] shadow-lg rounded-sm p-8 text-left border border-gray-300 relative">
          <div className="text-center font-bold text-lg mb-8 uppercase underline">
            {wizard.selectedType?.name || 'SURAT KETERANGAN'}
          </div>
          
          <div className="text-sm space-y-4 text-gray-800">
            <p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p>
            
              <table className="w-full">
              <tbody>
                <tr><td className="w-1/3 py-1">Nama</td><td>: {user?.nama || '[Nama Anda]'}</td></tr>
                <tr><td className="w-1/3 py-1">NIK</td><td>: {user?.nik || '[NIK Anda]'}</td></tr>
              </tbody>
            </table>
            
            {Object.keys(wizard.fieldValues).length > 0 && (
              <table className="w-full mt-4">
                <tbody>
                  {Object.entries(wizard.fieldValues).map(([key, val]) => (
                    <tr key={key}>
                      <td className="w-1/3 py-1 align-top capitalize">{key.replace(/_/g, ' ')}</td>
                      <td className="align-top">: {val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <p className="mt-6 text-justify leading-relaxed">
              Orang tersebut di atas benar adalah warga kami dan surat ini dibuat untuk keperluan: 
              <br/>
              <strong>{wizard.letterContent.purpose || '-'}</strong>
            </p>

            <p className="mt-4">Demikian surat ini dibuat untuk dipergunakan sebagaimana mestinya.</p>
            
            {/* Signature Blocks */}
            <div className="mt-12 flex justify-between text-center">
              <div className="w-1/3">
                <p>Mengetahui,</p>
                <p>Ketua RT</p>
                <div className="h-16 mt-2 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs">
                  [ TTD RT ]
                </div>
                <p className="mt-2 font-bold underline">(.......................)</p>
              </div>
              <div className="w-1/3">
                <p className="capitalize">{user?.kabupaten || 'Tangerang'}, {new Date().toLocaleDateString('id-ID')}</p>
                <p>Pemohon,</p>
                <div className="h-16 mt-2"></div>
                <p className="mt-2 font-bold underline">{user?.nama || '[Nama Anda]'}</p>
              </div>
            </div>
          </div>
          
          <div className="absolute top-0 left-0 w-full h-full bg-black/5 flex items-center justify-center pointer-events-none rounded-sm">
            <span className="text-6xl text-black/10 font-bold rotate-[-45deg] select-none tracking-widest">DRAFT</span>
          </div>
        </div>

        {/* Attachment Previews */}
        {wizard.attachments?.length > 0 && (
          <div className="w-full max-w-lg mt-6 text-left">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Lampiran Tersimpan (Klik untuk melihat):</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {wizard.attachments.map((file, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handlePreview(file)}
                  className="flex-shrink-0 bg-white border border-gray-200 rounded-lg p-2 flex items-center gap-2 shadow-sm hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer"
                >
                  <div className="bg-blue-100 p-1.5 rounded text-blue-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-700 max-w-[120px] truncate">{file.name || `Lampiran ${idx+1}`}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="text-sm text-gray-500 flex items-center justify-center mt-2 flex-shrink-0">
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Tampilan final PDF bisa sedikit berbeda dengan preview ini.
      </div>

      {/* Modal Preview */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={closePreview}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800 truncate pr-4">{previewFile.file.name}</h3>
              <button onClick={closePreview} className="text-gray-500 hover:text-red-500 transition-colors p-1 bg-white rounded-md border border-gray-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-100 flex items-center justify-center min-h-[50vh]">
              {previewFile.file.type.startsWith('image/') ? (
                <img src={previewFile.url} alt="Preview" className="max-w-full max-h-[70vh] object-contain rounded shadow-sm" />
              ) : previewFile.file.type === 'application/pdf' ? (
                <iframe src={previewFile.url} className="w-full h-[70vh] rounded shadow-sm border-0" title="PDF Preview" />
              ) : (
                <div className="text-center text-gray-500 flex flex-col items-center">
                  <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Preview tidak tersedia untuk format file ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step6PdfPreview;
