import DynamicField from '../shared/DynamicField';
import { useAuth } from '../../../../context/AuthContext';
import { User } from 'lucide-react';

const validateField = (key, value) => {
  const keyLower = key.toLowerCase();
  const parts = keyLower.split('_');
  
  if (parts.includes('nik')) {
    if (value && !/^\d{16}$/.test(value)) {
      return 'NIK harus tepat 16 digit angka';
    }
  }
  if (parts.includes('hp') || parts.includes('telp') || keyLower.includes('no_hp') || keyLower.includes('no_telp')) {
    if (value && !/^(\+62|08)\d{8,12}$/.test(value)) {
      return 'Format nomor HP tidak valid (contoh: 081234567890)';
    }
  }
  return null;
};

// Fields data warga yang wajib diisi oleh RT/RW
const PEMOHON_FIELDS = [
  { key: '_pemohon_nama',            label: 'Nama Lengkap',         type: 'text',     required: true,  placeholder: 'Contoh: Budi Santoso' },
  { key: '_pemohon_nik',             label: 'NIK (16 digit)',        type: 'text',     required: true,  placeholder: '3374xxxxxxxxxxxxxxxx' },
  { key: '_pemohon_tempat_lahir',    label: 'Tempat Lahir',          type: 'text',     required: true,  placeholder: 'Contoh: Semarang' },
  { key: '_pemohon_tanggal_lahir',   label: 'Tanggal Lahir',         type: 'date',     required: true },
  { key: '_pemohon_jenis_kelamin',   label: 'Jenis Kelamin',         type: 'select',   required: true,  options: ['Laki-laki', 'Perempuan'] },
  { key: '_pemohon_agama',           label: 'Agama',                 type: 'select',   required: false, options: ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'] },
  { key: '_pemohon_status_perkawinan', label: 'Status Perkawinan',   type: 'select',   required: false, options: ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'] },
  { key: '_pemohon_pekerjaan',       label: 'Pekerjaan',             type: 'text',     required: false, placeholder: 'Contoh: Wiraswasta' },
  { key: '_pemohon_alamat',          label: 'Alamat Lengkap',        type: 'textarea', required: true,  placeholder: 'Jl. ...' },
  { key: '_pemohon_rt',              label: 'RT',                    type: 'text',     required: false, placeholder: 'Contoh: 001' },
  { key: '_pemohon_rw',              label: 'RW',                    type: 'text',     required: false, placeholder: 'Contoh: 010' },
  { key: '_pemohon_no_hp',           label: 'Nomor HP',              type: 'text',     required: false, placeholder: '081234567890' },
];

const ResidentDataSection = ({ fieldValues, setFieldValues }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Data Warga Pemohon</h3>
          <p className="text-xs text-[var(--color-ink-muted)]">Isi data kependudukan warga yang mengajukan surat ini</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PEMOHON_FIELDS.map((f) => {
          const value = fieldValues[f.key] ?? '';
          const nikError = f.key === '_pemohon_nik' && value && !/^\d{16}$/.test(value)
            ? 'NIK harus tepat 16 digit angka' : null;
          const hpError = f.key === '_pemohon_no_hp' && value && !/^(\+62|08)\d{8,12}$/.test(value)
            ? 'Format HP tidak valid' : null;
          const error = nikError || hpError;

          const isWide = ['_pemohon_alamat', '_pemohon_nama', '_pemohon_nik'].includes(f.key);

          return (
            <div key={f.key} className={isWide ? 'sm:col-span-2' : ''}>
              <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">
                {f.label} {f.required && <span className="text-[var(--color-danger)]">*</span>}
              </label>

              {f.type === 'select' ? (
                <select
                  value={value}
                  onChange={(e) => setFieldValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-white text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="">-- Pilih --</option>
                  {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea
                  rows={2}
                  value={value}
                  placeholder={f.placeholder}
                  onChange={(e) => setFieldValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-white text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                />
              ) : (
                <input
                  type={f.type}
                  value={value}
                  placeholder={f.placeholder}
                  onChange={(e) => setFieldValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border text-sm text-[var(--color-ink)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${error ? 'border-red-400' : 'border-[var(--color-surface-border)]'}`}
                />
              )}
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Step2FillData = ({ wizard }) => {
  const { user } = useAuth();
  const isRtOrRw = user?.role === 'rt' || user?.role === 'rw';

  if (!wizard.selectedType) {
    return <div className="p-8 text-center text-[var(--color-danger)]">Silakan pilih jenis surat terlebih dahulu.</div>;
  }

  if (wizard.isLoadingFields) {
    return <div className="p-8 text-center text-[var(--color-ink-secondary)]">Memuat form...</div>;
  }

  const fields = wizard.templateFields || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="mb-2 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--color-ink)]">Lengkapi Data Surat</h2>
        <p className="text-[var(--color-ink-secondary)] text-sm">Template: <span className="font-semibold text-[var(--color-ink)]">{wizard.selectedType.name}</span></p>
      </div>

      {/* ─── BAGIAN KHUSUS RT/RW: Data Warga Pemohon ─── */}
      {isRtOrRw && (
        <div className="bg-blue-50 border border-blue-200 p-4 sm:p-5 rounded-xl">
          <ResidentDataSection
            fieldValues={wizard.fieldValues}
            setFieldValues={wizard.setFieldValues}
          />
        </div>
      )}

      {/* ─── Dynamic Fields dari Template ─── */}
      {fields.length > 0 && (
        <div className="space-y-5 bg-[var(--color-surface-muted)] p-4 sm:p-6 rounded-xl border border-[var(--color-surface-border)]">
          <h3 className="text-sm font-bold text-[var(--color-ink)] mb-1">
            {isRtOrRw ? 'Data Tambahan Surat' : 'Data Diri & Keperluan'}
          </h3>
          {fields.map((field) => {
            const value = wizard.fieldValues[field.field_key];
            const error = validateField(field.field_key, value);
            return (
              <div key={field.id}>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">
                  {field.label} {field.is_required && <span className="text-[var(--color-danger)]">*</span>}
                </label>
                <DynamicField
                  field={field}
                  value={value}
                  onChange={(val) => {
                    wizard.setFieldValues(prev => ({ ...prev, [field.field_key]: val }));
                  }}
                  error={error}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Untuk warga: tidak ada templateFields, tampilkan info */}
      {!isRtOrRw && fields.length === 0 && (
        <div className="p-6 sm:p-8 text-center text-[var(--color-ink-secondary)]">
          <p>Tidak ada data tambahan yang perlu diisi untuk surat ini.</p>
          <p className="text-sm mt-2">Data diri Anda (Nama, NIK, dll) akan otomatis ditambahkan ke dalam surat.</p>
        </div>
      )}
    </div>
  );
};

export default Step2FillData;
