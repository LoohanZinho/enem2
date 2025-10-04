
"use client";
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authService } from '@/services/AuthService';
import { User } from '@/types/User';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{success: boolean; message: string; user?: User}>;
  updateUser: (updates: Partial<User>) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{success: boolean; message: string; user?: User}> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const result = await response.json();

      if (response.ok && result.success) {
        authService.setCurrentUser(result.user);
        setUser(result.user);
        return { success: true, message: 'Login bem-sucedido!', user: result.user };
      } else {
        return { success: false, message: result.message || 'Falha no login.' };
      }

    } catch (error) {
      console.error('Erro na chamada de API de login:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    
    const result = await authService.updateUser(user.id, updates);
    if(result.success) {
      const updatedUser = await authService.getUserById(user.id);
      if (updatedUser) {
        authService.setCurrentUser(updatedUser);
        setUser(updatedUser);
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    updateUser,
    logout,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
