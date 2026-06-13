import React from 'react';

const Step5PickWorkflow = ({ wizard }) => {
  // Ensure we use IDs from the database, but override the visual labels
  const apiOptions = wizard.workflowOptions || [];

  // Fallback options in case DB is empty or API fails
  const fallbackOptions = [
    {
      id: 1,
      name: 'Kirim ke RT Saja',
      description: 'Pengajuan surat hanya akan dikirimkan ke Ketua RT untuk disetujui.',
      steps: [{ label: 'RT' }]
    },
    {
      id: 2,
      name: 'Kirim ke RT lalu RW',
      description: 'Pengajuan surat akan disetujui secara berjenjang oleh Ketua RT, kemudian dilanjutkan ke Ketua RW.',
      steps: [{ label: 'RT' }, { label: 'RW' }]
    }
  ];

  if (wizard.isLoadingWorkflows) {
    return <div className="p-8 text-center text-gray-500">Memuat opsi alur persetujuan...</div>;
  }

  const finalOptions = apiOptions.length > 0 ? apiOptions.map((opt) => {
    // Determine friendly name based on code or steps
    const isRtOnly = opt.code === 'RT_ONLY' || (typeof opt.steps === 'string' && !opt.steps.includes('admin_rw'));
    
    return {
      ...opt,
      displayName: isRtOnly ? 'Kirim ke RT Saja' : 'Kirim ke RT lalu RW',
      displayDesc: isRtOnly 
        ? 'Pengajuan surat hanya akan dikirimkan ke Ketua RT untuk disetujui.'
        : 'Pengajuan surat akan disetujui secara berjenjang oleh Ketua RT, kemudian dilanjutkan ke Ketua RW.',
      parsedSteps: isRtOnly ? [{ label: 'RT' }] : [{ label: 'RT' }, { label: 'RW' }]
    };
  }) : fallbackOptions.map(opt => ({
    ...opt,
    displayName: opt.name,
    displayDesc: opt.description,
    parsedSteps: opt.steps
  }));

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Alur Persetujuan</h2>
        <p className="text-gray-500 text-sm">Pilih tujuan pengiriman surat Anda</p>
      </div>

      <div className="space-y-4">
        {finalOptions.map((workflow) => (
          <label 
            key={workflow.id}
            className={`block cursor-pointer rounded-xl border-2 p-5 transition-all relative overflow-hidden ${
              wizard.selectedWorkflow?.id === workflow.id 
                ? 'border-blue-600 bg-blue-50/30 shadow-sm' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
            onClick={() => wizard.setSelectedWorkflow(workflow)}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <input
                  type="radio"
                  checked={wizard.selectedWorkflow?.id === workflow.id}
                  onChange={() => wizard.setSelectedWorkflow(workflow)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{workflow.displayName}</h3>
                <p className="text-sm text-gray-500 mt-1">{workflow.displayDesc}</p>
                
                {/* Visual Workflow Steps */}
                <div className="mt-4 flex items-center space-x-2">
                  <div className="flex items-center text-xs font-medium text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-sm">
                    Warga
                  </div>
                  
                  {workflow.parsedSteps.map((step, idx) => (
                    <React.Fragment key={idx}>
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <div className={`flex items-center text-xs font-medium px-2.5 py-1 rounded-md shadow-sm ${
                        wizard.selectedWorkflow?.id === workflow.id ? 'bg-blue-600 text-white border border-blue-700' : 'bg-white text-gray-700 border border-gray-200'
                      }`}>
                        {step.label}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default Step5PickWorkflow;
