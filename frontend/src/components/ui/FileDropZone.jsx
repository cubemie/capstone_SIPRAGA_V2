import { useRef, useState } from 'react';

const FileDropzone = ({
  label = 'Seret file ke sini atau',
  hint,
  accept,
  maxMB = 5,
  onChange,
  value,          // controlled: { name, size } or null
}) => {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const validate = (file) => {
    const allowedTypes = accept ? accept.split(',').map((s) => s.trim()) : [];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (allowedTypes.length && !allowedTypes.includes(ext)) {
      setError(`Format tidak sesuai. Gunakan: ${allowedTypes.join(', ')}`);
      return false;
    }
    if (file.size > maxMB * 1024 * 1024) {
      setError(`Ukuran file melebihi batas ${maxMB} MB.`);
      return false;
    }
    setError('');
    return true;
  };

  const handle = (file) => {
    if (!file) return;
    if (validate(file)) onChange(file);
  };

  return (
    <div className="space-y-1">
      {value ? (
        <div className="flex items-center gap-3 p-3 border border-green-400 bg-success/10 rounded-lg">
          <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-success flex-1 truncate">
            {value.name} — {(value.size / 1024 / 1024).toFixed(2)} MB
          </span>
          <button
            type="button"
            aria-label="Hapus file"
            onClick={() => { onChange(null); setError(''); }}
            className="text-success hover:text-error text-lg leading-none"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="Area upload file"
          onClick={() => inputRef.current.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handle(e.dataTransfer.files[0]);
          }}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-150
            ${dragOver
              ? 'border-blue-500 bg-primary-light/10'
              : 'border-gray-300 hover:border-primary/40 hover:bg-primary-light/10'
            }`}
        >
          <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-sm text-secondary">{label} <span className="text-primary font-medium">Pilih File</span></p>
          {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
          {accept && (
            <p className="text-xs text-gray-400 mt-1">
              Format: {accept.toUpperCase()} · Maks. {maxMB} MB
            </p>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handle(e.target.files[0])}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
};

export default FileDropzone;
