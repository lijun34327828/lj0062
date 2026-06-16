import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Building2, Calendar, Phone, Mail, MapPin, Clock, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const navItems = [
  { label: '首页', path: '/' },
  { label: '展厅导览', path: '/exhibitions' },
  { label: '藏品展示', path: '/collections' },
  { label: '参观指南', path: '/guide' },
  { label: '关于我们', path: '/about' },
];

export default function VisitorLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <header className="sticky top-0 z-50 bg-primary-700 border-b border-gold-500/30 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                <Building2 className="w-6 h-6 lg:w-7 lg:h-7 text-primary-900" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg lg:text-xl font-bold text-gold-400 font-serif">文博展览馆</h1>
                <p className="text-xs text-cream-300">CULTURAL MUSEUM</p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'text-sm font-medium transition-colors duration-200 hover:text-gold-400 relative group',
                    location.pathname === item.path ? 'text-gold-400' : 'text-cream-200'
                  )}
                >
                  {item.label}
                  <span className={cn(
                    'absolute -bottom-1 left-0 h-0.5 bg-gold-500 transition-all duration-300',
                    location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'
                  )} />
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link to="/booking">
                <Button variant="secondary" size="sm" className="hidden sm:inline-flex">
                  <Calendar className="w-4 h-4" />
                  在线预约
                </Button>
              </Link>
              <button
                className="lg:hidden p-2 text-cream-200 hover:text-gold-400 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        <div className={cn(
          'lg:hidden overflow-hidden transition-all duration-300 bg-primary-800 border-t border-gold-500/20',
          mobileMenuOpen ? 'max-h-96' : 'max-h-0'
        )}>
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'block px-4 py-3 rounded-lg transition-colors',
                  location.pathname === item.path
                    ? 'bg-gold-500/20 text-gold-400'
                    : 'text-cream-200 hover:bg-primary-700 hover:text-gold-400'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-primary-600">
              <Link to="/booking" className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" size="sm" fullWidth>
                  <Calendar className="w-4 h-4" />
                  在线预约
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-primary-800 text-cream-200 border-t border-gold-500/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-900" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gold-400 font-serif">文博展览馆</h3>
                  <p className="text-xs text-cream-400">CULTURAL MUSEUM</p>
                </div>
              </div>
              <p className="text-sm text-cream-400 leading-relaxed">
                传承历史文化，展示艺术瑰宝。我们致力于为观众提供优质的文化体验和专业的导览服务。
              </p>
            </div>

            <div>
              <h4 className="text-gold-400 font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-gold-500 rounded-full" />
                参观指南
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gold-500" />
                  开放时间: 周二至周日 9:00-17:00
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gold-500" />
                  地址: 文化街1号博物馆大厦
                </li>
                <li className="flex items-start gap-2">
                  <ChevronDown className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" />
                  周一闭馆（法定节假日除外）
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-gold-400 font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-gold-500 rounded-full" />
                联系方式
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gold-500" />
                  咨询热线: 400-888-8888
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gold-500" />
                  邮箱: contact@museum.com
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gold-500" />
                  团队预约: group@museum.com
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-gold-400 font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-gold-500 rounded-full" />
                快速链接
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/exhibitions" className="hover:text-gold-400 transition-colors">
                    当前展览
                  </Link>
                </li>
                <li>
                  <Link to="/collections" className="hover:text-gold-400 transition-colors">
                    精品馆藏
                  </Link>
                </li>
                <li>
                  <Link to="/booking" className="hover:text-gold-400 transition-colors">
                    在线预约
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-gold-400 transition-colors">
                    了解我们
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-primary-600 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-cream-500">
              © {new Date().getFullYear()} 文博展览馆 版权所有 | 京ICP备XXXXXXXX号
            </p>
            <div className="flex items-center gap-6 text-sm text-cream-500">
              <Link to="/privacy" className="hover:text-gold-400 transition-colors">隐私政策</Link>
              <Link to="/terms" className="hover:text-gold-400 transition-colors">使用条款</Link>
              <Link to="/admin" className="hover:text-gold-400 transition-colors">管理入口</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
