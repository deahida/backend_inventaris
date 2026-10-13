import { useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { clsx } from 'clsx';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  ShoppingCart,
  Receipt,
  Users,
  CalendarCheck,
  BarChart3,
  UserCircle,
  Settings,
  ChevronDown,
  ChevronLeft,
  X,
  Monitor,
} from 'lucide-react';
import type { Role } from '@/types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'cashier', 'owner'],
  },
  {
    label: 'Inventaris',
    path: '/inventory',
    icon: Package,
    roles: ['admin'],
    children: [
      { label: 'Produk', path: '/inventory/products', icon: Package, roles: ['admin'] },
      { label: 'Kategori', path: '/inventory/categories', icon: Tags, roles: ['admin'] },
      { label: 'Supplier', path: '/inventory/suppliers', icon: Truck, roles: ['admin'] },
      { label: 'Stok Masuk', path: '/inventory/stock-in', icon: ArrowDownToLine, roles: ['admin'] },
      { label: 'Stok Keluar', path: '/inventory/stock-out', icon: ArrowUpFromLine, roles: ['admin'] },
      { label: 'Riwayat Stok', path: '/inventory/stock-history', icon: History, roles: ['admin'] },
    ],
  },
  {
    label: 'Penjualan',
    path: '/sales',
    icon: ShoppingCart,
    roles: ['admin', 'cashier'],
    children: [
      { label: 'Transaksi Baru', path: '/sales/new', icon: ShoppingCart, roles: ['admin', 'cashier'] },
      { label: 'Riwayat Transaksi', path: '/sales', icon: Receipt, roles: ['admin', 'cashier'] },
    ],
  },
  {
    label: 'Karyawan',
    path: '/employees',
    icon: Users,
    roles: ['admin'],
    children: [
      { label: 'Data Karyawan', path: '/employees', icon: Users, roles: ['admin'] },
      { label: 'Kehadiran Karyawan', path: '/attendance', icon: CalendarCheck, roles: ['admin'] },
      { label: 'Kehadiran Saya', path: '/attendance/my', icon: CalendarCheck, roles: ['admin'] },
    ],
  },
  {
    label: 'Kehadiran',
    path: '/attendance',
    icon: CalendarCheck,
    roles: ['cashier'],
    children: [
      { label: 'Kehadiran Saya', path: '/attendance/my', icon: CalendarCheck, roles: ['cashier'] },
    ],
  },
  {
    label: 'Monitoring',
    path: '/monitoring',
    icon: Monitor,
    roles: ['owner'],
    children: [
      { label: 'Inventaris', path: '/inventory/products', icon: Package, roles: ['owner'] },
      { label: 'Penjualan', path: '/sales', icon: ShoppingCart, roles: ['owner'] },
      { label: 'Karyawan', path: '/employees', icon: Users, roles: ['owner'] },
    ],
  },
  {
    label: 'Laporan',
    path: '/reports',
    icon: BarChart3,
    roles: ['admin', 'owner'],
    children: [
      { label: 'Laporan Inventaris', path: '/reports/inventory', icon: Package, roles: ['admin', 'owner'] },
      { label: 'Laporan Penjualan', path: '/reports/sales', icon: ShoppingCart, roles: ['admin', 'owner'] },
      { label: 'Laporan Kehadiran', path: '/reports/attendance', icon: CalendarCheck, roles: ['admin', 'owner'] },
    ],
  },
  {
    label: 'Profil',
    path: '/profile',
    icon: UserCircle,
    roles: ['admin', 'cashier', 'owner'],
  },
  {
    label: 'Pengaturan',
    path: '/settings',
    icon: Settings,
    roles: ['admin'],
  },
];

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export function Sidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(() => {
    // Auto-expand the menu that contains the current route
    const expanded: string[] = [];
    navigation.forEach((item) => {
      if (item.children?.some((child) => location.pathname.startsWith(child.path))) {
        expanded.push(item.path);
      }
    });
    return expanded;
  });

  const toggleMenu = (path: string) => {
    setExpandedMenus((prev) =>
      prev.includes(path)
        ? prev.filter((p) => p !== path)
        : [...prev, path]
    );
  };

  const filteredNav = navigation.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const isActiveRoute = (path: string) => {
    if (path === '/sales' && location.pathname === '/sales') return true;
    if (path === '/employees' && location.pathname === '/employees') return true;
    if (path === '/attendance' && location.pathname === '/attendance') return true;
    return location.pathname === path;
  };

  const isParentActive = (item: NavItem) => {
    if (!item.children) return false;
    return item.children.some((child) => location.pathname.startsWith(child.path));
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full bg-slate-900 text-white z-50 transition-all duration-300 flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'lg:w-16' : 'lg:w-64',
          'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700/50">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm">
                PC
              </div>
              <div>
                <h1 className="text-base font-bold">PRO.COM</h1>
                <p className="text-[10px] text-slate-400 -mt-0.5">Store Management</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="mx-auto h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm">
              PC
            </div>
          )}
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1 text-slate-400 hover:text-white rounded"
            aria-label={isCollapsed ? 'Perluas menu' : 'Kecilkan menu'}
          >
            <ChevronLeft className={clsx('h-4 w-4 transition-transform', isCollapsed && 'rotate-180')} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {filteredNav.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenus.includes(item.path);
            const parentActive = isParentActive(item);

            if (hasChildren) {
              return (
                <div key={item.path}>
                  <button
                    onClick={() => toggleMenu(item.path)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      parentActive
                        ? 'text-white bg-slate-800'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          className={clsx(
                            'h-4 w-4 transition-transform',
                            isExpanded && 'rotate-180'
                          )}
                        />
                      </>
                    )}
                  </button>
                  {isExpanded && !isCollapsed && (
                    <div className="mt-0.5 ml-4 pl-3 border-l border-slate-700 space-y-0.5">
                      {item.children!
                        .filter((child) => user && child.roles.includes(user.role))
                        .map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            end={child.path === '/sales' || child.path === '/employees' || child.path === '/attendance'}
                            onClick={onClose}
                            className={({ isActive }) =>
                              clsx(
                                'flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors',
                                isActive || isActiveRoute(child.path)
                                  ? 'text-white bg-indigo-600'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                              )
                            }
                          >
                            <child.icon className="h-4 w-4 flex-shrink-0" />
                            <span>{child.label}</span>
                          </NavLink>
                        ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-white bg-indigo-600'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  )
                }
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        {!isCollapsed && user && (
          <div className="p-3 border-t border-slate-700/50">
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-medium">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.position}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
