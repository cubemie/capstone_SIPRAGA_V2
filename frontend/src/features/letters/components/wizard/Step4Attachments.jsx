import React from 'react';

const Step4Attachments = ({ wizard }) => {
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    // In a real app, we would upload to Supabase storage here or save to state to upload on submit
    wizard.setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    wizard.setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const requiredDocs = typeof wizard.selectedType?.required_docs === 'string' 
    ? JSON.parse(wizard.selectedType.required_docs) 
    : wizard.selectedType?.required_docs || [];

  return (
    <div className="space-y-6">
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
            <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileUpload} />
          </label>
          <p className="pl-1">atau drag and drop</p>
        </div>
        <p className="text-xs text-gray-500 mt-2">PNG, JPG, PDF up to 5MB</p>
      </div>

      {/* List of uploaded files */}
      {wizard.attachments.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-gray-900">File Terpilih:</h4>
          {wizard.attachments.map((file, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3 truncate">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="text-sm text-gray-700 truncate">{file.name}</span>
              </div>
              <button onClick={() => removeAttachment(i)} className="text-red-500 hover:text-red-700 p-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Step4Attachments;
