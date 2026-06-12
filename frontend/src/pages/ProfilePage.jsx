import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';
import { toast } from 'sonner';
import { Camera, Save, User, X, CheckCircle, Edit3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, login } = useAuth(); // We might need to refresh context user data
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // 1. Fetch Profile Data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await api.get('/auth/profile');
      if (error) throw new Error(error);
      return data?.data || {};
    }
  });

  // Initialize form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  // 2. Update Profile Mutation
  const updateMutation = useMutation({
    mutationFn: async (submitData) => {
      // Use FormData because we might have a file upload
      const form = new FormData();
      
      // Append all text fields
      Object.keys(submitData).forEach(key => {
        if (key !== 'avatar_url' && submitData[key] !== null) {
          form.append(key, submitData[key]);
        }
      });

      // Append file if selected
      if (selectedImage) {
        form.append('avatar', selectedImage);
      }

      // We use fetch directly or our api wrapper if it supports FormData
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: form
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal update profil');
      return data;
    },
    onSuccess: () => {
      toast.success('Profil berhasil diperbarui');
      queryClient.invalidateQueries(['profile']);
      setIsEditing(false);
      setSelectedImage(null);
      
      // If the API returns the updated user, we could update the AuthContext
      // For now, we rely on the next page load or just invalidate queries
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran foto maksimal 2MB');
        return;
      }
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
      setIsEditing(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Memuat profil...</div>;

  const currentAvatar = previewImage || profile?.avatar_url;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil Akun</h1>
          <p className="text-gray-500 text-sm">Kelola informasi data diri dan pengaturan akun Anda.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profil
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Cover Background */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        
        <form onSubmit={handleSubmit} className="px-6 pb-8">
          {/* Avatar Section */}
          <div className="relative flex justify-between items-end -mt-12 mb-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center overflow-hidden shadow-md">
                {currentAvatar ? (
                  <img src={currentAvatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-gray-400" />
                )}
              </div>
              
              {/* Overlay for avatar upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-4 border-transparent"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageSelect}
                accept="image/jpeg,image/png,image/jpg" 
                className="hidden" 
              />
            </div>

            <div className="flex-1 ml-6 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{profile?.nama || profile?.nama_ketua || profile?.username}</h2>
              <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                Role: {user?.role}
              </p>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Common Fields */}
            {profile?.nik !== undefined && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">NIK (Nomor Induk Kependudukan)</label>
                <input
                  type="text"
                  name="nik"
                  value={formData.nik || profile.NIK || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                {user?.role === 'warga' ? 'Nama Lengkap' : 'Nama Ketua'}
              </label>
              <input
                type="text"
                name={user?.role === 'warga' ? 'nama' : 'nama_ketua'}
                value={user?.role === 'warga' ? (formData.nama || '') : (formData.nama_ketua || '')}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
              />
            </div>

            {profile?.email !== undefined && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                />
              </div>
            )}

            {profile?.no_hp !== undefined && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Nomor Telepon / WhatsApp</label>
                <input
                  type="text"
                  name="no_hp"
                  value={formData.no_hp || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                />
              </div>
            )}

            {user?.role === 'warga' && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Jenis Kelamin</label>
                  <select
                    name="jenis_kelamin"
                    value={formData.jenis_kelamin || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Tempat Lahir</label>
                  <input
                    type="text"
                    name="tempat_lahir"
                    value={formData.tempat_lahir || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Tanggal Lahir</label>
                  <input
                    type="date"
                    name="tanggal_lahir"
                    value={formData.tanggal_lahir ? formData.tanggal_lahir.split('T')[0] : ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                  />
                </div>
              </>
            )}

            {/* Address Fields */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">Alamat Lengkap (opsional)</label>
              <textarea
                name="alamat"
                value={formData.alamat || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">No. RT</label>
              <input
                type="text"
                name="rt"
                value={formData.rt || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">No. RW</label>
              <input
                type="text"
                name="rw"
                value={formData.rw || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Provinsi</label>
              <input
                type="text"
                name="provinsi"
                value={formData.provinsi || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Kota/Kabupaten</label>
              <input
                type="text"
                name="kota"
                value={formData.kota || formData.kabupaten || ''}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, kota: e.target.value, kabupaten: e.target.value }))
                }}
                disabled={!isEditing}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Kecamatan</label>
              <input
                type="text"
                name="kecamatan"
                value={formData.kecamatan || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Kelurahan/Desa</label>
              <input
                type="text"
                name="kelurahan_desa"
                value={formData.kelurahan_desa || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
              />
            </div>

          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData(profile); // revert
                  setSelectedImage(null);
                  setPreviewImage(null);
                }}
                disabled={updateMutation.isPending}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? (
                  'Menyimpan...'
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
