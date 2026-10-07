import { useState, useEffect } from 'react';
import { User } from '../types';
import api from '../services/api';
import { disconnectSocket } from '../services/socket';

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('teamflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('teamflow_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then((res: any) => {
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('teamflow_user', JSON.stringify(res.data));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('teamflow_user', JSON.stringify(newUser));
    localStorage.setItem('teamflow_token', newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('teamflow_user');
    localStorage.removeItem('teamflow_token');
    disconnectSocket();
  };

  const updateUser = (updatedUser: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem('teamflow_user', JSON.stringify(merged));
      return merged;
    });
  };

  return {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    updateUser,
  };
}
