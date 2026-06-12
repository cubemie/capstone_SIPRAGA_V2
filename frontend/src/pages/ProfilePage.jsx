// frontend/src/pages/ProfilePage.jsx
// Tampilkan SEMUA data dari registrasi, termasuk field yang read-only

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { api } from '../utils/api';
import { User, MapPin, FileText, Phone, Mail, Edit3, Save } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';

const profileSchema = z.object({
  nama:             z.string().min(3, 'Nama minimal 3 karakter'),
  email:            z.string().email('Email tidak valid'),
  no_hp:            z.string().min(10, 'Nomor HP minimal 10 digit'),
  alamat:           z.string().min(5, 'Alamat terlalu pendek'),
  NIK:              z.string().length(16, 'NIK harus 16 digit').regex(/^\d+$/, 'NIK hanya angka'),
  tempat_lahir:     z.string().optional(),
  tanggal_lahir:    z.string().optional(),
  jenis_kelamin:    z.enum(['Laki-laki', 'Perempuan']).optional(),
  agama:            z.string().optional(),
  status_perkawinan:z.enum(['Belum Kawin', 'Kawin']).optional(),
  pekerjaan:        z.string().optional(),
});

const FIELD_SECTIONS = [
  {
    title: 'Data Pribadi',
    icon: User,
    fields: [
      { name: 'nama',          label: 'Nama Lengkap',    type: 'text',   editable: true },
      { name: 'NIK',           label: 'NIK',             type: 'text',   editable: true },
      { name: 'tempat_lahir',  label: 'Tempat Lahir',    type: 'text',   editable: true },
      { name: 'tanggal_lahir', label: 'Tanggal Lahir',   type: 'date',   editable: true },
      {
        name: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'select', editable: true,
        options: ['Laki-laki', 'Perempuan'],
      },
      {
        name: 'agama', label: 'Agama', type: 'select', editable: true,
        options: ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'],
      },
      {
        name: 'status_perkawinan', label: 'Status Perkawinan', type: 'select', editable: true,
        options: ['Belum Kawin', 'Kawin'],
      },
      { name: 'pekerjaan', label: 'Pekerjaan', type: 'text', editable: true },
    ],
  },
  {
    title: 'Kontak',
    icon: Phone,
    fields: [
      { name: 'email', label: 'Email', type: 'email', editable: true },
      { name: 'no_hp', label: 'Nomor HP / WhatsApp', type: 'text', editable: true },
    ],
  },
  {
    title: 'Alamat',
    icon: MapPin,
    fields: [
      { name: 'alamat',         label: 'Alamat Lengkap', type: 'textarea', editable: true },
      { name: 'rt',             label: 'RT',             type: 'text',     editable: false },
      { name: 'rw',             label: 'RW',             type: 'text',     editable: false },
      { name: 'kelurahan_desa', label: 'Kelurahan/Desa', type: 'text',     editable: true },
      { name: 'kecamatan',      label: 'Kecamatan',      type: 'text',     editable: true },
      { name: 'kota',           label: 'Kota/Kabupaten', type: 'text',     editable: false },
      { name: 'provinsi',       label: 'Provinsi',       type: 'text',     editable: false },
    ],
  },
];

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = React.useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await api.get('/warga/profile');
      if (error) throw new Error(error);
      return data?.data;
    },
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(profileSchema),
    values: profile ? {
      nama:              profile.nama ?? '',
      email:             profile.email ?? '',
      no_hp:             profile.no_hp ?? '',
      alamat:            profile.alamat ?? '',
      NIK:               profile.NIK ?? '',
      tempat_lahir:      profile.tempat_lahir ?? '',
      tanggal_lahir:     profile.tanggal_lahir?.split('T')[0] ?? '',
      jenis_kelamin:     profile.jenis_kelamin ?? 'Laki-laki',
      agama:             profile.agama ?? '',
      status_perkawinan: profile.status_perkawinan ?? 'Belum Kawin',
      pekerjaan:         profile.pekerjaan ?? '',
    } : undefined,
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const { data: res, error } = await api.put('/warga/profile', data);
      if (error) throw new Error(error);
      return res;
    },
    onSuccess: () => {
      toast.success('Profil berhasil diperbarui');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
    },
    onError: (e) => toast.error(e.message || 'Gagal memperbarui profil'),
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-40 bg-surface-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-ink">Profil Saya</h1>
          <p className="text-sm text-ink-secondary mt-0.5">
            Data yang kamu isi saat registrasi
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Profil
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => { setIsEditing(false); reset(); }}
              className="px-4 py-2 bg-surface-muted text-ink-secondary text-sm rounded-lg hover:bg-surface-border transition"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit((data) => mutation.mutate(data))}
              disabled={mutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        )}
      </div>

      {/* Foto KTP */}
      {profile?.foto_ktp && (
        <div className="bg-white border border-surface-border rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" />
            Foto KTP
          </p>
          <img
            src={profile.foto_ktp}
            alt="Foto KTP"
            className="w-48 h-32 object-cover rounded-lg border border-surface-border"
          />
        </div>
      )}

      {/* Form sections */}
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        {FIELD_SECTIONS.map((section) => (
          <div key={section.title} className="bg-white border border-surface-border rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <section.icon className="w-3.5 h-3.5" />
              {section.title}
            </p>
            <div className="space-y-3">
              {section.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">
                    {field.label}
                    {!field.editable && (
                      <span className="ml-1 text-ink-muted font-normal">(tidak dapat diubah)</span>
                    )}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      {...register(field.name)}
                      rows={3}
                      disabled={!isEditing || !field.editable}
                      className={`w-full px-3 py-2 text-sm rounded-lg border resize-none transition
                        ${!isEditing || !field.editable
                          ? 'bg-surface-muted border-surface-border text-ink-secondary'
                          : 'bg-white border-surface-border focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'
                        }
                        ${errors[field.name] ? 'border-red-400 bg-red-50' : ''}
                      `}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      {...register(field.name)}
                      disabled={!isEditing || !field.editable}
                      className={`w-full px-3 py-2 text-sm rounded-lg border transition
                        ${!isEditing || !field.editable
                          ? 'bg-surface-muted border-surface-border text-ink-secondary'
                          : 'bg-white border-surface-border focus:outline-none focus:ring-2 focus:ring-brand-500'
                        }
                      `}
                    >
                      {field.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      {...register(field.name)}
                      type={field.type}
                      disabled={!isEditing || !field.editable}
                      className={`w-full px-3 py-2 text-sm rounded-lg border transition
                        ${!isEditing || !field.editable
                          ? 'bg-surface-muted border-surface-border text-ink-secondary'
                          : 'bg-white border-surface-border focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'
                        }
                        ${errors[field.name] ? 'border-red-400 bg-red-50' : ''}
                      `}
                    />
                  )}
                  {errors[field.name] && (
                    <p className="text-xs text-red-500 mt-1">{errors[field.name].message}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </form>
    </div>
  );
}