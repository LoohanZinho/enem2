// API de Correção em Tempo Real para ENEM Pro
// Endpoints para correção instantânea de questões e redações

export interface CorrectionRequest {
  id: string;
  type: 'question' | 'essay' | 'simulado';
  content: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  userId: string;
  timestamp: Date;
  metadata?: {
    questionId?: string;
    simuladoId?: string;
    timeSpent?: number;
    attempt?: number;
  };
}

export interface CorrectionResponse {
  id: string;
  requestId: string;
  isCorrect: boolean;
  score: number;
  maxScore: number;
  feedback: string;
  detailedAnalysis: {
    correctAnswer?: string;
    explanation: string;
    concepts: string[];
    difficulty: string;
    timeToSolve: number;
  };
  suggestions: string[];
  relatedQuestions: string[];
  processingTime: number;
  timestamp: Date;
}

export interface EssayCorrectionResponse extends CorrectionResponse {
  competencies: {
    competency1: { score: number; feedback: string; suggestions: string[] };
    competency2: { score: number; feedback: string; suggestions: string[] };
    competency3: { score: number; feedback: string; suggestions: string[] };
    competency4: { score: number; feedback: string; suggestions: string[] };
    competency5: { score: number; feedback: string; suggestions: string[] };
  };
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  improvementPlan: string[];
}

export interface SimuladoCorrectionResponse {
  id: string;
  simuladoId: string;
  userId: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  maxScore: number;
  timeSpent: number;
  subjectScores: Map<string, { correct: number; total: number; score: number }>;
  detailedResults: CorrectionResponse[];
  overallFeedback: string;
  recommendations: string[];
  timestamp: Date;
}

export interface APIConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
  enableCaching: boolean;
  cacheTimeout: number;
}

export class RealTimeCorrectionAPI {
  private static instance: RealTimeCorrectionAPI;
  private config: APIConfig;
  private cache: Map<string, any> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();

  static getInstance(): RealTimeCorrectionAPI {
    if (!RealTimeCorrectionAPI.instance) {
      RealTimeCorrectionAPI.instance = new RealTimeCorrectionAPI();
    }
    return RealTimeCorrectionAPI.instance;
  }

  constructor() {
    this.config = {
      baseUrl: 'https://api.enempro.com',
      apiKey: 'demo-key',
      timeout: 30000,
      retryAttempts: 3,
      enableCaching: true,
      cacheTimeout: 300000 // 5 minutos
    };
  }

  // Configurar API
  configure(config: Partial<APIConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Corrigir questão individual
  async correctQuestion(request: CorrectionRequest): Promise<CorrectionResponse> {
    const cacheKey = `question_${request.id}`;
    
    if (this.config.enableCaching && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    const promise = this.performCorrection('/api/correct/question', request);
    this.pendingRequests.set(cacheKey, promise);

    try {
      const result = await promise;
      if (this.config.enableCaching) {
        this.cache.set(cacheKey, result);
        setTimeout(() => this.cache.delete(cacheKey), this.config.cacheTimeout);
      }
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  // Corrigir redação
  async correctEssay(request: CorrectionRequest): Promise<EssayCorrectionResponse> {
    const cacheKey = `essay_${request.id}`;
    
    if (this.config.enableCaching && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    const promise = this.performCorrection('/api/correct/essay', request);
    this.pendingRequests.set(cacheKey, promise);

    try {
      const result = await promise;
      if (this.config.enableCaching) {
        this.cache.set(cacheKey, result);
        setTimeout(() => this.cache.delete(cacheKey), this.config.cacheTimeout);
      }
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  // Corrigir simulado completo
  async correctSimulado(simuladoId: string, answers: Map<string, string>, userId: string): Promise<SimuladoCorrectionResponse> {
    const request = {
      simuladoId,
      answers: Object.fromEntries(answers),
      userId,
      timestamp: new Date()
    };

    return this.performCorrection('/api/correct/simulado', request);
  }

  // Obter correção em tempo real (streaming)
  async getRealTimeCorrection(
    request: CorrectionRequest,
    onProgress: (progress: number) => void,
    onPartialResult: (result: Partial<CorrectionResponse>) => void
  ): Promise<CorrectionResponse> {
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(
        `${this.config.baseUrl}/api/correct/stream?requestId=${request.id}`
      );

      let finalResult: CorrectionResponse | null = null;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'progress') {
            onProgress(data.progress);
          } else if (data.type === 'partial') {
            onPartialResult(data.result);
          } else if (data.type === 'complete') {
            finalResult = data.result as CorrectionResponse;
            eventSource.close();
            if(finalResult){
              resolve(finalResult);
            } else {
              reject(new Error("Correction failed: final result is null."));
            }
          } else if (data.type === 'error') {
            eventSource.close();
            reject(new Error(data.message));
          }
        } catch (error) {
          eventSource.close();
          reject(error);
        }
      };

      eventSource.onerror = (error) => {
        eventSource.close();
        reject(error);
      };

      // Timeout
      setTimeout(() => {
        eventSource.close();
        if (!finalResult) {
          reject(new Error('Timeout na correção em tempo real'));
        }
      }, this.config.timeout);
    });
  }

  // Obter estatísticas de correção
  async getCorrectionStats(userId: string, period: 'day' | 'week' | 'month' = 'week'): Promise<{
    totalCorrections: number;
    averageScore: number;
    accuracyRate: number;
    subjectBreakdown: Map<string, { corrections: number; averageScore: number }>;
    timeSpent: number;
    improvementTrend: 'up' | 'down' | 'stable';
  }> {
    const response = await this.makeRequest(`/api/stats/corrections?userId=${userId}&period=${period}`);
    return response;
  }

  // Obter histórico de correções
  async getCorrectionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    corrections: CorrectionResponse[];
    total: number;
    hasMore: boolean;
  }> {
    const response = await this.makeRequest(
      `/api/history/corrections?userId=${userId}&limit=${limit}&offset=${offset}`
    );
    return response;
  }

  // Obter feedback personalizado
  async getPersonalizedFeedback(userId: string, subject: string): Promise<{
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    studyPlan: string[];
    priorityTopics: string[];
  }> {
    const response = await this.makeRequest(`/api/feedback/personalized?userId=${userId}&subject=${subject}`);
    return response;
  }

  // Executar correção
  private async performCorrection(endpoint: string, request: any): Promise<any> {
    const startTime = Date.now();
    
    try {
      const response = await this.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(request),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      // Adicionar tempo de processamento
      if(response) {
        response.processingTime = Date.now() - startTime;
        response.timestamp = new Date();
      }

      return response;
    } catch (error) {
      console.error('Erro na correção:', error);
      throw error;
    }
  }

  // Fazer requisição HTTP
  private async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseUrl}${url}`;
    
    const defaultOptions: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      ...options
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(fullUrl, {
          ...defaultOptions,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.config.retryAttempts) {
          // Aguardar antes de tentar novamente (backoff exponencial)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Falha na requisição após múltiplas tentativas');
  }

  // Simular correção local (para demonstração)
  async simulateCorrection(request: CorrectionRequest): Promise<CorrectionResponse> {
    // Simular tempo de processamento
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

    const isCorrect = Math.random() > 0.3; // 70% de chance de acerto
    const score = isCorrect ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 40) + 20;

    return {
      id: this.generateId(),
      requestId: request.id,
      isCorrect,
      score,
      maxScore: 100,
      feedback: isCorrect ? 
        'Parabéns! Resposta correta.' : 
        'Resposta incorreta. Revise o conceito.',
      detailedAnalysis: {
        correctAnswer: isCorrect ? undefined : 'Resposta correta: [Simulada]',
        explanation: this.generateExplanation(request.subject),
        concepts: this.getConceptsForSubject(request.subject),
        difficulty: request.difficulty,
        timeToSolve: Math.floor(Math.random() * 300) + 60
      },
      suggestions: this.generateSuggestions(request.subject, isCorrect),
      relatedQuestions: this.generateRelatedQuestions(request.subject),
      processingTime: Math.floor(Math.random() * 1000) + 500,
      timestamp: new Date()
    };
  }

  // Simular correção de redação
  async simulateEssayCorrection(request: CorrectionRequest): Promise<EssayCorrectionResponse> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 2000));

    const competencies = {
      competency1: {
        score: Math.floor(Math.random() * 200) + 100,
        feedback: 'Bom domínio da norma culta',
        suggestions: ['Revise concordância verbal', 'Atenção à pontuação']
      },
      competency2: {
        score: Math.floor(Math.random() * 200) + 100,
        feedback: 'Tema bem desenvolvido',
        suggestions: ['Aprofunde a argumentação', 'Use mais exemplos']
      },
      competency3: {
        score: Math.floor(Math.random() * 200) + 100,
        feedback: 'Boa organização das ideias',
        suggestions: ['Melhore a coesão', 'Use mais conectivos']
      },
      competency4: {
        score: Math.floor(Math.random() * 200) + 100,
        feedback: 'Argumentação consistente',
        suggestions: ['Diversifique o vocabulário', 'Melhore a progressão temática']
      },
      competency5: {
        score: Math.floor(Math.random() * 200) + 100,
        feedback: 'Proposta de intervenção adequada',
        suggestions: ['Detalhe mais a proposta', 'Mencione agentes específicos']
      }
    };

    const overallScore = Object.values(competencies).reduce((sum, comp) => sum + comp.score, 0) / 5;

    return {
      id: this.generateId(),
      requestId: request.id,
      isCorrect: overallScore >= 600,
      score: overallScore,
      maxScore: 1000,
      feedback: overallScore >= 600 ? 
        'Excelente redação!' : 
        'Boa redação, mas há pontos para melhorar.',
      detailedAnalysis: {
        explanation: 'Análise baseada na matriz de referência do ENEM',
        concepts: ['Estrutura textual', 'Argumentação', 'Coesão', 'Coerência'],
        difficulty: request.difficulty,
        timeToSolve: Math.floor(Math.random() * 1800) + 1200
      },
      suggestions: this.generateEssaySuggestions(overallScore),
      relatedQuestions: [],
      processingTime: Math.floor(Math.random() * 2000) + 1000,
      timestamp: new Date(),
      competencies,
      overallScore,
      strengths: this.generateStrengths(competencies),
      weaknesses: this.generateWeaknesses(competencies),
      improvementPlan: this.generateImprovementPlan(competencies)
    };
  }

  // Gerar explicação baseada na matéria
  private generateExplanation(subject: string): string {
    const explanations: Record<string, string> = {
      'Matemática': 'Esta questão envolve conceitos de álgebra e geometria. A resolução requer aplicação de fórmulas e raciocínio lógico.',
      'Física': 'A questão aborda princípios fundamentais da física. É importante identificar as grandezas envolvidas e aplicar as leis corretas.',
      'Química': 'Este problema envolve cálculos estequiométricos e conceitos de química geral. Preste atenção às unidades e balanceamento.',
      'Biologia': 'A questão trata de processos biológicos fundamentais. Considere as relações entre estrutura e função.',
      'História': 'Este tema aborda aspectos históricos importantes. Relacione causa e consequência, e considere o contexto temporal.',
      'Geografia': 'A questão envolve conceitos geográficos e relações espaciais. Analise os dados apresentados cuidadosamente.',
      'Português': 'Esta questão testa conhecimentos de gramática e interpretação de texto. Preste atenção aos detalhes linguísticos.'
    };
    return explanations[subject] || 'Questão que requer análise cuidadosa dos conceitos envolvidos.';
  }

  // Obter conceitos por matéria
  private getConceptsForSubject(subject: string): string[] {
    const concepts: Record<string, string[]> = {
      'Matemática': ['Álgebra', 'Geometria', 'Funções', 'Estatística'],
      'Física': ['Mecânica', 'Termodinâmica', 'Eletricidade', 'Óptica'],
      'Química': ['Química Geral', 'Orgânica', 'Inorgânica', 'Físico-química'],
      'Biologia': ['Citologia', 'Genética', 'Ecologia', 'Evolução'],
      'História': ['História do Brasil', 'História Geral', 'Atualidades'],
      'Geografia': ['Geografia Física', 'Geografia Humana', 'Geografia do Brasil'],
      'Português': ['Gramática', 'Literatura', 'Interpretação', 'Redação']
    };
    return concepts[subject] || ['Conceitos gerais'];
  }

  // Gerar sugestões
  private generateSuggestions(subject: string, isCorrect: boolean): string[] {
    if (isCorrect) {
      return [
        'Continue praticando questões similares',
        'Explore tópicos mais avançados',
        'Ensine o conceito para alguém'
      ];
    } else {
      return [
        'Revise os conceitos fundamentais',
        'Pratique exercícios básicos',
        'Consulte material didático',
        'Peça ajuda a um professor'
      ];
    }
  }

  // Gerar questões relacionadas
  private generateRelatedQuestions(subject: string): string[] {
    return [
      `Questão similar de ${subject}`,
      `Aplicação prática do conceito`,
      `Questão de nível avançado`
    ];
  }

  // Gerar sugestões para redação
  private generateEssaySuggestions(score: number): string[] {
    if (score >= 800) {
      return ['Excelente redação! Continue praticando para manter o nível.'];
    } else if (score >= 600) {
      return [
        'Boa redação! Melhore a argumentação para alcançar notas mais altas.',
        'Trabalhe na coesão textual.'
      ];
    } else {
      return [
        'Revise a estrutura da redação',
        'Pratique mais a argumentação',
        'Estude conectivos e coesão',
        'Leia redações nota 1000'
      ];
    }
  }

  // Gerar pontos fortes
  private generateStrengths(competencies: any): string[] {
    const strengths: string[] = [];
    Object.entries(competencies).forEach(([key, comp]: [string, any]) => {
      if (comp.score >= 160) {
        strengths.push(`Excelente ${key.replace('competency', 'Competência ')}`);
      }
    });
    return strengths.length > 0 ? strengths : ['Boa estrutura geral'];
  }

  // Gerar pontos fracos
  private generateWeaknesses(competencies: any): string[] {
    const weaknesses: string[] = [];
    Object.entries(competencies).forEach(([key, comp]: [string, any]) => {
      if (comp.score < 120) {
        weaknesses.push(`Melhorar ${key.replace('competency', 'Competência ')}`);
      }
    });
    return weaknesses.length > 0 ? weaknesses : ['Manter consistência'];
  }

  // Gerar plano de melhoria
  private generateImprovementPlan(competencies: any): string[] {
    return [
      'Pratique redações semanalmente',
      'Leia textos de diferentes gêneros',
      'Estude conectivos e coesão',
      'Pratique argumentação com dados'
    ];
  }

  // Gerar ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Limpar cache
  clearCache(): void {
    this.cache.clear();
  }

  // Obter estatísticas do cache
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export default RealTimeCorrectionAPI;

    