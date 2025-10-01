/**
 * Serviço para integração com o backend ENEM Pro
 * Sistema de autenticação integrado com Cakto
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  status: 'active' | 'inactive' | 'suspended' | 'deleted';
  subscriptionStatus?: 'pending' | 'paid' | 'cancelled' | 'refunded' | 'expired';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
    checkoutUrl?: string;
    paymentId?: string;
  };
  requiresPayment?: boolean;
  subscriptionExpired?: boolean;
}


export interface LoginData {
  email: string;
  password: string;
}

class BackendService {
  private token: string | null = null;

  constructor() {
    // Recuperar token do localStorage apenas no lado do cliente
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('enem_pro_auth_token');
    }
  }

  /**
   * Configurar token de autenticação
   */
  private setAuthToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('enem_pro_auth_token', token);
    }
  }

  /**
   * Remover token de autenticação
   */
  private clearAuthToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('enem_pro_auth_token');
    }
  }

  /**
   * Fazer requisição HTTP com headers padrão
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BACKEND_URL}${endpoint}`;
    
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição');
    }

    return data;
  }


  /**
   * Fazer login
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.success && response.data?.token) {
        this.setAuthToken(response.data.token);
      }

      return response;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  /**
   * Verificar token de autenticação
   */
  async verifyToken(): Promise<{ success: boolean; data?: { user: User } }> {
    try {
      if (!this.token) {
        throw new Error('Token não encontrado');
      }

      const response = await this.request<{ success: boolean; data?: { user: User } }>('/auth/verify');
      return response;
    } catch (error) {
      console.error('Erro na verificação do token:', error);
      this.clearAuthToken();
      throw error;
    }
  }

  /**
   * Solicitar redefinição de senha
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.request<{ success: boolean; message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      return response;
    } catch (error) {
      console.error('Erro na solicitação de redefinição:', error);
      throw error;
    }
  }

  /**
   * Redefinir senha
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.request<{ success: boolean; message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });

      return response;
    } catch (error) {
      console.error('Erro na redefinição de senha:', error);
      throw error;
    }
  }

  /**
   * Fazer logout
   */
  logout(): void {
    this.clearAuthToken();
    // Limpar outros dados do localStorage se necessário
    if (typeof window !== 'undefined') {
        localStorage.removeItem('enem_pro_completed_flow');
        localStorage.removeItem('enem_pro_payment_verified');
    }
  }

  /**
   * Verificar se usuário está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Obter token atual
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Testar conexão com o backend
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.request<{ success: boolean }>('/health');
      return response.success;
    } catch (error) {
      console.error('Erro na conexão com backend:', error);
      return false;
    }
  }

  /**
   * Simular webhook para testes (apenas desenvolvimento)
   */
  async simulateWebhook(eventType: string, paymentId: string, userId: string): Promise<any> {
    try {
      const response = await this.request('/dev/simulate-webhook', {
        method: 'POST',
        body: JSON.stringify({
          eventType,
          paymentId,
          userId,
        }),
      });

      return response;
    } catch (error) {
      console.error('Erro ao simular webhook:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas do sistema (apenas desenvolvimento)
   */
  async getStats(): Promise<any> {
    try {
      const response = await this.request('/dev/stats');
      return response;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }
}

// Instância singleton
const backendService = new BackendService();

export default backendService;
