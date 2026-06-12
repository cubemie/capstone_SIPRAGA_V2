import React from 'react';
import { useLetterWizard } from '../hooks/useLetterWizard';
import { useNavigate } from 'react-router-dom';

// Import Steps (We will create these next)
import Step1PickTemplate from '../components/wizard/Step1PickTemplate';
import Step2FillData from '../components/wizard/Step2FillData';
import Step3ContentBuilder from '../components/wizard/Step3ContentBuilder';
import Step4Attachments from '../components/wizard/Step4Attachments';
import Step5PickWorkflow from '../components/wizard/Step5PickWorkflow';
import Step6PdfPreview from '../components/wizard/Step6PdfPreview';
import Step7Confirm from '../components/wizard/Step7Confirm';
import Step8Success from '../components/wizard/Step8Success';

const LetterWizardPage = () => {
  const wizard = useLetterWizard();
  const navigate = useNavigate();

  const steps = [
    { num: 1, label: 'Pilih Template', component: <Step1PickTemplate wizard={wizard} /> },
    { num: 2, label: 'Isi Data', component: <Step2FillData wizard={wizard} /> },
    { num: 3, label: 'Keterangan Tambahan', component: <Step3ContentBuilder wizard={wizard} /> },
    { num: 4, label: 'Lampiran', component: <Step4Attachments wizard={wizard} /> },
    { num: 5, label: 'Pilih Alur', component: <Step5PickWorkflow wizard={wizard} /> },
    { num: 6, label: 'Preview Surat', component: <Step6PdfPreview wizard={wizard} /> },
    { num: 7, label: 'Konfirmasi', component: <Step7Confirm wizard={wizard} /> },
    { num: 8, label: 'Selesai', component: <Step8Success wizard={wizard} navigate={navigate} /> },
  ];

  const CurrentStepComponent = steps.find(s => s.num === wizard.currentStep)?.component;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ajukan Surat Baru</h1>
          <p className="text-sm text-gray-500">Isi form berikut untuk membuat surat pengantar atau keterangan</p>
        </div>
        <button 
          onClick={() => navigate('/warga')}
          className="text-gray-500 hover:text-gray-700 font-medium"
        >
          Batal
        </button>
      </header>

      {/* Stepper Progress */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.num}>
              <div className={`flex flex-col items-center min-w-[80px] ${
                wizard.currentStep === step.num ? 'opacity-100' :
                wizard.currentStep > step.num ? 'opacity-50' : 'opacity-30'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${
                  wizard.currentStep >= step.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {wizard.currentStep > step.num ? '✓' : step.num}
                </div>
                <span className={`text-xs text-center ${
                  wizard.currentStep === step.num ? 'text-blue-600 font-bold' : 'text-gray-500'
                }`}>{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 min-w-[30px] ${
                  wizard.currentStep > step.num ? 'bg-blue-600' : 'bg-gray-200'
                } mb-4`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
          {CurrentStepComponent}
        </div>
        
        {/* Navigation Buttons (Except on Success Step) */}
        {wizard.currentStep < 8 && (
          <div className="mt-6 flex justify-between">
            <button
              onClick={wizard.prevStep}
              disabled={wizard.currentStep === 1}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                wizard.currentStep === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Kembali
            </button>
            
            <button
              onClick={() => {
                // If on step 5, we save draft before moving to step 6 (preview)
                if (wizard.currentStep === 5) {
                  wizard.saveDraft().then(() => wizard.nextStep());
                } else if (wizard.currentStep === 7) {
                  wizard.submitLetter();
                } else {
                  wizard.nextStep();
                }
              }}
              disabled={wizard.isSavingDraft || wizard.isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-wait"
            >
              {wizard.isSavingDraft || wizard.isSubmitting ? 'Memproses...' : 
               wizard.currentStep === 7 ? 'Kirim Pengajuan' : 
               'Lanjut'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default LetterWizardPage;
