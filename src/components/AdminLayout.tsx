import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  CalendarDays,
  BarChart3,
  Settings,
  LogOut,
  User,
  ChevronRight,
  Menu,
  X,
  Building2,
  Shield,
  Wrench,
  Users,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { User as UserType } from '../../shared/types';

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: UserType['role'][];
}

const menuItems: MenuItem[] = [
  {
    label: '大屏监控',
    path: '/admin/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['admin', 'restorer', 'security', 'guide'],
  },
  {
    label: '藏品管理',
    path: '/admin/collections',
    icon: <Package className="w-5 h-5" />,
    roles: ['admin', 'restorer'],
  },
  {
    label: '排班管理',
    path: '/admin/schedules',
    icon: <CalendarDays className="w-5 h-5" />,
    roles: ['admin', 'security', 'guide'],
  },
  {
    label: '数据统计',
    path: '/admin/statistics',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: '系统设置',
    path: '/admin/settings',
    icon: <Settings className="w-5 h-5" />,
    roles: ['admin'],
  },
];

const roleLabels: Record<UserType['role'], string> = {
  admin: '系统管理员',
  restorer: '文物修复师',
  security: '安保人员',
  guide: '讲解员',
};

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const filteredMenuItems = menuItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-primary-900">
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-primary-800 border-r border-gold-500/20 transition-all duration-300',
          sidebarCollapsed ? 'lg:w-20' : 'lg:w-64',
          mobileMenuOpen ? 'w-64' : 'w-0 lg:w-auto overflow-hidden'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gold-500/20">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-primary-900" />
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <h1 className="text-base font-bold text-gold-400 font-serif whitespace-nowrap">
                  文博管理系统
                </h1>
                <p className="text-xs text-cream-400 whitespace-nowrap">ADMIN PANEL</p>
              </div>
            )}
          </Link>
          <button
            className="lg:hidden p-1 text-cream-400 hover:text-gold-400"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'bg-gold-500/20 text-gold-400 shadow-lg shadow-gold-500/10'
                    : 'text-cream-300 hover:bg-primary-700 hover:text-gold-400'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!sidebarCollapsed && (
                  <span className="flex-1 text-sm font-medium whitespace-nowrap">{item.label}</span>
                )}
                {!sidebarCollapsed && isActive && (
                  <ChevronRight className="w-4 h-4 text-gold-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="p-3 border-t border-gold-500/20">
            <div className={cn(
              'flex items-center gap-3 px-3 py-3 rounded-lg bg-primary-700/50',
              sidebarCollapsed && 'justify-center'
            )}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary-900" />
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-cream-200 truncate">{user.name}</p>
                  <p className="text-xs text-cream-400 truncate">{roleLabels[user.role]}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-primary-800 border-b border-gold-500/20 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-cream-400 hover:text-gold-400 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              className="hidden lg:flex p-2 text-cream-400 hover:text-gold-400 transition-colors"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-cream-100">
                {filteredMenuItems.find((item) => location.pathname.startsWith(item.path))?.label ||
                  '管理控制台'}
              </h2>
              <p className="text-xs text-cream-400">实时数据监控与管理</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-700/50 border border-gold-500/20">
              {user?.role === 'admin' && <Shield className="w-4 h-4 text-gold-500" />}
              {user?.role === 'restorer' && <Wrench className="w-4 h-4 text-gold-500" />}
              {user?.role === 'security' && <Shield className="w-4 h-4 text-gold-500" />}
              {user?.role === 'guide' && <Users className="w-4 h-4 text-gold-500" />}
              <span className="text-sm text-cream-300">{roleLabels[user?.role || 'admin']}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-accent-500 text-accent-400 hover:bg-accent-500/10 hover:border-accent-400 hover:text-accent-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">退出登录</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto bg-primary-900">
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
