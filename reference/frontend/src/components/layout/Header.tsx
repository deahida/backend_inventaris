import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { clsx } from 'clsx';
import { useAuth } from '@/contexts/AuthContext';
import {
  Menu,
  Bell,
  ChevronDown,
  UserCircle,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  isCollapsed: boolean;
}

// Breadcrumb label map (Indonesian)
const pathLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  inventory: 'Inventaris',
  products: 'Produk',
  categories: 'Kategori',
  suppliers: 'Supplier',
  'stock-in': 'Stok Masuk',
  'stock-out': 'Stok Keluar',
  'stock-history': 'Riwayat Stok',
  sales: 'Penjualan',
  new: 'Transaksi Baru',
  employees: 'Karyawan',
  attendance: 'Kehadiran',
  my: 'Kehadiran Saya',
  history: 'Riwayat',
  report: 'Laporan',
  reports: 'Laporan',
  profile: 'Profil',
  settings: 'Pengaturan',
  create: 'Tambah',
  edit: 'Edit',
  monitoring: 'Monitoring',
};

const roleLabels: Record<string, string> = {
  admin: 'Administrator',
  cashier: 'Kasir',
  owner: 'Pemilik',
};

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Generate breadcrumbs from path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const isNumeric = /^\d+$/.test(segment);
    const label = isNumeric ? `#${segment}` : (pathLabels[segment] || segment);
    return { label, path };
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center px-4 lg:px-6 gap-3">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-1 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumb */}
      <nav
        className="hidden sm:flex items-center text-sm flex-1 min-w-0"
        aria-label="Breadcrumb"
      >
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center min-w-0">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-300 mx-1.5 flex-shrink-0" />}
            <span
              className={clsx(
                'truncate',
                index === breadcrumbs.length - 1
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-400'
              )}
            >
              {crumb.label}
            </span>
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-1 ml-auto">
        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Notifikasi"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Notifikasi</p>
              </div>
              <div className="py-2">
                <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                  <p className="text-sm text-gray-700 font-medium">Stok menipis terdeteksi</p>
                  <p className="text-xs text-gray-500 mt-0.5">5 produk di bawah stok minimum</p>
                </div>
                <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                  <p className="text-sm text-gray-700 font-medium">Transaksi baru</p>
                  <p className="text-xs text-gray-500 mt-0.5">INV-260929-0012 telah selesai</p>
                </div>
              </div>
              <div className="px-4 py-2 border-t border-gray-100">
                <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                  Lihat semua notifikasi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-expanded={showDropdown}
            aria-haspopup="true"
          >
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {userInitial}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-700 leading-tight">{user?.name}</p>
              <p className="text-xs text-gray-400 leading-tight">{user?.role ? roleLabels[user.role] : user?.position}</p>
            </div>
            <ChevronDown className={clsx('hidden md:block h-4 w-4 text-gray-400 transition-transform', showDropdown && 'rotate-180')} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
              {/* Mobile-only user info */}
              <div className="px-3 py-2.5 border-b border-gray-100 md:hidden">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role ? roleLabels[user.role] : user?.position}</p>
              </div>

              <button
                onClick={() => { setShowDropdown(false); navigate('/profile'); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <UserCircle className="h-4 w-4 text-gray-400" />
                Profil Saya
              </button>
              <button
                onClick={() => { setShowDropdown(false); navigate('/settings'); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="h-4 w-4 text-gray-400" />
                Pengaturan
              </button>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
