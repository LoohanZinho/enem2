/**
 * Serviço para integração com o backend ENEM Pro
 * Sistema de autenticação integrado com Cakto
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

// Função auxiliar para fetch com retentativas
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      // Se a resposta não for OK, mas não for um erro de rede, não adianta tentar novamente
      if (response.status < 500) {
        return response;
      }
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(res => setTimeout(res, delay * (i + 1)));
    }
  }
  throw new Error('Falha na requisição após múltiplas tentativas');
}


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
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = BACKEND_URL;
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
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetchWithRetry(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Se o token expirou, limpar o localStorage
        if (response.status === 401) {
          this.setAuthToken(null as any);
          window.location.href = '/login';
        }
        
        throw new Error(data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('Erro na API:', error);
      
      // Se for erro de rede, mostrar mensagem mais amigável
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
      }
      
      throw error;
    }
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
