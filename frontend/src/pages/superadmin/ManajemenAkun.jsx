import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, Plus, Search, ToggleLeft, ToggleRight, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../utils/api';

function CreateAccountModal({ activeTab, rwOptions, onClose, onSuccess }) {
  const isRt = activeTab === 'rt';
  const [form, setForm] = useState({
    no_rt: '',
    no_rw: '',
    rw_id: '',
    nama_ketua: '',
    username: '',
    password: '',
    provinsi: '',
    kota: '',
    kecamatan: '',
    kelurahan_desa: '',
  });
  const [loading, setLoading] = useState(false);

  const setField = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async () => {
    const missingRequiredField =
      !form.nama_ketua ||
      !form.username ||
      !form.password ||
      (isRt && (!form.no_rt || !form.rw_id)) ||
      (!isRt && !form.no_rw);

    if (missingRequiredField) {
      toast.error('Lengkapi semua field wajib.');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);

    const endpoint = isRt ? '/superadmin/rt' : '/superadmin/rw';
    const payload = isRt
      ? {
          no_rt: form.no_rt,
          rw_id: form.rw_id,
          nama_ketua: form.nama_ketua,
          username: form.username,
          password: form.password,
          provinsi: form.provinsi,
          kota: form.kota,
          kecamatan: form.kecamatan,
          kelurahan_desa: form.kelurahan_desa,
        }
      : {
          rw_id: form.rw_id || `RW${form.no_rw}`,
          no_rw: form.no_rw,
          nama_ketua: form.nama_ketua,
          username: form.username,
          password: form.password,
          provinsi: form.provinsi,
          kota: form.kota,
          kecamatan: form.kecamatan,
          kelurahan_desa: form.kelurahan_desa,
        };

    const { error } = await api.post(endpoint, payload);
    setLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success(`Akun ${activeTab.toUpperCase()} berhasil ditambahkan`);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--color-surface-card)] p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-ink">Tambah Akun {activeTab.toUpperCase()}</h3>
          <button onClick={onClose} className="text-ink-muted transition hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {isRt ? (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-secondary">No. RT *</label>
                <input
                  value={form.no_rt}
                  onChange={setField('no_rt')}
                  placeholder="Contoh: 002"
                  className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-secondary">RW Induk *</label>
                <select
                  value={form.rw_id}
                  onChange={setField('rw_id')}
                  className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">-- Pilih RW --</option>
                  {rwOptions.map((rw) => (
                    <option key={rw.rw_id} value={rw.rw_id}>
                      {rw.rw_id} - {rw.kelurahan_desa || rw.nama_ketua}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-secondary">No. RW *</label>
                <input
                  value={form.no_rw}
                  onChange={setField('no_rw')}
                  placeholder="Contoh: 002"
                  className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-secondary">
                  ID RW (opsional)
                </label>
                <input
                  value={form.rw_id}
                  onChange={setField('rw_id')}
                  placeholder="Contoh: RW002"
                  className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </>
          )}

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-ink-secondary">Nama Ketua *</label>
            <input
              value={form.nama_ketua}
              onChange={setField('nama_ketua')}
              placeholder="Nama lengkap ketua"
              className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-secondary">Username *</label>
            <input
              value={form.username}
              onChange={setField('username')}
              placeholder="Username login"
              className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-secondary">Password *</label>
            <input
              type="password"
              value={form.password}
              onChange={setField('password')}
              placeholder="Min. 6 karakter"
              className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-secondary">Provinsi</label>
            <input
              value={form.provinsi}
              onChange={setField('provinsi')}
              className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-secondary">
              Kota/Kabupaten
            </label>
            <input
              value={form.kota}
              onChange={setField('kota')}
              className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-secondary">Kecamatan</label>
            <input
              value={form.kecamatan}
              onChange={setField('kecamatan')}
              className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-secondary">
              Kelurahan/Desa
            </label>
            <input
              value={form.kelurahan_desa}
              onChange={setField('kelurahan_desa')}
              className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl bg-surface-muted px-4 py-2 text-sm font-semibold text-ink hover:bg-slate-200"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManajemenAkun() {
  const [activeTab, setActiveTab] = useState('rt');
  const [search, setSearch] = useState('');
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

  const { data: rwOptions = [] } = useQuery({
    queryKey: ['superadmin-users', 'rw-options'],
    queryFn: async () => {
      const { data, error } = await api.get('/superadmin/rw');
      if (error) throw new Error(error);
      return data?.data || [];
    },
    enabled: activeTab === 'rt' && showCreateModal,
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
    onError: () => toast.error('Gagal mengubah status akun'),
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

  const filtered = users.filter(
    (user) =>
      !search ||
      user.nama_ketua?.toLowerCase().includes(search.toLowerCase()) ||
      user.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {showCreateModal && (
        <CreateAccountModal
          activeTab={activeTab}
          rwOptions={rwOptions}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['superadmin-users'] })}
        />
      )}

      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink">Manajemen Akun RT/RW</h1>
            <p className="mt-0.5 text-sm text-ink-secondary">
              Kelola akun Ketua RT dan Ketua RW
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            Tambah Akun
          </button>
        </div>

        <div className="mb-4 flex gap-1 border-b border-surface-border">
          {['rt', 'rw'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-4 pb-2.5 text-sm font-medium transition ${
                activeTab === tab
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-ink-secondary hover:text-ink'
              }`}
            >
              {tab.toUpperCase()} ({users.length})
            </button>
          ))}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Cari ketua ${activeTab.toUpperCase()}...`}
            className="w-full rounded-lg border border-surface-border py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="overflow-hidden overflow-x-auto rounded-xl border border-surface-border bg-[var(--color-surface-card)]">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                  {activeTab === 'rt' ? 'RT' : 'RW'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                  Ketua
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                  Username
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                  Wilayah
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filtered.map((user) => {
                const id = user.rt_id || user.rw_id;
                const number = user.no_rt || user.no_rw;

                return (
                  <tr key={id} className="transition hover:bg-surface-muted/30">
                    <td className="px-4 py-3 font-mono text-xs font-semibold">
                      {activeTab.toUpperCase()} {number}
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">{user.nama_ketua}</td>
                    <td className="px-4 py-3 text-ink-secondary">{user.username}</td>
                    <td className="px-4 py-3 text-xs text-ink-secondary">{user.kelurahan_desa}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          user.is_active !== false
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-[var(--color-danger-light)] text-[var(--color-danger)]'
                        }`}
                      >
                        {user.is_active !== false ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleMutation.mutate({ role: activeTab, id })}
                          title="Toggle aktif/nonaktif"
                          className="rounded-lg p-1.5 text-ink-secondary transition hover:bg-brand-50 hover:text-brand-600"
                        >
                          {user.is_active !== false ? (
                            <ToggleRight className="h-4 w-4" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleResetPassword(user)}
                          title="Reset password"
                          className="rounded-lg p-1.5 text-ink-secondary transition hover:bg-amber-50 hover:text-amber-600"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Hapus akun ${user.nama_ketua}? Tindakan ini tidak bisa dibatalkan.`
                              )
                            ) {
                              deleteMutation.mutate({ role: activeTab, id });
                            }
                          }}
                          title="Hapus akun"
                          className="rounded-lg p-1.5 text-ink-secondary transition hover:bg-[var(--color-danger-light)] hover:text-[var(--color-danger)]"
                        >
                          <Trash2 className="h-4 w-4" />
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
    </>
  );
}
