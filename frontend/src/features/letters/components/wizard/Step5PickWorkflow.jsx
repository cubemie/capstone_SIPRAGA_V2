import React from 'react';

const Step5PickWorkflow = ({ wizard }) => {
  if (wizard.isLoadingWorkflows) {
    return <div className="p-8 text-center text-gray-500">Memuat opsi alur persetujuan...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Alur Persetujuan</h2>
        <p className="text-gray-500 text-sm">Pilih alur persetujuan yang sesuai dengan tujuan surat Anda</p>
      </div>

      <div className="space-y-4">
        {wizard.workflowOptions?.map((workflow) => (
          <label 
            key={workflow.id}
            className={`block cursor-pointer rounded-xl border-2 p-5 transition-all relative overflow-hidden ${
              wizard.selectedWorkflow?.id === workflow.id 
                ? 'border-blue-600 bg-blue-50/30' 
                : 'border-gray-200 hover:border-blue-300'
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
                <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{workflow.description}</p>
                
                {/* Visual Workflow Steps */}
                <div className="mt-4 flex items-center space-x-2">
                  <div className="flex items-center text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    Warga
                  </div>
                  
                  {(() => {
                    const steps = typeof workflow.steps === 'string' ? JSON.parse(workflow.steps) : workflow.steps;
                    return steps?.map((step, idx) => (
                      <React.Fragment key={idx}>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <div className={`flex items-center text-xs font-medium px-2 py-1 rounded ${
                          wizard.selectedWorkflow?.id === workflow.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {step.label}
                        </div>
                      </React.Fragment>
                    ));
                  })()}
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
