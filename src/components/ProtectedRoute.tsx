import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Lock, Home, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import type { User } from '../../shared/types';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  roles?: User['role'][];
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, hasRole } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !hasRole(roles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-900 p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary-800 border-2 border-gold-500/30 flex items-center justify-center">
            <Lock className="w-12 h-12 text-gold-500" />
          </div>
          <h1 className="text-4xl font-bold text-gold-400 mb-2 font-serif">403</h1>
          <h2 className="text-xl font-semibold text-cream-200 mb-3">访问被拒绝</h2>
          <p className="text-cream-400 mb-8">
            抱歉，您没有权限访问此页面。请联系管理员获取访问权限，或返回首页浏览其他内容。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="secondary" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4" />
              返回上一页
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = '/')}>
              <Home className="w-4 h-4" />
              返回首页
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!children) {
    return <Outlet />;
  }

  return <>{children}</>;
}
