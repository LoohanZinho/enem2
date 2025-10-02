// Serviço para gerenciar histórico de correções de redação
import { CorrecaoRedacao } from './RedacaoAIService';
import { userDataService, UserData } from './UserDataService';

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

  private async carregarHistorico(): Promise<void> {
    if (typeof window === 'undefined') {
      this.historico = [];
      return;
    }
    try {
      const userData = await userDataService.loadUserData();
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
  
  async salvarCorrecao(correcao: CorrecaoRedacao): Promise<void> {
    if (typeof window === 'undefined') return;
    await this.carregarHistorico(); // Garante que temos a lista mais recente
    this.historico.unshift(correcao); // Adiciona no início da lista
    await this.salvarHistorico();
  }

  async obterHistorico(): Promise<CorrecaoRedacao[]> {
    if (typeof window !== 'undefined') {
      await this.carregarHistorico();
    }
    return [...this.historico];
  }

  async obterCorrecaoPorId(id: string): Promise<CorrecaoRedacao | undefined> {
    if (typeof window !== 'undefined') {
      await this.carregarHistorico();
    }
    return this.historico.find(correcao => correcao.id === id);
  }

  async obterUltimasCorrecoes(quantidade: number = 10): Promise<CorrecaoRedacao[]> {
    if (typeof window !== 'undefined') {
      await this.carregarHistorico();
    }
    return this.historico.slice(0, quantidade);
  }

  async obterCorrecoesPorTema(tema: string): Promise<CorrecaoRedacao[]> {
    if (typeof window !== 'undefined') {
      await this.carregarHistorico();
    }
    return this.historico.filter(correcao => 
      correcao.tema.toLowerCase().includes(tema.toLowerCase())
    );
  }

  async obterCorrecoesPorNivel(nivel: string): Promise<CorrecaoRedacao[]> {
    if (typeof window !== 'undefined') {
      await this.carregarHistorico();
    }
    return this.historico.filter(correcao => correcao.nivel === nivel);
  }

  async obterEstatisticas(): Promise<EstatisticasHistorico> {
    if (typeof window !== 'undefined') {
      await this.carregarHistorico();
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

    const evolucaoCompetencias: { [key: number]: number[] } = {};
    for (let i = 1; i <= 5; i++) {
      evolucaoCompetencias[i] = this.historico.map(c => 
        c.competencias.find(comp => comp.competencia === i)?.nota || 0
      );
    }

    const temasCount: { [key: string]: number } = {};
    this.historico.forEach(correcao => {
      temasCount[correcao.tema] = (temasCount[correcao.tema] || 0) + 1;
    });
    const temasMaisFrequentes = Object.entries(temasCount)
      .map(([tema, quantidade]) => ({ tema, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);

    const niveisCount: { [key: string]: number } = {};
    this.historico.forEach(correcao => {
      niveisCount[correcao.nivel] = (niveisCount[correcao.nivel] || 0) + 1;
    });
    const nivelMaisComum = Object.entries(niveisCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Nenhum';

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

  async removerCorrecao(id: string): Promise<boolean> {
    const index = this.historico.findIndex(correcao => correcao.id === id);
    if (index !== -1) {
      this.historico.splice(index, 1);
      await this.salvarHistorico();
      return true;
    }
    return false;
  }

  async limparHistorico(): Promise<void> {
    this.historico = [];
    await this.salvarHistorico();
  }

  exportarHistorico(): string {
    return JSON.stringify(this.historico, null, 2);
  }

  async importarHistorico(jsonData: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      if (jsonData) {
        const historico = JSON.parse(jsonData);
        if (Array.isArray(historico)) {
          this.historico = historico;
          await this.salvarHistorico();
          return true;
        }
      }
    } catch (error) {
      console.error('Erro ao importar histórico:', error);
    }
    return false;
  }

  private async salvarHistorico(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      await userDataService.updateUserData({ essays: this.historico });
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  }
}
