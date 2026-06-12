// frontend/src/pages/superadmin/TemplateSuratMarkdown.jsx — FILE BARU

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../../utils/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Plus, Eye, Trash2, Edit3, Save, X } from 'lucide-react';

// Panduan variabel Mustache yang tersedia
const VARIABLE_HINTS = [
  { key: '{{nama_warga}}',    label: 'Nama warga' },
  { key: '{{nik}}',           label: 'NIK warga' },
  { key: '{{alamat}}',        label: 'Alamat warga' },
  { key: '{{keperluan}}',     label: 'Keperluan surat' },
  { key: '{{tanggal}}',       label: 'Tanggal surat' },
  { key: '{{nomor_surat}}',   label: 'Nomor surat' },
  { key: '{{nama_desa}}',     label: 'Nama desa/kelurahan' },
  { key: '{{kecamatan}}',     label: 'Kecamatan' },
  { key: '{{kabupaten}}',     label: 'Kabupaten/Kota' },
  { key: '{{kepala_desa}}',   label: 'Nama kepala desa' },
  { key: '{{nip_kepala}}',    label: 'NIP kepala desa' },
];

const MARKDOWN_STARTER = `# SURAT KETERANGAN
### No: {{nomor_surat}}

---

**PEMERINTAH KOTA/KABUPATEN {{kabupaten}}**
**KELURAHAN {{nama_desa}}**
**KECAMATAN {{kecamatan}}**

---

Yang bertanda tangan di bawah ini, Kepala Kelurahan **{{nama_desa}}**, menerangkan bahwa:

| | |
|---|---|
| **Nama** | {{nama_warga}} |
| **NIK** | {{nik}} |
| **Alamat** | {{alamat}} |

Adalah benar warga kami yang berdomisili di wilayah tersebut.

Surat keterangan ini dibuat untuk keperluan **{{keperluan}}**.

---

{{nama_desa}}, {{tanggal}}

Kepala Kelurahan {{nama_desa}}

&nbsp;

&nbsp;

**{{kepala_desa}}**
NIP. {{nip_kepala}}
`;

export default function TemplateSuratMarkdown() {
  const [editingId, setEditingId]   = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm]             = useState({ name: '', letter_type_id: '', markdown_content: MARKDOWN_STARTER });
  const [previewUrl, setPreviewUrl] = useState(null);
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['markdown-templates'],
    queryFn: async () => {
      const { data, error } = await api.get('/superadmin/templates/markdown');
      if (error) throw new Error(error);
      return data?.data || [];
    },
  });

  const { data: letterTypes = [] } = useQuery({
    queryKey: ['letter-types'],
    queryFn: async () => {
      const { data } = await api.get('/v2/letters/types');
      return data?.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await api.post('/superadmin/templates/markdown', payload);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      toast.success('Template berhasil dibuat!');
      queryClient.invalidateQueries({ queryKey: ['markdown-templates'] });
      setIsCreating(false);
      setForm({ name: '', letter_type_id: '', markdown_content: MARKDOWN_STARTER });
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data, error } = await api.put(`/superadmin/templates/markdown/${id}`, payload);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      toast.success('Template berhasil diperbarui!');
      queryClient.invalidateQueries({ queryKey: ['markdown-templates'] });
      setEditingId(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/superadmin/templates/markdown/${id}`),
    onSuccess: () => {
      toast.success('Template dihapus');
      queryClient.invalidateQueries({ queryKey: ['markdown-templates'] });
    },
  });

  const handlePreview = async (id) => {
    // Buka PDF preview di tab baru
    window.open(`${import.meta.env.VITE_API_URL}/superadmin/templates/markdown/${id}/preview`, '_blank');
  };

  const TemplateForm = ({ initial, onSave, onCancel, saving }) => {
    const [localForm, setLocalForm] = useState(initial);

    return (
      <div className="bg-white border border-surface-border rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">Nama Template</label>
            <input
              value={localForm.name}
              onChange={e => setLocalForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Contoh: Template Domisili v1"
              className="w-full px-3 py-2 text-sm border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">Jenis Surat</label>
            <select
              value={localForm.letter_type_id}
              onChange={e => setLocalForm(p => ({ ...p, letter_type_id: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">-- Pilih Jenis Surat --</option>
              {letterTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Panduan variabel */}
        <div>
          <p className="text-xs font-medium text-ink-secondary mb-2">Variabel yang tersedia (klik untuk menyalin):</p>
          <div className="flex flex-wrap gap-1.5">
            {VARIABLE_HINTS.map(v => (
              <button
                key={v.key}
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(v.key);
                  toast.info(`Disalin: ${v.key}`);
                }}
                className="text-xs bg-brand-50 text-brand-700 border border-brand-100 px-2 py-0.5 rounded font-mono hover:bg-brand-100 transition"
                title={v.label}
              >
                {v.key}
              </button>
            ))}
          </div>
        </div>

        {/* Editor Markdown */}
        <div>
          <label className="block text-xs font-medium text-ink-secondary mb-1">
            Konten Template (Markdown)
          </label>
          <textarea
            value={localForm.markdown_content}
            onChange={e => setLocalForm(p => ({ ...p, markdown_content: e.target.value }))}
            rows={20}
            className="w-full px-3 py-2 text-sm border border-surface-border rounded-lg font-mono resize-y focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Tulis template surat dalam format Markdown..."
          />
          <p className="text-xs text-ink-muted mt-1">
            Gunakan Markdown standar: **tebal**, *miring*, ## heading, | tabel |, ---garis---
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-ink-secondary border border-surface-border rounded-lg hover:bg-surface-muted transition"
          >
            Batal
          </button>
          <button
            onClick={() => onSave(localForm)}
            disabled={saving || !localForm.name || !localForm.markdown_content}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Menyimpan...' : 'Simpan Template'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-ink">Template Surat (Markdown)</h1>
            <p className="text-sm text-ink-secondary mt-0.5">
              Buat dan kelola template surat dalam format Markdown
            </p>
          </div>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition"
            >
              <Plus className="w-4 h-4" />
              Buat Template
            </button>
          )}
        </div>

        {/* Form buat baru */}
        {isCreating && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-ink mb-3">Template Baru</h2>
            <TemplateForm
              initial={form}
              saving={createMutation.isPending}
              onSave={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreating(false)}
            />
          </div>
        )}

        {/* Daftar template */}
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-surface-muted rounded-xl animate-pulse" />)}
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white border border-surface-border rounded-xl py-16 text-center text-ink-muted">
            <p className="text-sm">Belum ada template. Klik "Buat Template" untuk mulai.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map(tmpl => (
              <div key={tmpl.id} className="bg-white border border-surface-border rounded-xl overflow-hidden">
                {editingId === tmpl.id ? (
                  <div className="p-5">
                    <TemplateForm
                      initial={{ name: tmpl.name, letter_type_id: tmpl.letter_type_id, markdown_content: tmpl.markdown_content }}
                      saving={updateMutation.isPending}
                      onSave={(data) => updateMutation.mutate({ id: tmpl.id, payload: data })}
                      onCancel={() => setEditingId(null)}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink">{tmpl.name}</p>
                      <p className="text-xs text-ink-secondary mt-0.5">{tmpl.letter_type_name}</p>
                      <p className="text-xs text-ink-muted mt-0.5">Versi {tmpl.version}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePreview(tmpl.id)}
                        title="Preview PDF"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-brand-600 bg-brand-50 border border-brand-100 rounded-lg hover:bg-brand-100 transition font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>
                      <button
                        onClick={() => setEditingId(tmpl.id)}
                        className="p-2 text-ink-secondary hover:text-brand-600 rounded-lg hover:bg-brand-50 transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus template "${tmpl.name}"?`)) {
                            deleteMutation.mutate(tmpl.id);
                          }
                        }}
                        className="p-2 text-ink-secondary hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}