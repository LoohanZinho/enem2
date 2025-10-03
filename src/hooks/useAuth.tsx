
"use client";
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authService } from '@/services/AuthService';
import { User } from '@/types/User';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{success: boolean; message: string}>;
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
    const checkAuth = async () => {
      try {
        const storedUserId = localStorage.getItem('enem_pro_user_id');
        if (storedUserId && storedUserId !== 'undefined' && storedUserId !== 'null') {
          const userData = await authService.getUserById(storedUserId);
          if (userData) {
            setUser(userData);
          } else {
            // Se o ID não corresponder a um usuário válido, limpe o localStorage
            localStorage.removeItem('enem_pro_user_id');
            localStorage.removeItem('enem_pro_current_user'); // Limpa também o usuário atual do outro serviço
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('enem_pro_user_id');
        localStorage.removeItem('enem_pro_current_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{success: boolean; message: string}> => {
    setIsLoading(true);
    
    try {
      if (!email || !password) {
        return { success: false, message: 'Email e senha são obrigatórios'};
      }

      if (!email.includes('@')) {
        return { success: false, message: 'Email inválido'};
      }

      if (password.length < 6) {
        return { success: false, message: 'A senha deve ter pelo menos 6 caracteres'};
      }

      const result = await authService.login({email, password});
      
      if (result.success && result.user) {
        localStorage.setItem('enem_pro_user_id', result.user.id);
        setUser(result.user);
        return { success: true, message: 'Login bem-sucedido!'};
      } else {
        return { success: false, message: result.message };
      }

    } catch (error) {
      console.error('Erro no login:', error);
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
        setUser(updatedUser);
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('enem_pro_user_id');
    localStorage.removeItem('enem_pro_current_user');
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

    