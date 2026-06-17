import React from 'react';

const DynamicField = ({ field, value, onChange, error }) => {
  const baseClasses = "mt-1 block w-full rounded-md border-[var(--color-surface-border)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] sm:text-sm p-2.5 border transition-colors";
  const errorClasses = "mt-1 block w-full rounded-md border-red-400 bg-red-50 shadow-sm focus:border-red-500 focus:ring-red-200 sm:text-sm p-2.5 border transition-colors";

  switch (field.field_type) {
    case 'textarea':
      return (
        <>
          <textarea
            required={field.is_required}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`${error ? errorClasses : baseClasses} min-h-[100px]`}
            rows={3}
          />
          {error && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold flex-shrink-0">!</span>
              {error}
            </p>
          )}
          {!error && field.help_text && (
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">{field.help_text}</p>
          )}
        </>
      );
    
    case 'select':
      const options = typeof field.options === 'string' ? JSON.parse(field.options) : field.options;
      return (
        <>
          <select
            required={field.is_required}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={error ? errorClasses : baseClasses}
          >
            <option value="" disabled>-- Pilih {field.label} --</option>
            {options?.map((opt, i) => (
              <option key={i} value={opt.value || opt}>{opt.label || opt}</option>
            ))}
          </select>
          {error && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold flex-shrink-0">!</span>
              {error}
            </p>
          )}
          {!error && field.help_text && (
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">{field.help_text}</p>
          )}
        </>
      );

    case 'radio':
      const radioOpts = typeof field.options === 'string' ? JSON.parse(field.options) : field.options;
      return (
        <>
          <div className="mt-2 space-y-2">
            {radioOpts?.map((opt, i) => (
              <div key={i} className="flex items-center">
                <input
                  type="radio"
                  name={field.field_key}
                  value={opt.value || opt}
                  checked={value === (opt.value || opt)}
                  onChange={(e) => onChange(e.target.value)}
                  required={field.is_required}
                  className={`h-4 w-4 border text-[var(--color-primary)] focus:ring-[var(--color-primary)] ${error ? 'border-red-400' : 'border-[var(--color-surface-border)]'}`}
                />
                <label className="ml-3 block text-sm font-medium text-[var(--color-ink)]">
                  {opt.label || opt}
                </label>
              </div>
            ))}
          </div>
          {error && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold flex-shrink-0">!</span>
              {error}
            </p>
          )}
          {!error && field.help_text && (
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">{field.help_text}</p>
          )}
        </>
      );

    case 'date':
      return (
        <>
          <input
            type="date"
            required={field.is_required}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={error ? errorClasses : baseClasses}
          />
          {error && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold flex-shrink-0">!</span>
              {error}
            </p>
          )}
          {!error && field.help_text && (
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">{field.help_text}</p>
          )}
        </>
      );

    case 'number':
      return (
        <>
          <input
            type="number"
            required={field.is_required}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={error ? errorClasses : baseClasses}
          />
          {error && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold flex-shrink-0">!</span>
              {error}
            </p>
          )}
          {!error && field.help_text && (
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">{field.help_text}</p>
          )}
        </>
      );

    default: // text
      return (
        <>
          <input
            type="text"
            required={field.is_required}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={error ? errorClasses : baseClasses}
          />
          {error && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold flex-shrink-0">!</span>
              {error}
            </p>
          )}
          {!error && field.help_text && (
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">{field.help_text}</p>
          )}
        </>
      );
  }
};

export default DynamicField;
