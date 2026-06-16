import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginRequest } from '../../shared/types';
import { authApi } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  checkAuth: () => void;
  hasRole: (roles: User['role'][]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (credentials) => {
        try {
          const response = await authApi.login(credentials);

          if (!response.success || !response.data) {
            return {
              success: false,
              message: response.message || response.error || '登录失败',
            };
          }

          const { token, user } = response.data;

          set({
            user,
            token,
            isAuthenticated: true,
          });

          return { success: true };
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : '登录失败',
          };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      checkAuth: () => {
        const token = localStorage.getItem('token');
        if (token) {
          set({
            token,
            isAuthenticated: true,
          });
        }
      },

      hasRole: (roles) => {
        const user = get().user;
        if (!user) return false;
        return roles.includes(user.role);
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
