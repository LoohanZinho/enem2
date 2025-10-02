// Serviço para gerenciar histórico de correções de redação
import { CorrecaoRedacao } from './RedacaoAIService';
import { userDataService } from './UserDataService';

export interface EstatisticasHistorico {
  totalCorrecoes: number;
  mediaGeral: number;
  melhorNota: number;
  piorNota: number;
  evolucaoCompetencias: { [key: number]: number[] };
  temasMaisFrequentes: { tema: string; quantidade: number }[];
  nivelMaisComum: string;
  tempoMedioCorrecao: number;
}

export class HistoricoCorrecoesService {
  private static instance: HistoricoCorrecoesService;
  private historico: CorrecaoRedacao[] = [];

  private constructor() {
    // A inicialização agora deve ser feita após a montagem do componente no lado do cliente
    if (typeof window !== 'undefined') {
      this.carregarHistorico();
    }
  }

  static getInstance(): HistoricoCorrecoesService {
    if (!HistoricoCorrecoesService.instance) {
      HistoricoCorrecoesService.instance = new HistoricoCorrecoesService();
    }
    return HistoricoCorrecoesService.instance;
  }

  // Carregar histórico do localStorage (deve ser chamado no lado do cliente)
  private carregarHistorico(): void {
    if (typeof window === 'undefined') {
      this.historico = [];
      return;
    }
    try {
      const userData = userDataService.loadUserData();
      if (userData && userData.essays && Array.isArray(userData.essays)) {
        this.historico = userData.essays.map((c: any) => ({
          ...c,
          dataCorrecao: new Date(c.dataCorrecao)
        }));
      } else {
        this.historico = [];
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      this.historico = [];
    }
  }
  
  // Salvar nova correção no histórico
  salvarCorrecao(correcao: CorrecaoRedacao): void {
    if (typeof window === 'undefined') return;
    this.carregarHistorico(); // Garante que temos a lista mais recente
    this.historico.unshift(correcao); // Adiciona no início da lista
    this.salvarHistorico();
  }

  // Obter todas as correções
  obterHistorico(): CorrecaoRedacao[] {
    if (typeof window !== 'undefined') {
      this.carregarHistorico();
    }
    return [...this.historico];
  }

  // Obter correção por ID
  obterCorrecaoPorId(id: string): CorrecaoRedacao | undefined {
    if (typeof window !== 'undefined') {
      this.carregarHistorico();
    }
    return this.historico.find(correcao => correcao.id === id);
  }

  // Obter últimas N correções
  obterUltimasCorrecoes(quantidade: number = 10): CorrecaoRedacao[] {
    if (typeof window !== 'undefined') {
      this.carregarHistorico();
    }
    return this.historico.slice(0, quantidade);
  }

  // Obter correções por tema
  obterCorrecoesPorTema(tema: string): CorrecaoRedacao[] {
    if (typeof window !== 'undefined') {
      this.carregarHistorico();
    }
    return this.historico.filter(correcao => 
      correcao.tema.toLowerCase().includes(tema.toLowerCase())
    );
  }

  // Obter correções por nível
  obterCorrecoesPorNivel(nivel: string): CorrecaoRedacao[] {
    if (typeof window !== 'undefined') {
      this.carregarHistorico();
    }
    return this.historico.filter(correcao => correcao.nivel === nivel);
  }

  // Obter estatísticas do histórico
  obterEstatisticas(): EstatisticasHistorico {
    if (typeof window !== 'undefined') {
      this.carregarHistorico();
    }

    if (this.historico.length === 0) {
      return {
        totalCorrecoes: 0,
        mediaGeral: 0,
        melhorNota: 0,
        piorNota: 0,
        evolucaoCompetencias: {},
        temasMaisFrequentes: [],
        nivelMaisComum: 'Nenhum',
        tempoMedioCorrecao: 0
      };
    }

    const notas = this.historico.map(c => c.notaTotal);
    const mediaGeral = notas.reduce((sum, nota) => sum + nota, 0) / notas.length;
    const melhorNota = Math.max(...notas);
    const piorNota = Math.min(...notas);

    // Evolução por competência
    const evolucaoCompetencias: { [key: number]: number[] } = {};
    for (let i = 1; i <= 5; i++) {
      evolucaoCompetencias[i] = this.historico.map(c => 
        c.competencias.find(comp => comp.competencia === i)?.nota || 0
      );
    }

    // Temas mais frequentes
    const temasCount: { [key: string]: number } = {};
    this.historico.forEach(correcao => {
      temasCount[correcao.tema] = (temasCount[correcao.tema] || 0) + 1;
    });
    const temasMaisFrequentes = Object.entries(temasCount)
      .map(([tema, quantidade]) => ({ tema, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);

    // Nível mais comum
    const niveisCount: { [key: string]: number } = {};
    this.historico.forEach(correcao => {
      niveisCount[correcao.nivel] = (niveisCount[correcao.nivel] || 0) + 1;
    });
    const nivelMaisComum = Object.entries(niveisCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Nenhum';

    // Tempo médio de correção
    const tempoMedioCorrecao = this.historico.reduce((sum, c) => 
      sum + (c.estatisticas?.tempoCorrecao || 0), 0
    ) / this.historico.length;

    return {
      totalCorrecoes: this.historico.length,
      mediaGeral: Math.round(mediaGeral),
      melhorNota,
      piorNota,
      evolucaoCompetencias,
      temasMaisFrequentes,
      nivelMaisComum,
      tempoMedioCorrecao: Math.round(tempoMedioCorrecao)
    };
  }

  // Remover correção do histórico
  removerCorrecao(id: string): boolean {
    const index = this.historico.findIndex(correcao => correcao.id === id);
    if (index !== -1) {
      this.historico.splice(index, 1);
      this.salvarHistorico();
      return true;
    }
    return false;
  }

  // Limpar todo o histórico
  limparHistorico(): void {
    this.historico = [];
    this.salvarHistorico();
  }

  // Exportar histórico para JSON
  exportarHistorico(): string {
    return JSON.stringify(this.historico, null, 2);
  }

  // Importar histórico de JSON
  importarHistorico(jsonData: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      // Adicionado verificação para string não vazia antes do parse
      if (jsonData) {
        const historico = JSON.parse(jsonData);
        if (Array.isArray(historico)) {
          this.historico = historico;
          this.salvarHistorico();
          return true;
        }
      }
    } catch (error) {
      console.error('Erro ao importar histórico:', error);
    }
    return false;
  }

  // Salvar histórico no localStorage
  private salvarHistorico(): void {
    if (typeof window === 'undefined') return;
    try {
      userDataService.updateUserData({ essays: this.historico });
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  }
}
