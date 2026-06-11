import { Home, FileSignature, FileText, ClipboardList, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AppLayout from './AppLayout';

const NAV = [
  { to: '/rtrw/dashboard', icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
  { to: '/rtrw/ttd', icon: <FileSignature className="w-5 h-5" />, label: 'Tanda Tangan Surat' },
  { to: '/rtrw/ajukan', icon: <FileText className="w-5 h-5" />, label: 'Ajukan (Offline)' },
  { to: '/rtrw/riwayat', icon: <ClipboardList className="w-5 h-5" />, label: 'Riwayat Surat' },
  { to: '/rtrw/profil', icon: <User className="w-5 h-5" />, label: 'Profil' },
];

const RTRWLayout = () => {
  const { user } = useAuth();
  const roleLabel = user?.role === 'rt' ? 'RT' : 'RW';

  return (
    <AppLayout
      navItems={NAV}
      userDisplay={user?.nama ?? user?.username}
      roleBadgeText={roleLabel}
      roleBadgeColor="bg-success"
    />
  );
};

export default RTRWLayout;
