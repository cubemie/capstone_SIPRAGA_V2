// frontend/src/pages/warga/ProfilWarga.jsx
// GET  /api/warga/profil
// PUT  /api/warga/lengkapi-data  (multipart)

import { useEffect, useState } from 'react';
import { User, CheckCircle } from 'lucide-react';
import { wargaService } from '../../services';
import FileDropzone from '../../components/ui/FileDropzone';
import PageHeader from '../../components/ui/PageHeader';

const AGAMA = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];
const STATUS_KAWIN = ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'];

const Field = ({ label, value }) => (
    <div>
        <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
        <dd className="text-sm font-medium text-gray-800">{value || '—'}</dd>
    </div>
);

const ProfilWarga = () => {
    const [profil, setProfil] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);

    const [form, setForm] = useState({
        alamat: '', provinsi: '', kota: '', kecamatan: '', kelurahan_desa: '',
        rt: '', rw: '', agama: '', status_perkawinan: '', pekerjaan: '',
        kewarganegaraan: 'WNI', negara: 'Indonesia',
    });
    const [ktpFile, setKtpFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');
    const [saveError, setSaveError] = useState('');

    const load = () => {
        setLoading(true);
        wargaService
            .getProfil()
            .then((res) => {
                const p = res.data ?? res;
                setProfil(p);
                setForm({
                    alamat: p.alamat ?? '',
                    provinsi: p.provinsi ?? '',
                    kota: p.kota ?? '',
                    kecamatan: p.kecamatan ?? '',
                    kelurahan_desa: p.kelurahan_desa ?? '',
                    rt: p.rt ?? '',
                    rw: p.rw ?? '',
                    agama: p.agama ?? '',
                    status_perkawinan: p.status_perkawinan ?? '',
                    pekerjaan: p.pekerjaan ?? '',
                    kewarganegaraan: p.kewarganegaraan ?? 'WNI',
                    negara: p.negara ?? 'Indonesia',
                });
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSave = async (e) => {
        e.preventDefault();
        setSaveError(''); setSaveMsg('');
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        if (ktpFile) fd.append('foto_ktp', ktpFile);
        try {
            setSaving(true);
            await wargaService.lengkapiData(fd);
            setSaveMsg('Profil berhasil disimpan.');
            setEditMode(false);
            setKtpFile(null);
            load();
        } catch (err) {
            setSaveError(err?.message ?? 'Gagal menyimpan. Coba lagi.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white border border-neutral-100 rounded-lg p-5 animate-pulse h-32" />
                ))}
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Profil Saya"
                subtitle="Kelola informasi akun dan data kependudukan"
                actions={
                    !editMode && (
                        <button
                            onClick={() => setEditMode(true)}
                            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded text-sm font-medium transition-colors"
                        >
                            Edit Profil
                        </button>
                    )
                }
            />

            {saveMsg && (
                <div role="alert" className="bg-success/10 border border-success/20 text-success p-4 rounded-lg mb-5 text-sm">
                    <CheckCircle className="inline w-4 h-4 mr-1" /> {saveMsg}
                </div>
            )}

            <div className="bg-white border border-neutral-100 rounded-lg shadow-sm p-5 mb-5">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-light/20 flex items-center justify-center text-primary flex-shrink-0"><User className="w-6 h-6" /></div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-neutral-900">{profil?.nama ?? '—'}</h2>
                        <p className="text-sm text-gray-500 font-mono mt-0.5">{profil?.NIK ?? '—'}</p>
                        <p className="text-xs text-gray-400">{profil?.email ?? '—'}</p>
                    </div>
                </div>
            </div>

            {editMode ? (
                <form onSubmit={handleSave} className="space-y-5">
                    <div className="bg-white border border-neutral-100 rounded-lg p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Alamat & Wilayah</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="alamat" className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                                <textarea id="alamat" name="alamat" rows={3} value={form.alamat} onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                    { name: 'provinsi', label: 'Provinsi' },
                                    { name: 'kota', label: 'Kota / Kabupaten' },
                                    { name: 'kecamatan', label: 'Kecamatan' },
                                    { name: 'kelurahan_desa', label: 'Kelurahan / Desa' },
                                    { name: 'rt', label: 'Nomor RT', placeholder: '001' },
                                    { name: 'rw', label: 'Nomor RW', placeholder: '005' },
                                ].map(({ name, label, placeholder }) => (
                                    <div key={name}>
                                        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                                        <input id={name} name={name} value={form[name]} onChange={handleChange}
                                            placeholder={placeholder}
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-neutral-100 rounded-lg p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Data Kependudukan</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="agama" className="block text-sm font-medium text-gray-700 mb-1">Agama</label>
                                <select id="agama" name="agama" value={form.agama} onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Pilih agama</option>
                                    {AGAMA.map((a) => <option key={a}>{a}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="status_perkawinan" className="block text-sm font-medium text-gray-700 mb-1">Status Perkawinan</label>
                                <select id="status_perkawinan" name="status_perkawinan" value={form.status_perkawinan} onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Pilih status</option>
                                    {STATUS_KAWIN.map((s) => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="pekerjaan" className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan</label>
                                <input id="pekerjaan" name="pekerjaan" value={form.pekerjaan} onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="kewarganegaraan" className="block text-sm font-medium text-gray-700 mb-1">Kewarganegaraan</label>
                                <input id="kewarganegaraan" name="kewarganegaraan" value={form.kewarganegaraan} onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-neutral-100 rounded-lg p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Foto KTP</h3>
                        {profil?.foto_ktp && (
                            <div className="mb-3">
                                <p className="text-xs text-gray-500 mb-1">KTP saat ini:</p>
                                <img src={profil.foto_ktp} alt="Foto KTP" className="h-24 rounded border border-neutral-100 object-cover" />
                            </div>
                        )}
                        <FileDropzone accept=".jpg,.jpeg,.png" maxMB={3} value={ktpFile} onChange={setKtpFile}
                            hint="Unggah foto KTP terbaru (opsional, hanya jika ingin mengganti)" />
                    </div>

                    {saveError && (
                        <div role="alert" className="bg-error/10 border border-error/20 text-error p-4 rounded-lg text-sm">{saveError}</div>
                    )}

                    <div className="flex gap-3 justify-end">
                        <button type="button" onClick={() => { setEditMode(false); setSaveError(''); }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-neutral-50">
                            Batal
                        </button>
                        <button type="submit" disabled={saving}
                            className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-colors">
                            {saving && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-5">
                    <div className="bg-white border border-neutral-100 rounded-lg p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Alamat & Wilayah</h3>
                        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                            <Field label="Alamat" value={profil?.alamat} />
                            <Field label="Provinsi" value={profil?.provinsi} />
                            <Field label="Kota / Kabupaten" value={profil?.kota} />
                            <Field label="Kecamatan" value={profil?.kecamatan} />
                            <Field label="Kelurahan / Desa" value={profil?.kelurahan_desa} />
                            <Field label="RT / RW" value={profil?.rt && profil?.rw ? `${profil.rt} / ${profil.rw}` : '—'} />
                        </dl>
                    </div>
                    <div className="bg-white border border-neutral-100 rounded-lg p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Data Kependudukan</h3>
                        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                            <Field label="Tempat, Tanggal Lahir" value={profil?.tempat_lahir && profil?.tanggal_lahir ? `${profil.tempat_lahir}, ${new Date(profil.tanggal_lahir).toLocaleDateString('id-ID')}` : '—'} />
                            <Field label="Jenis Kelamin" value={profil?.jenis_kelamin} />
                            <Field label="Agama" value={profil?.agama} />
                            <Field label="Status Perkawinan" value={profil?.status_perkawinan} />
                            <Field label="Pekerjaan" value={profil?.pekerjaan} />
                            <Field label="Kewarganegaraan" value={profil?.kewarganegaraan} />
                        </dl>
                    </div>
                    {profil?.foto_ktp && (
                        <div className="bg-white border border-neutral-100 rounded-lg p-5 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Foto KTP</h3>
                            <img src={profil.foto_ktp} alt="Foto KTP" className="h-32 rounded-lg border border-neutral-100 object-cover" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfilWarga;