import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, AlertCircle, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, hasRole } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login({ username, password });
      
      if (result.success) {
        if (hasRole(['admin'])) {
          navigate('/dashboard');
        } else {
          navigate('/tasks');
        }
      } else {
        setError(result.message || '登录失败，请检查用户名和密码');
      }
    } catch (err) {
      setError('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="relative bg-primary-800/80 backdrop-blur-xl rounded-2xl p-8 border-2 border-gold-500/50 shadow-2xl shadow-gold-500/20">
          <div className="absolute inset-0 rounded-2xl border border-gold-400/30 pointer-events-none" />
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-gold-500/20 via-gold-300/30 to-gold-500/20 opacity-50 blur-sm pointer-events-none" />

          <div className="relative">
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-gold-500/30">
                <Building2 className="w-10 h-10 text-primary-900" />
              </div>
              <h1 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 mb-2">
                博物馆管理系统
              </h1>
              <p className="text-cream-400 text-sm">请登录您的账户</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-accent-900/50 border border-accent-500/50 rounded-lg flex items-center gap-3 animate-slide-up">
                <AlertCircle className="w-5 h-5 text-accent-400 flex-shrink-0" />
                <span className="text-accent-300 text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-cream-300 text-sm font-medium">用户名</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入用户名"
                    className={cn(
                      'w-full pl-12 pr-4 py-3 bg-primary-900/60 border border-gold-500/30 rounded-lg',
                      'text-cream-100 placeholder-cream-500 text-sm',
                      'focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30',
                      'transition-all duration-300'
                    )}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-cream-300 text-sm font-medium">密码</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className={cn(
                      'w-full pl-12 pr-12 py-3 bg-primary-900/60 border border-gold-500/30 rounded-lg',
                      'text-cream-100 placeholder-cream-500 text-sm',
                      'focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30',
                      'transition-all duration-300'
                    )}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gold-500 hover:text-gold-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="secondary"
                size="lg"
                loading={loading}
                fullWidth
                className="mt-8"
              >
                登 录
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gold-500/20 text-center">
              <p className="text-cream-500 text-xs">
                © 2024 博物馆预约系统 | 传承文明，启迪未来
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
