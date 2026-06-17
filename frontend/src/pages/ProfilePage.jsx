import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Camera,
  Edit3,
  FileText,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const GENDER_OPTIONS = ['Laki-laki', 'Perempuan'];
const RELIGION_OPTIONS = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];
const MARITAL_STATUS_OPTIONS = ['Belum Kawin', 'Kawin'];

function toDateInputValue(value) {
  if (!value) return '';
  return String(value).split('T')[0];
}

function buildSections(role) {
  if (role === 'warga') {
    return [
      {
        title: 'Data Registrasi',
        icon: User,
        fields: [
          { name: 'nama', label: 'Nama Lengkap', type: 'text', editable: true },
          { name: 'NIK', label: 'NIK', type: 'text', editable: false },
          { name: 'email', label: 'Email', type: 'email', editable: true },
          { name: 'no_hp', label: 'Nomor HP', type: 'text', editable: true },
        ],
      },
      {
        title: 'Data Pribadi',
        icon: FileText,
        fields: [
          { name: 'tempat_lahir', label: 'Tempat Lahir', type: 'text', editable: true },
          { name: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date', editable: true },
          { name: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'select', editable: true, options: GENDER_OPTIONS },
          { name: 'agama', label: 'Agama', type: 'select', editable: true, options: RELIGION_OPTIONS },
          { name: 'status_perkawinan', label: 'Status Perkawinan', type: 'select', editable: true, options: MARITAL_STATUS_OPTIONS },
          { name: 'pekerjaan', label: 'Pekerjaan', type: 'text', editable: true },
        ],
      },
      {
        title: 'Alamat',
        icon: MapPin,
        fields: [
          { name: 'alamat', label: 'Alamat Lengkap', type: 'textarea', editable: true },
          { name: 'rt', label: 'RT', type: 'text', editable: false },
          { name: 'rw', label: 'RW', type: 'text', editable: false },
          { name: 'kelurahan_desa', label: 'Kelurahan/Desa', type: 'text', editable: true },
          { name: 'kecamatan', label: 'Kecamatan', type: 'text', editable: true },
          { name: 'kota', label: 'Kota/Kabupaten', type: 'text', editable: true },
          { name: 'provinsi', label: 'Provinsi', type: 'text', editable: true },
        ],
      },
    ];
  }

  if (role === 'rt') {
    return [
      {
        title: 'Akun RT',
        icon: Shield,
        fields: [
          { name: 'nama_ketua', label: 'Nama Ketua RT', type: 'text', editable: true },
          { name: 'username', label: 'Username', type: 'text', editable: false },
          { name: 'no_rt', label: 'Nomor RT', type: 'text', editable: false },
          { name: 'rw_id', label: 'ID RW Induk', type: 'text', editable: false },
        ],
      },
      {
        title: 'Kontak',
        icon: Phone,
        fields: [
          { name: 'email', label: 'Email', type: 'email', editable: true },
          { name: 'no_hp', label: 'Nomor HP', type: 'text', editable: true },
          { name: 'alamat', label: 'Alamat Lengkap', type: 'textarea', editable: true },
        ],
      },
      {
        title: 'Wilayah',
        icon: MapPin,
        fields: [
          { name: 'kelurahan_desa', label: 'Kelurahan/Desa', type: 'text', editable: true },
          { name: 'kecamatan', label: 'Kecamatan', type: 'text', editable: true },
          { name: 'kota', label: 'Kota/Kabupaten', type: 'text', editable: true },
          { name: 'provinsi', label: 'Provinsi', type: 'text', editable: true },
        ],
      },
      {
        title: 'Data Tambahan',
        icon: User,
        fields: [
          { name: 'tempat_lahir', label: 'Tempat Lahir', type: 'text', editable: true },
          { name: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date', editable: true },
          { name: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'select', editable: true, options: GENDER_OPTIONS },
        ],
      },
    ];
  }

  if (role === 'rw') {
    return [
      {
        title: 'Akun RW',
        icon: Shield,
        fields: [
          { name: 'nama_ketua', label: 'Nama Ketua RW', type: 'text', editable: true },
          { name: 'username', label: 'Username', type: 'text', editable: false },
          { name: 'rw_id', label: 'ID RW', type: 'text', editable: false },
          { name: 'no_rw', label: 'Nomor RW', type: 'text', editable: false },
        ],
      },
      {
        title: 'Kontak',
        icon: Phone,
        fields: [
          { name: 'email', label: 'Email', type: 'email', editable: true },
          { name: 'no_hp', label: 'Nomor HP', type: 'text', editable: true },
          { name: 'alamat', label: 'Alamat Lengkap', type: 'textarea', editable: true },
        ],
      },
      {
        title: 'Wilayah',
        icon: MapPin,
        fields: [
          { name: 'kelurahan_desa', label: 'Kelurahan/Desa', type: 'text', editable: true },
          { name: 'kecamatan', label: 'Kecamatan', type: 'text', editable: true },
          { name: 'kota', label: 'Kota/Kabupaten', type: 'text', editable: true },
          { name: 'provinsi', label: 'Provinsi', type: 'text', editable: true },
        ],
      },
      {
        title: 'Data Tambahan',
        icon: User,
        fields: [
          { name: 'tempat_lahir', label: 'Tempat Lahir', type: 'text', editable: true },
          { name: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date', editable: true },
          { name: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'select', editable: true, options: GENDER_OPTIONS },
        ],
      },
    ];
  }

  return [
    {
      title: 'Akun Superadmin',
      icon: Shield,
      fields: [
        { name: 'username', label: 'Username', type: 'text', editable: false },
        { name: 'nama_lengkap', label: 'Nama Lengkap', type: 'text', editable: true },
        { name: 'email', label: 'Email', type: 'email', editable: true },
        { name: 'no_hp', label: 'Nomor HP', type: 'text', editable: true },
      ],
    },
    {
      title: 'Data Tambahan',
      icon: MapPin,
      fields: [
        { name: 'alamat', label: 'Alamat Lengkap', type: 'textarea', editable: true },
        { name: 'tempat_lahir', label: 'Tempat Lahir', type: 'text', editable: true },
        { name: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date', editable: true },
        { name: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'select', editable: true, options: GENDER_OPTIONS },
      ],
    },
  ];
}

function buildInitialForm(profile) {
  return {
    nama: profile?.nama || '',
    nama_ketua: profile?.nama_ketua || '',
    nama_lengkap: profile?.nama_lengkap || '',
    username: profile?.username || '',
    NIK: profile?.NIK || '',
    email: profile?.email || '',
    no_hp: profile?.no_hp || '',
    alamat: profile?.alamat || '',
    tempat_lahir: profile?.tempat_lahir || '',
    tanggal_lahir: toDateInputValue(profile?.tanggal_lahir),
    jenis_kelamin: profile?.jenis_kelamin || '',
    agama: profile?.agama || '',
    status_perkawinan: profile?.status_perkawinan || '',
    pekerjaan: profile?.pekerjaan || '',
    rt: profile?.rt || '',
    rw: profile?.rw || '',
    no_rt: profile?.no_rt || '',
    no_rw: profile?.no_rw || '',
    rw_id: profile?.rw_id || '',
    kelurahan_desa: profile?.kelurahan_desa || '',
    kecamatan: profile?.kecamatan || '',
    kota: profile?.kota || '',
    provinsi: profile?.provinsi || '',
  };
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await api.get('/auth/profile');
      if (error) throw new Error(error);
      return data?.data;
    },
  });

  const role = profile?.role || user?.role || 'warga';
  const sections = useMemo(() => buildSections(role), [role]);

  useEffect(() => {
    if (!profile) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(buildInitialForm(profile));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAvatarPreview(profile.avatar_url || '');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAvatarFile(null);
  }, [profile]);

  const mutation = useMutation({
    mutationFn: async ({ values, file }) => {
      const payload = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        payload.append(key, value ?? '');
      });

      if (file) {
        payload.append('avatar', file);
      }

      const { data, error } = await api.putFormData('/auth/profile', payload);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      toast.success('Profil berhasil diperbarui');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
      setAvatarFile(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal memperbarui profil');
    },
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Foto profil harus berupa gambar.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran foto profil maksimal 2 MB.');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCancel = () => {
    if (profile) {
      setFormData(buildInitialForm(profile));
      setAvatarPreview(profile.avatar_url || '');
    }
    setAvatarFile(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    mutation.mutate({ values: formData, file: avatarFile });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-40 animate-pulse rounded-xl bg-surface-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink">Profil Saya</h1>
          <p className="mt-0.5 text-sm text-ink-secondary">
            Data registrasi tampil sebagai data awal. Field tambahan bisa kamu lengkapi sendiri.
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Profil
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="rounded-lg bg-surface-muted px-4 py-2 text-sm text-ink-secondary transition hover:bg-surface-border"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={mutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        )}
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="rounded-xl border border-surface-border bg-[var(--color-surface-card)] p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-secondary">
            Foto Profil
          </p>
          <div className="flex flex-col items-center text-center">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Foto profil"
                className="mb-4 h-32 w-32 rounded-full border border-surface-border object-cover"
              />
            ) : (
              <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full border border-dashed border-surface-border bg-surface-muted text-ink-muted">
                <User className="h-10 w-10" />
              </div>
            )}

            <p className="text-sm font-semibold text-ink">
              {formData.nama || formData.nama_ketua || formData.nama_lengkap || formData.username || '-'}
            </p>
            <p className="mt-1 text-xs text-ink-secondary">{role.toUpperCase()}</p>

            {isEditing && (
              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-surface-border px-3 py-2 text-sm text-ink-secondary transition hover:bg-surface-muted">
                <Camera className="h-4 w-4" />
                Ganti Foto
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            )}
          </div>
        </div>

        {profile?.foto_ktp && (
          <div className="rounded-xl border border-surface-border bg-[var(--color-surface-card)] p-5">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              <FileText className="h-3.5 w-3.5" />
              Dokumen Registrasi
            </p>
            <img
              src={profile.foto_ktp}
              alt="Foto KTP"
              className="h-48 w-full rounded-lg border border-surface-border object-cover md:h-56"
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-xl border border-surface-border bg-[var(--color-surface-card)] p-4"
          >
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              <section.icon className="h-3.5 w-3.5" />
              {section.title}
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {section.fields.map((field) => {
                const disabled = !isEditing || !field.editable;
                const value = formData[field.name] ?? '';
                const wrapperClass =
                  field.type === 'textarea' ? 'md:col-span-2' : '';

                return (
                  <div key={field.name} className={wrapperClass}>
                    <label className="mb-1 block text-xs font-medium text-ink-secondary">
                      {field.label}
                      {!field.editable && (
                        <span className="ml-1 font-normal text-ink-muted">(tetap)</span>
                      )}
                    </label>

                    {field.type === 'textarea' ? (
                      <textarea
                        value={value}
                        onChange={(event) => handleChange(field.name, event.target.value)}
                        disabled={disabled}
                        rows={3}
                        className={`w-full resize-none rounded-lg border px-3 py-2 text-sm transition ${
                          disabled
                            ? 'border-surface-border bg-surface-muted text-ink-secondary'
                            : 'border-surface-border bg-[var(--color-surface-card)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500'
                        }`}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={value}
                        onChange={(event) => handleChange(field.name, event.target.value)}
                        disabled={disabled}
                        className={`w-full rounded-lg border px-3 py-2 text-sm transition ${
                          disabled
                            ? 'border-surface-border bg-surface-muted text-ink-secondary'
                            : 'border-surface-border bg-[var(--color-surface-card)] focus:outline-none focus:ring-2 focus:ring-brand-500'
                        }`}
                      >
                        <option value="">Pilih {field.label}</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={value}
                        onChange={(event) => handleChange(field.name, event.target.value)}
                        disabled={disabled}
                        className={`w-full rounded-lg border px-3 py-2 text-sm transition ${
                          disabled
                            ? 'border-surface-border bg-surface-muted text-ink-secondary'
                            : 'border-surface-border bg-[var(--color-surface-card)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-surface-border bg-[var(--color-surface-card)] p-4">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-secondary">
            <Mail className="h-3.5 w-3.5" />
            Ringkasan Kontak
          </p>
          <p className="text-sm text-ink">{formData.email || '-'}</p>
          <p className="mt-1 text-sm text-ink-secondary">{formData.no_hp || 'Nomor HP belum diisi'}</p>
        </div>
        <div className="rounded-xl border border-surface-border bg-[var(--color-surface-card)] p-4">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-secondary">
            <MapPin className="h-3.5 w-3.5" />
            Ringkasan Lokasi
          </p>
          <p className="text-sm text-ink">
            {[formData.kelurahan_desa, formData.kecamatan, formData.kota, formData.provinsi]
              .filter(Boolean)
              .join(', ') || 'Lokasi belum lengkap'}
          </p>
        </div>
      </div>
    </div>
  );
}
