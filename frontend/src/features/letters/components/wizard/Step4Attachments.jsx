import React, { useState } from 'react';
import { UploadCloud, FileText, X, File as FileIcon } from 'lucide-react';

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
    <div className="space-y-4 sm:space-y-6 relative">
      <div className="mb-2 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--color-ink)]">Lampiran Persyaratan</h2>
        <p className="text-[var(--color-ink-secondary)] text-sm">Unggah dokumen yang diperlukan untuk surat ini</p>
      </div>

      {requiredDocs.length > 0 && (
        <div className="bg-[var(--color-accent-light)]/40 border-l-4 border-[var(--color-accent)] p-4 mb-6 rounded-r-lg">
          <h3 className="text-sm font-medium text-[var(--color-ink)]">Dokumen Wajib:</h3>
          <ul className="mt-2 text-sm text-[var(--color-ink-secondary)] list-disc list-inside">
            {requiredDocs.map((doc, i) => (
              <li key={i}>{doc}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-2 border-dashed border-[var(--color-surface-border)] rounded-xl p-6 sm:p-8 text-center hover:bg-[var(--color-surface-muted)] transition-colors">
        <UploadCloud className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-[var(--color-ink-muted)]" />
        <div className="mt-4 flex flex-col sm:flex-row text-sm justify-center items-center text-[var(--color-ink-secondary)] gap-1">
          <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] focus-within:outline-none">
            <span>Pilih file</span>
            <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileUpload} accept="image/*,.pdf" />
          </label>
          <p>atau drag and drop</p>
        </div>
        <p className="text-xs text-[var(--color-ink-muted)] mt-2">PNG, JPG, PDF up to 5MB</p>
      </div>

      {/* List of uploaded files */}
      {wizard.attachments.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-[var(--color-ink)]">File Terpilih (Klik untuk melihat):</h4>
          {wizard.attachments.map((file, i) => (
            <div
              key={i}
              onClick={() => openPreview(file)}
              className="flex items-center justify-between p-3 bg-[var(--color-surface-card)] border border-[var(--color-surface-border)] rounded-lg shadow-sm cursor-pointer hover:border-[var(--color-primary-light)] hover:bg-[var(--color-brand-50)] transition-all group"
            >
              <div className="flex items-center space-x-3 truncate">
                <FileText className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" />
                <span className="text-sm text-[var(--color-ink)] truncate font-medium">{file.name}</span>
              </div>
              <button onClick={(e) => removeAttachment(e, i)} className="text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] p-1.5 rounded-md transition-colors flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closePreview}>
          <div className="bg-[var(--color-surface-card)] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-muted)]">
              <h3 className="font-semibold text-[var(--color-ink)] truncate pr-4 text-base sm:text-lg">{previewFile.name}</h3>
              <button onClick={closePreview} className="text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-border)] rounded-full p-2 transition-colors flex-shrink-0">
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <div className="p-4 sm:p-6 flex-1 overflow-auto flex justify-center items-center bg-[var(--color-surface)] min-h-[50vh]">
              {previewFile.type.startsWith('image/') ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm border border-[var(--color-surface-border)]" />
              ) : previewFile.type === 'application/pdf' ? (
                <iframe src={previewFile.url} className="w-full h-[70vh] border border-[var(--color-surface-border)] rounded-lg shadow-sm" title="PDF Preview" />
              ) : (
                <div className="flex flex-col items-center justify-center text-[var(--color-ink-muted)]">
                  <FileIcon className="w-16 h-16 sm:w-20 sm:h-20 mb-4" />
                  <p className="text-base sm:text-lg font-medium text-[var(--color-ink-secondary)]">Preview tidak tersedia</p>
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
