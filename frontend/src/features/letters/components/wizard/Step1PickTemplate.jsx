import React from 'react';

const Step1PickTemplate = ({ wizard }) => {
  if (wizard.isLoadingTypes) {
    return <div className="p-8 text-center text-gray-500">Memuat template surat...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">Pilih Jenis Surat</h2>
        <p className="text-gray-500 text-sm">Pilih jenis surat yang ingin Anda ajukan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wizard.letterTypes?.map((type) => (
          <div 
            key={type.id}
            onClick={() => wizard.setSelectedType(type)}
            className={`cursor-pointer rounded-xl border-2 p-5 transition-all ${
              wizard.selectedType?.id === type.id 
                ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                wizard.selectedType?.id === type.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {/* Fallback Icon */}
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{type.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{type.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Step1PickTemplate;
