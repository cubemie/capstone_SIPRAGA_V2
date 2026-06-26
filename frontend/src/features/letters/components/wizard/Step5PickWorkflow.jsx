import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

const Step5PickWorkflow = ({ wizard }) => {
  const { user } = useAuth();
  const role = user?.role === 'admin_rt' ? 'rt' : user?.role === 'admin_rw' ? 'rw' : user?.role;

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

  // Filter and map options based on user role
  let processedOptions = apiOptions.length > 0 ? apiOptions : fallbackOptions;

  // If user is RW, they should only see RW_ONLY or RT_THEN_RW (or similar)
  // But actually, we just use the options we have and map their display properties.
  // Wait, if it's RW, and RW_ONLY is in the DB, it will be in apiOptions.
  // If we only have RT_ONLY and RT_THEN_RW, we might need to filter.
  // Let's just process whatever is given and assign friendly names:

  const finalOptions = processedOptions.map((opt) => {
    const isRtOnly = opt.code === 'RT_ONLY' || (typeof opt.steps === 'string' && !opt.steps.includes('admin_rw'));
    const isRwOnly = opt.code === 'RW_ONLY';

    let displayName = opt.name;
    let displayDesc = opt.description;
    let parsedSteps = opt.steps;
    let visualSteps = [{ label: 'Warga' }, { label: 'RT' }]; // default

    if (role === 'rt') {
      if (isRtOnly) {
        displayName = 'Tanda Tangan Sendiri Saja';
        displayDesc = 'Surat akan langsung disetujui menggunakan TTD Anda.';
        visualSteps = [{ label: 'RT (Anda)' }];
      } else {
        displayName = 'Tanda Tangan Sendiri lalu kirim ke RW';
        displayDesc = 'Surat akan ditandatangani oleh Anda, kemudian diteruskan ke Ketua RW.';
        visualSteps = [{ label: 'RT (Anda)' }, { label: 'RW' }];
      }
    } else if (role === 'rw') {
      if (isRwOnly) {
        displayName = 'Tanda Tangan Sendiri Saja';
        displayDesc = 'Surat akan langsung disetujui menggunakan TTD Anda.';
        visualSteps = [{ label: 'RW (Anda)' }];
      } else {
        displayName = 'Kirim ke RT untuk persetujuan awal';
        displayDesc = 'Surat akan dikirim ke Ketua RT, setelah disetujui RT akan diteruskan kembali ke Anda.';
        visualSteps = [{ label: 'RW (Pembuat)' }, { label: 'RT' }, { label: 'RW (Anda)' }];
      }
    } else {
      // Normal Warga
      displayName = isRtOnly ? 'Kirim ke RT Saja' : 'Kirim ke RT lalu RW';
      displayDesc = isRtOnly
        ? 'Pengajuan surat hanya akan dikirimkan ke Ketua RT untuk disetujui.'
        : 'Pengajuan surat akan disetujui secara berjenjang oleh Ketua RT, kemudian dilanjutkan ke Ketua RW.';
      visualSteps = isRtOnly ? [{ label: 'Warga' }, { label: 'RT' }] : [{ label: 'Warga' }, { label: 'RT' }, { label: 'RW' }];
    }

    return {
      ...opt,
      displayName,
      displayDesc,
      visualSteps
    };
  });

  // For RW, filter out RT_ONLY because it doesn't make sense for RW to create a letter that only goes to RT and stops.
  const filteredOptions = finalOptions.filter(opt => {
    if (role === 'rw' && opt.code === 'RT_ONLY') return false;
    if (role !== 'rw' && opt.code === 'RW_ONLY') return false;
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="mb-2 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--color-ink)]">Alur Persetujuan</h2>
        <p className="text-[var(--color-ink-secondary)] text-sm">Pilih tujuan pengiriman surat Anda</p>
      </div>

      <div className="space-y-4">
        {filteredOptions.map((workflow) => {
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
                    {workflow.visualSteps.map((step, idx) => (
                      <React.Fragment key={idx}>
                        {idx > 0 && <ChevronRight className="w-4 h-4 text-[var(--color-ink-muted)]" />}
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
