// Serviço de API para correção de redações em tempo real
// Endpoints para integração com sistemas externos

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  requestId: string;
}

export interface CorrecaoRequest {
  texto: string;
  tema: string;
  duplaCorrecao?: boolean;
  configuracao?: {
    idioma?: 'pt' | 'en' | 'es';
    nivel?: 'basico' | 'intermediario' | 'avancado';
    focoCompetencias?: number[];
  };
}

export interface CorrecaoResponse {
  id: string;
  texto: string;
  tema: string;
  competencias: PontuacaoCompetencia[];
  notaTotal: number;
  notaFinal: number;
  feedbackGeral: string;
  nivel: string;
  dataCorrecao: string;
  avaliadores: number;
  discrepancia: boolean;
  tempoProcessamento: number;
  confianca: number;
}

export interface PontuacaoCompetencia {
  competencia: number;
  nota: number;
  justificativa: string;
  pontosFortes: string[];
  pontosFracos: string[];
  sugestoes: string[];
}

export interface BatchCorrecaoRequest {
  redacoes: CorrecaoRequest[];
  callbackUrl?: string;
  notificarEmail?: string;
}

export interface BatchCorrecaoResponse {
  batchId: string;
  totalRedacoes: number;
  redacoesProcessadas: number;
  status: 'processing' | 'completed' | 'failed';
  resultados?: CorrecaoResponse[];
  erro?: string;
}

export interface EstatisticasAPI {
  totalRedacoes: number;
  mediaGeral: number;
  melhorNota: number;
  piorNota: number;
  competencias: {
    [key: number]: {
      media: number;
      total: number;
      tendencia: 'crescimento' | 'estagnacao' | 'declinio';
    };
  };
  ultimaAtualizacao: string;
}

export class APIService {
  private static instance: APIService;
  private baseUrl: string;
  private apiKey: string;
  private rateLimit: Map<string, number> = new Map();
  private maxRequestsPerMinute = 60;

  constructor() {
    this.baseUrl = 'https://api.enem-pro.com';
    this.apiKey = 'demo-key';
  }

  public static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  // Endpoint: POST /api/corrigir
  async corrigirRedacao(request: CorrecaoRequest): Promise<APIResponse<CorrecaoResponse>> {
    try {
      this.verificarRateLimit();
      
      const response = await fetch(`${this.baseUrl}/api/corrigir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Request-ID': this.gerarRequestId()
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
        requestId: this.gerarRequestId()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
        requestId: this.gerarRequestId()
      };
    }
  }

  // Endpoint: POST /api/corrigir-batch
  async corrigirRedacoesEmLote(request: BatchCorrecaoRequest): Promise<APIResponse<BatchCorrecaoResponse>> {
    try {
      this.verificarRateLimit();
      
      const response = await fetch(`${this.baseUrl}/api/corrigir-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Request-ID': this.gerarRequestId()
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
        requestId: this.gerarRequestId()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
        requestId: this.gerarRequestId()
      };
    }
  }

  // Endpoint: GET /api/corrigir-batch/{batchId}
  async obterStatusBatch(batchId: string): Promise<APIResponse<BatchCorrecaoResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/corrigir-batch/${batchId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Request-ID': this.gerarRequestId()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
        requestId: this.gerarRequestId()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
        requestId: this.gerarRequestId()
      };
    }
  }

  // Endpoint: GET /api/estatisticas
  async obterEstatisticas(): Promise<APIResponse<EstatisticasAPI>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/estatisticas`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Request-ID': this.gerarRequestId()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
        requestId: this.gerarRequestId()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
        requestId: this.gerarRequestId()
      };
    }
  }

  // Endpoint: GET /api/redacoes/{id}
  async obterRedacao(id: string): Promise<APIResponse<CorrecaoResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/redacoes/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Request-ID': this.gerarRequestId()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
        requestId: this.gerarRequestId()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
        requestId: this.gerarRequestId()
      };
    }
  }

  // Endpoint: GET /api/redacoes
  async listarRedacoes(filtros?: {
    dataInicio?: string;
    dataFim?: string;
    tema?: string;
    notaMinima?: number;
    notaMaxima?: number;
    competencia?: number;
    limit?: number;
    offset?: number;
  }): Promise<APIResponse<{
    redacoes: CorrecaoResponse[];
    total: number;
    pagina: number;
    totalPaginas: number;
  }>> {
    try {
      const params = new URLSearchParams();
      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${this.baseUrl}/api/redacoes?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Request-ID': this.gerarRequestId()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
        requestId: this.gerarRequestId()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
        requestId: this.gerarRequestId()
      };
    }
  }

  // Endpoint: DELETE /api/redacoes/{id}
  async excluirRedacao(id: string): Promise<APIResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/redacoes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Request-ID': this.gerarRequestId()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        timestamp: new Date().toISOString(),
        requestId: this.gerarRequestId()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
        requestId: this.gerarRequestId()
      };
    }
  }

  // Endpoint: GET /api/health
  async verificarSaude(): Promise<APIResponse<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    version: string;
    uptime: number;
    services: {
      database: 'up' | 'down';
      ai: 'up' | 'down';
      storage: 'up' | 'down';
    };
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        headers: {
          'X-Request-ID': this.gerarRequestId()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
        requestId: this.gerarRequestId()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
        requestId: this.gerarRequestId()
      };
    }
  }

  // WebSocket para correções em tempo real
  conectarWebSocket(callbacks: {
    onCorrecaoCompleta: (data: CorrecaoResponse) => void;
    onErro: (error: string) => void;
    onStatus: (status: string) => void;
  }): WebSocket | null {
    try {
      const wsUrl = this.baseUrl.replace('http', 'ws') + '/ws/corrigir';
      const ws = new WebSocket(`${wsUrl}?token=${this.apiKey}`);

      ws.onopen = () => {
        console.log('WebSocket conectado');
        callbacks.onStatus('Conectado');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'correcao_completa') {
            callbacks.onCorrecaoCompleta(data.data);
          } else if (data.type === 'erro') {
            callbacks.onErro(data.message);
          } else if (data.type === 'status') {
            callbacks.onStatus(data.message);
          }
        } catch (error) {
          callbacks.onErro('Erro ao processar mensagem do WebSocket');
        }
      };

      ws.onclose = () => {
        console.log('WebSocket desconectado');
        callbacks.onStatus('Desconectado');
      };

      ws.onerror = (error) => {
        console.error('Erro no WebSocket:', error);
        callbacks.onErro('Erro na conexão WebSocket');
      };

      return ws;
    } catch (error) {
      callbacks.onErro('Erro ao conectar WebSocket');
      return null;
    }
  }

  // Enviar redação via WebSocket
  enviarRedacaoWebSocket(ws: WebSocket, request: CorrecaoRequest): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'corrigir',
        data: request
      }));
    } else {
      throw new Error('WebSocket não está conectado');
    }
  }

  // Verificar rate limit
  private verificarRateLimit(): void {
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const key = `rate_limit_${minute}`;
    
    const currentCount = this.rateLimit.get(key) || 0;
    
    if (currentCount >= this.maxRequestsPerMinute) {
      throw new Error('Rate limit excedido. Tente novamente em alguns minutos.');
    }
    
    this.rateLimit.set(key, currentCount + 1);
    
    // Limpar entradas antigas
    this.limparRateLimitAntigo();
  }

  // Limpar rate limit antigo
  private limparRateLimitAntigo(): void {
    const now = Date.now();
    const currentMinute = Math.floor(now / 60000);
    
    for (const [key] of this.rateLimit) {
      const minute = parseInt(key.split('_')[2]);
      if (minute < currentMinute - 5) { // Manter apenas últimos 5 minutos
        this.rateLimit.delete(key);
      }
    }
  }

  // Gerar ID único para requisição
  private gerarRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Configurar API
  configurar(config: {
    baseUrl?: string;
    apiKey?: string;
    maxRequestsPerMinute?: number;
  }): void {
    if (config.baseUrl) this.baseUrl = config.baseUrl;
    if (config.apiKey) this.apiKey = config.apiKey;
    if (config.maxRequestsPerMinute) this.maxRequestsPerMinute = config.maxRequestsPerMinute;
  }

  // Obter configuração atual
  obterConfiguracao(): {
    baseUrl: string;
    maxRequestsPerMinute: number;
  } {
    return {
      baseUrl: this.baseUrl,
      maxRequestsPerMinute: this.maxRequestsPerMinute
    };
  }
}









