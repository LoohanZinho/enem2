/**
 * Serviço de comunicação com a API
 * Gerencia todas as requisições HTTP para o backend
 */

const API_BASE_URL = 'http://localhost:3001/api';

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


interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface User {
  id: string;
  nome: string;
  email: string;
  criado_em: string;
  role: 'user' | 'admin';
  phone?: string;
}

interface Essay {
  id: string;
  titulo: string;
  conteudo: string;
  criado_em: string;
  atualizado_em: string;
  resumo?: string;
}

interface Flashcard {
  id: string;
  frente: string;
  verso: string;
  criado_em: string;
  atualizado_em: string;
}

interface Note {
  id: string;
  conteudo: string;
  criado_em: string;
  atualizado_em: string;
  resumo?: string;
}

interface LoginData {
  email: string;
  senha: string;
}


interface UpdateProfileData {
  nome?: string;
  email?: string;
}

interface ChangePasswordData {
  senhaAtual: string;
  novaSenha: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  /**
   * Definir token de autenticação
   */
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Obter token atual
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Fazer requisição HTTP
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
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
          this.setToken(null);
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

  // ===== AUTENTICAÇÃO =====


  /**
   * Fazer login
   */
  async login(data: LoginData): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  /**
   * Obter perfil do usuário
   */
  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request('/auth/profile');
  }

  /**
   * Atualizar perfil
   */
  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<{ user: User }>> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Alterar senha
   */
  async changePassword(data: ChangePasswordData): Promise<ApiResponse<any>> {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Fazer logout
   */
  logout() {
    this.setToken(null);
  }

  // ===== REDAÇÕES =====

  /**
   * Listar redações
   */
  async getEssays(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<{ essays: Essay[]; pagination: PaginationData }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    return this.request(`/essays${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Obter redação por ID
   */
  async getEssay(id: string): Promise<ApiResponse<{ essay: Essay }>> {
    return this.request(`/essays/${id}`);
  }

  /**
   * Criar redação
   */
  async createEssay(data: { titulo: string; conteudo: string }): Promise<ApiResponse<{ essay: Essay }>> {
    return this.request('/essays', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Atualizar redação
   */
  async updateEssay(id: string, data: { titulo: string; conteudo: string }): Promise<ApiResponse<{ essay: Essay }>> {
    return this.request(`/essays/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Excluir redação
   */
  async deleteEssay(id: string): Promise<ApiResponse<any>> {
    return this.request(`/essays/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Obter estatísticas das redações
   */
  async getEssayStats(): Promise<ApiResponse<{ stats: any }>> {
    return this.request('/essays/stats');
  }

  // ===== FLASHCARDS =====

  /**
   * Listar flashcards
   */
  async getFlashcards(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<{ flashcards: Flashcard[]; pagination: PaginationData }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    return this.request(`/flashcards${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Obter flashcard por ID
   */
  async getFlashcard(id: string): Promise<ApiResponse<{ flashcard: Flashcard }>> {
    return this.request(`/flashcards/${id}`);
  }

  /**
   * Criar flashcard
   */
  async createFlashcard(data: { frente: string; verso: string }): Promise<ApiResponse<{ flashcard: Flashcard }>> {
    return this.request('/flashcards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Criar múltiplos flashcards
   */
  async createBatchFlashcards(data: { flashcards: Array<{ frente: string; verso: string }> }): Promise<ApiResponse<{ flashcards: Flashcard[] }>> {
    return this.request('/flashcards/batch', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Atualizar flashcard
   */
  async updateFlashcard(id: string, data: { frente: string; verso: string }): Promise<ApiResponse<{ flashcard: Flashcard }>> {
    return this.request(`/flashcards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Excluir flashcard
   */
  async deleteFlashcard(id: string): Promise<ApiResponse<any>> {
    return this.request(`/flashcards/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Obter estatísticas dos flashcards
   */
  async getFlashcardStats(): Promise<ApiResponse<{ stats: any }>> {
    return this.request('/flashcards/stats');
  }

  // ===== ANOTAÇÕES =====

  /**
   * Listar anotações
   */
  async getNotes(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<{ notes: Note[]; pagination: PaginationData }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    return this.request(`/notes${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Buscar anotações
   */
  async searchNotes(params: {
    q: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ notes: Note[]; pagination: PaginationData; searchTerm: string }>> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', params.q);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    return this.request(`/notes/search?${queryParams.toString()}`);
  }

  /**
   * Obter anotação por ID
   */
  async getNote(id: string): Promise<ApiResponse<{ note: Note }>> {
    return this.request(`/notes/${id}`);
  }

  /**
   * Criar anotação
   */
  async createNote(data: { conteudo: string }): Promise<ApiResponse<{ note: Note }>> {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Atualizar anotação
   */
  async updateNote(id: string, data: { conteudo: string }): Promise<ApiResponse<{ note: Note }>> {
    return this.request(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Excluir anotação
   */
  async deleteNote(id: string): Promise<ApiResponse<any>> {
    return this.request(`/notes/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Obter estatísticas das anotações
   */
  async getNoteStats(): Promise<ApiResponse<{ stats: any }>> {
    return this.request('/notes/stats');
  }
}

// Instância singleton do serviço
export const apiService = new ApiService();

// Exportar tipos
export type {
  ApiResponse,
  User,
  Essay,
  Flashcard,
  Note,
  LoginData,
  UpdateProfileData,
  ChangePasswordData,
  PaginationData,
};
