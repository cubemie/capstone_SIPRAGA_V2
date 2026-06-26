// frontend/src/pages/superadmin/KonfigurasiInstansi.jsx — FILE BARU

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../../utils/api';
import { Save, Building2 } from 'lucide-react';

export default function KonfigurasiInstansi() {
  const queryClient = useQueryClient();
  const [values, setValues] = useState(null);

  const { data: config, isLoading } = useQuery({
    queryKey: ['instance-config'],
    queryFn: async () => {
      const { data, error } = await api.get('/superadmin/config');
      if (error) throw new Error(error);
      return data?.data || {};
    },
  });

  const resolvedValues = useMemo(() => {
    if (values) return values;
    if (!config) return {};

    const flat = {};
    Object.entries(config).forEach(([k, v]) => {
      flat[k] = v.value || '';
    });
    return flat;
  }, [config, values]);

  const updateMutation = useMutation({
    mutationFn: (updates) => api.put('/superadmin/config', updates),
    onSuccess: () => {
      toast.success('Konfigurasi berhasil disimpan');
      queryClient.invalidateQueries({ queryKey: ['instance-config'] });
    },
    onError: () => toast.error('Gagal menyimpan konfigurasi'),
  });

  const CONFIG_FIELDS = [
    { section: 'Informasi Instansi', fields: [
      { key: 'nama_desa',        label: 'Nama Desa/Kelurahan', type: 'text' },
      { key: 'kecamatan',        label: 'Kecamatan',           type: 'text' },
      { key: 'kabupaten_kota',   label: 'Kabupaten/Kota',      type: 'text' },
      { key: 'provinsi',         label: 'Provinsi',            type: 'text' },
      { key: 'kode_pos',         label: 'Kode Pos',            type: 'text' },
    ]},
    { section: 'Kepala Instansi', fields: [
      { key: 'kepala_desa',      label: 'Nama Kepala Desa/Lurah', type: 'text' },
      { key: 'nip_kepala_desa',  label: 'NIP',                    type: 'text' },
    ]},
    { section: 'Kop Surat', fields: [
      { key: 'kop_surat_line1',  label: 'Kop Surat Baris 1', type: 'text',
        hint: 'Contoh: PEMERINTAH KOTA SEMARANG' },
      { key: 'kop_surat_line2',  label: 'Kop Surat Baris 2', type: 'text',
        hint: 'Contoh: KELURAHAN SRONDOL WETAN' },
      { key: 'logo_url',         label: 'URL Logo Instansi',  type: 'url',
        hint: 'URL gambar logo (PNG/JPG). Dipakai di kop surat PDF.' },
    ]},
  ];

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
          <h1 className="text-xl font-bold text-ink">Konfigurasi Instansi</h1>
          <p className="text-sm text-ink-secondary mt-0.5">
            Atur nama desa, kecamatan, dan informasi yang muncul di kop surat
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-surface-muted rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {CONFIG_FIELDS.map(section => (
              <div key={section.section} className="bg-[var(--color-surface-card)] border border-surface-border rounded-xl p-5">
                <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" />
                  {section.section}
                </p>
                <div className="space-y-3">
                  {section.fields.map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-ink-secondary mb-1">
                        {field.label}
                      </label>
                      <input
                        type={field.type || 'text'}
                        value={resolvedValues[field.key] || ''}
                        onChange={e => setValues(p => ({ ...(p || resolvedValues), [field.key]: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder={config?.[field.key]?.label}
                      />
                      {field.hint && (
                        <p className="text-xs text-ink-muted mt-1">{field.hint}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={() => updateMutation.mutate(resolvedValues)}
              disabled={updateMutation.isPending}
              className="flex items-center justify-center gap-2 w-full py-3 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? 'Menyimpan...' : 'Simpan Konfigurasi'}
            </button>
          </div>
        )}
    </div>
  );
}
