// src-gen/services/AuthService.ts

import { User } from '@/types/User';
import { apiService } from './api'; // Supondo que apiService lida com chamadas HTTP

class AuthService {
  private currentUser: User | null = null;
  private readonly CURRENT_USER_KEY = 'enem_pro_current_user';

  constructor() {
    // Carregar usuário do localStorage no cliente
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem(this.CURRENT_USER_KEY);
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    }
  }
  
  async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (data.success) {
        this.currentUser = data.user;
        if (typeof window !== 'undefined') {
          localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(data.user));
        }
        return { success: true, message: "Login bem-sucedido!", user: data.user };
      } else {
        return { success: false, message: data.message || "Email ou senha inválidos." };
      }
    } catch (error) {
      console.error("Erro no login:", error);
      return { success: false, message: "Erro de conexão. Tente novamente." };
    }
  }

  logout(): void {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.CURRENT_USER_KEY);
      // Limpa também o cookie para o middleware
      document.cookie = 'enem_pro_user_id=; path=/; max-age=0; SameSite=Lax';
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }
  
  // As funções abaixo seriam implementadas com chamadas de API reais
  async register(userData: Omit<User, 'id'>): Promise<{ success: boolean; message: string; user?: User }> {
    // Simulação
    return { success: true, message: "Registrado com sucesso!", user: { id: "new-user", ...userData } };
  }
  
  async updateUser(userId: string, updates: Partial<User>): Promise<{ success: boolean; message: string }> {
    // Simulação
    if(this.currentUser && this.currentUser.id === userId) {
      this.currentUser = { ...this.currentUser, ...updates };
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(this.currentUser));
      }
    }
    return { success: true, message: "Usuário atualizado." };
  }

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    // Simulação
    return { success: true, message: "Usuário deletado." };
  }

  async getAllUsers(): Promise<User[]> {
    // Simulação
    return [this.currentUser].filter((u): u is User => u !== null);
  }

  async getUserById(userId: string): Promise<User | null> {
    // Simulação
    if (this.currentUser && this.currentUser.id === userId) {
      return this.currentUser;
    }
    return null;
  }
}

export const authService = new AuthService();
