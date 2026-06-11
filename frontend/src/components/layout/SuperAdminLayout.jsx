import { Home, Folder, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AppLayout from './AppLayout';

const NAV = [
  { to: '/superadmin/dashboard', icon: <Home className="w-5 h-5" />, label: 'Kelola Akun RT/RW' },
  { to: '/superadmin/template', icon: <Folder className="w-5 h-5" />, label: 'Kelola Template' },
  { to: '/superadmin/surat-manual', icon: <FileText className="w-5 h-5" />, label: 'Permintaan Manual' },
];

const SuperAdminLayout = () => {
  const { user } = useAuth();

  return (
    <AppLayout
      navItems={NAV}
      userDisplay={user?.username}
      roleBadgeText="Superadmin"
      roleBadgeColor="bg-purple-500"
    />
  );
};

export default SuperAdminLayout;
