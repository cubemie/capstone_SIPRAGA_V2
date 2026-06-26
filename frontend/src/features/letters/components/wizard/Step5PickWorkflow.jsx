import React from 'react';
import { ChevronRight } from 'lucide-react';

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
    return <div className="p-8 text-center text-[var(--color-ink-secondary)]">Memuat opsi alur persetujuan...</div>;
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
    <div className="space-y-4 sm:space-y-6">
      <div className="mb-2 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--color-ink)]">Alur Persetujuan</h2>
        <p className="text-[var(--color-ink-secondary)] text-sm">Pilih tujuan pengiriman surat Anda</p>
      </div>

      <div className="space-y-4">
        {finalOptions.map((workflow) => {
          const active = wizard.selectedWorkflow?.id === workflow.id;
          return (
            <label
              key={workflow.id}
              className={`block cursor-pointer rounded-xl border-2 p-4 sm:p-5 transition-all relative overflow-hidden ${
                active
                  ? 'border-[var(--color-primary)] bg-[var(--color-brand-50)] shadow-sm'
                  : 'border-[var(--color-surface-border)] hover:border-[var(--color-primary-light)] hover:bg-[var(--color-surface-muted)]'
              }`}
              onClick={() => wizard.setSelectedWorkflow(workflow)}
            >
              <div className="flex items-start sm:items-center">
                <div className="flex-shrink-0 mr-3 sm:mr-4 mt-1 sm:mt-0">
                  <input
                    type="radio"
                    checked={active}
                    onChange={() => wizard.setSelectedWorkflow(workflow)}
                    className="h-5 w-5 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-[var(--color-surface-border)]"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--color-ink)]">{workflow.displayName}</h3>
                  <p className="text-sm text-[var(--color-ink-secondary)] mt-1">{workflow.displayDesc}</p>

                  {/* Visual Workflow Steps */}
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <div className="flex items-center text-sm font-medium text-[var(--color-ink-secondary)] bg-[var(--color-surface-card)] border border-[var(--color-surface-border)] px-3 py-1.5 rounded-md shadow-sm">
                      Warga
                    </div>

                    {workflow.parsedSteps.map((step, idx) => (
                      <React.Fragment key={idx}>
                        <ChevronRight className="w-4 h-4 text-[var(--color-ink-muted)]" />
                        <div className={`flex items-center text-sm font-medium px-3 py-1.5 rounded-md shadow-sm ${
                          active ? 'bg-[var(--color-primary)] text-white border border-[var(--color-primary-dark)]' : 'bg-[var(--color-surface-card)] text-[var(--color-ink-secondary)] border border-[var(--color-surface-border)]'
                        }`}>
                          {step.label}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default Step5PickWorkflow;
