import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { getProfile, updateProfile } from '../services/wargaService';

const profileSchema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  no_hp: z.string().min(10, 'Nomor HP minimal 10 digit'),
  alamat: z.string().min(5, 'Alamat terlalu pendek'),
  NIK: z
    .string()
    .length(16, 'NIK harus 16 digit')
    .regex(/^\d+$/, 'NIK hanya boleh angka'),
});

export default function ProfilePage() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    values: profile
      ? {
          nama: profile.nama ?? '',
          email: profile.email ?? '',
          no_hp: profile.no_hp ?? '',
          alamat: profile.alamat ?? '',
          NIK: profile.NIK ?? '',
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success('Profil berhasil diperbarui');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      toast.error('Gagal memperbarui profil');
    },
  });

  const onSubmit = (data) => mutation.mutate(data);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Memuat profil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profil Saya</h1>

      {/* Foto KTP */}
      {profile?.foto_ktp && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Foto KTP</p>
          <img
            src={profile.foto_ktp}
            alt="Foto KTP"
            className="w-48 h-32 object-cover rounded-lg border"
          />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {[
          { name: 'nama', label: 'Nama Lengkap', type: 'text' },
          { name: 'NIK', label: 'NIK (16 digit)', type: 'text' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'no_hp', label: 'Nomor HP', type: 'text' },
          { name: 'alamat', label: 'Alamat', type: 'textarea' },
        ].map(({ name, label, type }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            {type === 'textarea' ? (
              <textarea
                {...register(name)}
                rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <input
                {...register(name)}
                type={type}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            {errors[name] && (
              <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {mutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  );
}
