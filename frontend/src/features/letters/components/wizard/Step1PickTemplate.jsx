import { FileText } from 'lucide-react';

const Step1PickTemplate = ({ wizard }) => {
  if (wizard.isLoadingTypes) {
    return <div className="p-8 text-center text-[var(--color-ink-secondary)]">Memuat template surat...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="mb-2 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--color-ink)]">Pilih Jenis Surat</h2>
        <p className="text-[var(--color-ink-secondary)] text-sm">Pilih jenis surat yang ingin Anda ajukan</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {wizard.letterTypes?.map((type) => {
          const active = wizard.selectedType?.id === type.id;
          return (
            <div
              key={type.id}
              onClick={() => wizard.setSelectedType(type)}
              className={`cursor-pointer rounded-xl border-2 p-4 sm:p-5 transition-all ${
                active
                  ? 'border-[var(--color-primary)] bg-[var(--color-brand-50)] shadow-sm'
                  : 'border-[var(--color-surface-border)] hover:border-[var(--color-primary-light)] hover:bg-[var(--color-surface-muted)]'
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`p-2.5 sm:p-3 rounded-lg flex-shrink-0 ${
                  active ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-muted)] text-[var(--color-ink-secondary)]'
                }`}>
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-[var(--color-ink)] mb-1 text-sm sm:text-base">{type.name}</h3>
                  <p className="text-xs text-[var(--color-ink-secondary)] line-clamp-2">{type.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Step1PickTemplate;
