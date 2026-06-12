import React from 'react';

const DynamicField = ({ field, value, onChange }) => {
  const baseClasses = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border";

  switch (field.field_type) {
    case 'textarea':
      return (
        <textarea
          required={field.is_required}
          placeholder={field.placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseClasses} min-h-[100px]`}
          rows={3}
        />
      );
    
    case 'select':
      const options = typeof field.options === 'string' ? JSON.parse(field.options) : field.options;
      return (
        <select
          required={field.is_required}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={baseClasses}
        >
          <option value="" disabled>-- Pilih {field.label} --</option>
          {options?.map((opt, i) => (
            <option key={i} value={opt.value || opt}>{opt.label || opt}</option>
          ))}
        </select>
      );

    case 'radio':
      const radioOpts = typeof field.options === 'string' ? JSON.parse(field.options) : field.options;
      return (
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
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-3 block text-sm font-medium text-gray-700">
                {opt.label || opt}
              </label>
            </div>
          ))}
        </div>
      );

    case 'date':
      return (
        <input
          type="date"
          required={field.is_required}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={baseClasses}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          required={field.is_required}
          placeholder={field.placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={baseClasses}
        />
      );

    default: // text
      return (
        <input
          type="text"
          required={field.is_required}
          placeholder={field.placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={baseClasses}
        />
      );
  }
};

export default DynamicField;
