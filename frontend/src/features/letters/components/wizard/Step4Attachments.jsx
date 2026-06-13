import React, { useState } from 'react';

const Step4Attachments = ({ wizard }) => {
  const [previewFile, setPreviewFile] = useState(null);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    wizard.setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (e, index) => {
    e.stopPropagation();
    wizard.setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const openPreview = (file) => {
    const fileUrl = URL.createObjectURL(file);
    setPreviewFile({ name: file.name, type: file.type, url: fileUrl });
  };

  const closePreview = () => {
    if (previewFile?.url) {
      URL.revokeObjectURL(previewFile.url);
    }
    setPreviewFile(null);
  };

  const requiredDocs = typeof wizard.selectedType?.required_docs === 'string' 
    ? JSON.parse(wizard.selectedType.required_docs) 
    : wizard.selectedType?.required_docs || [];

  return (
    <div className="space-y-6 relative">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Lampiran Persyaratan</h2>
        <p className="text-gray-500 text-sm">Unggah dokumen yang diperlukan untuk surat ini</p>
      </div>

      {requiredDocs.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-800">Dokumen Wajib:</h3>
          <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
            {requiredDocs.map((doc, i) => (
              <li key={i}>{doc}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <div className="mt-4 flex text-sm justify-center text-gray-600">
          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
            <span>Pilih file</span>
            <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileUpload} accept="image/*,.pdf" />
          </label>
          <p className="pl-1">atau drag and drop</p>
        </div>
        <p className="text-xs text-gray-500 mt-2">PNG, JPG, PDF up to 5MB</p>
      </div>

      {/* List of uploaded files */}
      {wizard.attachments.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-gray-900">File Terpilih (Klik untuk melihat):</h4>
          {wizard.attachments.map((file, i) => (
            <div 
              key={i} 
              onClick={() => openPreview(file)}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-center space-x-3 truncate">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-sm text-gray-700 truncate font-medium group-hover:text-blue-700">{file.name}</span>
              </div>
              <button onClick={(e) => removeAttachment(e, i)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/75 backdrop-blur-sm" onClick={closePreview}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-800 truncate pr-4 text-lg">{previewFile.name}</h3>
              <button onClick={closePreview} className="text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full p-2 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 flex-1 overflow-auto flex justify-center items-center bg-gray-100/50 min-h-[50vh]">
              {previewFile.type.startsWith('image/') ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm border border-gray-200" />
              ) : previewFile.type === 'application/pdf' ? (
                <iframe src={previewFile.url} className="w-full h-[70vh] border border-gray-200 rounded-lg shadow-sm" title="PDF Preview" />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <svg className="w-20 h-20 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium text-gray-600">Preview tidak tersedia</p>
                  <p className="text-sm mt-1">Format file ini tidak dapat ditampilkan di browser.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step4Attachments;
