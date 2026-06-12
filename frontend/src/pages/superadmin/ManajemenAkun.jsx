// frontend/src/pages/superadmin/ManajemenAkun.jsx — FILE BARU

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../../utils/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Plus, Trash2, KeyRound, ToggleLeft, ToggleRight, Search } from 'lucide-react';

export default function ManajemenAkun() {
  const [activeTab, setActiveTab] = useState('rt'); // 'rt' | 'rw'
  const [search, setSearch]       = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['superadmin-users', activeTab],
    queryFn: async () => {
      const { data, error } = await api.get(`/superadmin/${activeTab}`);
      if (error) throw new Error(error);
      return data?.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ role, id }) => api.delete(`/superadmin/users/${role}/${id}`),
    onSuccess: () => {
      toast.success('Akun berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['superadmin-users'] });
    },
    onError: () => toast.error('Gagal menghapus akun'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ role, id }) => api.patch(`/superadmin/users/${role}/${id}/toggle-active`),
    onSuccess: () => {
      toast.success('Status akun diubah');
      queryClient.invalidateQueries({ queryKey: ['superadmin-users'] });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ role, id, password }) =>
      api.patch(`/superadmin/users/${role}/${id}/reset-password`, { new_password: password }),
    onSuccess: () => toast.success('Password berhasil direset'),
    onError: () => toast.error('Gagal reset password'),
  });

  const handleResetPassword = (user) => {
    const newPass = prompt(`Masukkan password baru untuk ${user.nama_ketua}:`);
    if (!newPass || newPass.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    resetPasswordMutation.mutate({
      role: activeTab,
      id: user.rt_id || user.rw_id,
      password: newPass,
    });
  };

  const filtered = users.filter(u =>
    !search ||
    u.nama_ketua?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-ink">Manajemen Akun RT/RW</h1>
            <p className="text-sm text-ink-secondary mt-0.5">Kelola akun Ketua RT dan Ketua RW</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition"
          >
            <Plus className="w-4 h-4" />
            Tambah Akun
          </button>
        </div>

        {/* Tab RT / RW */}
        <div className="flex gap-1 border-b border-surface-border mb-4">
          {['rt', 'rw'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 px-4 text-sm font-medium border-b-2 transition ${
                activeTab === tab
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-ink-secondary hover:text-ink'
              }`}
            >
              {tab.toUpperCase()} ({users.length})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Cari ketua ${activeTab.toUpperCase()}...`}
            className="w-full pl-9 pr-4 py-2 text-sm border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Tabel */}
        <div className="bg-white border border-surface-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                  {activeTab === 'rt' ? 'RT' : 'RW'}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                  Ketua
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                  Username
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                  Wilayah
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filtered.map(user => {
                const id = user.rt_id || user.rw_id;
                const no = user.no_rt || user.no_rw;
                return (
                  <tr key={id} className="hover:bg-surface-muted/30 transition">
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{activeTab.toUpperCase()} {no}</td>
                    <td className="px-4 py-3 font-medium text-ink">{user.nama_ketua}</td>
                    <td className="px-4 py-3 text-ink-secondary">{user.username}</td>
                    <td className="px-4 py-3 text-xs text-ink-secondary">{user.kelurahan_desa}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        user.is_active !== false
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-600'
                      }`}>
                        {user.is_active !== false ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleMutation.mutate({ role: activeTab, id })}
                          title="Toggle aktif/nonaktif"
                          className="p-1.5 text-ink-secondary hover:text-brand-600 rounded-lg hover:bg-brand-50 transition"
                        >
                          {user.is_active !== false
                            ? <ToggleRight className="w-4 h-4" />
                            : <ToggleLeft className="w-4 h-4" />
                          }
                        </button>
                        <button
                          onClick={() => handleResetPassword(user)}
                          title="Reset password"
                          className="p-1.5 text-ink-secondary hover:text-amber-600 rounded-lg hover:bg-amber-50 transition"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus akun ${user.nama_ketua}? Tindakan ini tidak bisa dibatalkan.`)) {
                              deleteMutation.mutate({ role: activeTab, id });
                            }
                          }}
                          title="Hapus akun"
                          className="p-1.5 text-ink-secondary hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && !isLoading && (
            <div className="py-12 text-center text-ink-muted">
              <p className="text-sm">Tidak ada data {activeTab.toUpperCase()}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}