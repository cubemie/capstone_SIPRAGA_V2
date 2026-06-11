import PageHeader from '../../components/ui/PageHeader';

export default function RTRWProfil() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader 
        title="Profil RT/RW" 
        subtitle="Kelola informasi profil akun Anda." 
      />
      <div className="bg-white border border-neutral-100 rounded-lg p-6 shadow-sm">
        <p className="text-gray-500 text-sm">Pengaturan profil akan tersedia pada pembaruan berikutnya.</p>
      </div>
    </div>
  );
}
