// Serviço de Relatórios e Métricas de Evolução
// Sistema completo de análise de progresso e estatísticas

import { userDataService, UserData } from './UserDataService';

export interface RelatorioEvolucao {
  id: string;
  dataInicio: Date;
  dataFim: Date;
  redacoes: CorrecaoRedacao[];
  evolucaoCompetencias: { [key: number]: number[] };
  mediaGeral: number;
  comparacaoNacional: {
    mediaNacional: number;
    posicaoPercentil: number;
    ranking: number;
    totalParticipantes: number;
  };
  estatisticas: {
    totalRedacoes: number;
    mediaUltimoMes: number;
    melhorNota: number;
    piorNota: number;
    tendencia: 'crescimento' | 'estagnacao' | 'declinio';
    velocidadeEvolucao: number; // pontos por semana
  };
  insights: {
    competenciaMaisForte: number;
    competenciaMaisFraca: number;
    sugestoes: string[];
    metas: MetaEvolucao[];
  };
}

export interface CorrecaoRedacao {
  id: string;
  texto: string;
  tema: string;
  competencias: PontuacaoCompetencia[];
  notaTotal: number;
  notaFinal: number;
  feedbackGeral: string;
  nivel: 'Insuficiente' | 'Regular' | 'Bom' | 'Muito Bom' | 'Excelente';
  dataCorrecao: Date;
  avaliadores: number;
  discrepancia: boolean;
  estatisticas?: { // making it optional
    totalPalavras: number;
    totalParagrafos: number;
    tempoCorrecao: number;
  }
}

export interface PontuacaoCompetencia {
  competencia: number;
  nota: number;
  justificativa: string;
  pontosFortes: string[];
  pontosFracos: string[];
  sugestoes: string[];
}

export interface MetaEvolucao {
  id: string;
  competencia: number;
  notaAtual: number;
  notaMeta: number;
  prazo: Date;
  progresso: number; // 0-100
  status: 'ativa' | 'concluida' | 'atrasada';
}

export interface ComparacaoNacional {
  ano: number;
  mediaNacional: number;
  desvioPadrao: number;
  percentil90: number;
  percentil75: number;
  percentil50: number;
  percentil25: number;
  percentil10: number;
}

export class RelatoriosService {
  private static instance: RelatoriosService;
  private redacoes: CorrecaoRedacao[] = [];
  private metas: MetaEvolucao[] = [];

  public static getInstance(): RelatoriosService {
    if (!RelatoriosService.instance) {
      RelatoriosService.instance = new RelatoriosService();
    }
    return RelatoriosService.instance;
  }

  // Adicionar nova redação ao histórico
  async adicionarRedacao(redacao: CorrecaoRedacao): Promise<void> {
    this.redacoes.push(redacao);
    await this.salvarDados();
  }

  // Gerar relatório de evolução
  gerarRelatorioEvolucao(dataInicio: Date, dataFim: Date): RelatorioEvolucao {
    const redacoesPeriodo = this.redacoes.filter(r => 
      new Date(r.dataCorrecao) >= dataInicio && new Date(r.dataCorrecao) <= dataFim
    );

    const evolucaoCompetencias = this.calcularEvolucaoCompetencias(redacoesPeriodo);
    const mediaGeral = this.calcularMediaGeral(redacoesPeriodo);
    const comparacaoNacional = this.calcularComparacaoNacional(mediaGeral);
    const estatisticas = this.calcularEstatisticas(redacoesPeriodo);
    const insights = this.gerarInsights(redacoesPeriodo, evolucaoCompetencias);

    return {
      id: this.gerarId(),
      dataInicio,
      dataFim,
      redacoes: redacoesPeriodo,
      evolucaoCompetencias,
      mediaGeral,
      comparacaoNacional,
      estatisticas,
      insights
    };
  }

  // Calcular evolução das competências
  private calcularEvolucaoCompetencias(redacoes: CorrecaoRedacao[]): { [key: number]: number[] } {
    const evolucao: { [key: number]: number[] } = {};

    for (let i = 1; i <= 5; i++) {
      evolucao[i] = redacoes
        .map(r => r.competencias.find(c => c.competencia === i)?.nota || 0)
        .filter(nota => nota > 0);
    }

    return evolucao;
  }

  // Calcular média geral
  private calcularMediaGeral(redacoes: CorrecaoRedacao[]): number {
    if (redacoes.length === 0) return 0;
    
    const somaNotas = redacoes.reduce((soma, r) => soma + r.notaFinal, 0);
    return Math.round(somaNotas / redacoes.length);
  }

  // Calcular comparação com dados nacionais
  private calcularComparacaoNacional(mediaGeral: number): {
    mediaNacional: number;
    posicaoPercentil: number;
    ranking: number;
    totalParticipantes: number;
  } {
    // Dados nacionais simulados (baseados em estatísticas reais do ENEM)
    const mediaNacional = 520;
    const desvioPadrao = 100;
    const totalParticipantes = 3500000;

    // Calcular percentil baseado na distribuição normal
    const zScore = (mediaGeral - mediaNacional) / desvioPadrao;
    const posicaoPercentil = this.calcularPercentil(zScore);
    
    const ranking = Math.round(totalParticipantes * (1 - posicaoPercentil / 100));

    return {
      mediaNacional,
      posicaoPercentil,
      ranking,
      totalParticipantes
    };
  }

  // Calcular percentil baseado no Z-score
  private calcularPercentil(zScore: number): number {
    // Aproximação da função de distribuição normal acumulada
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = zScore < 0 ? -1 : 1;
    const x = Math.abs(zScore) / Math.sqrt(2);

    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return Math.round((0.5 * (1 + sign * y)) * 100);
  }

  // Calcular estatísticas gerais
  private calcularEstatisticas(redacoes: CorrecaoRedacao[]): {
    totalRedacoes: number;
    mediaUltimoMes: number;
    melhorNota: number;
    piorNota: number;
    tendencia: 'crescimento' | 'estagnacao' | 'declinio';
    velocidadeEvolucao: number;
  } {
    if (redacoes.length === 0) {
      return {
        totalRedacoes: 0,
        mediaUltimoMes: 0,
        melhorNota: 0,
        piorNota: 0,
        tendencia: 'estagnacao',
        velocidadeEvolucao: 0
      };
    }

    const totalRedacoes = redacoes.length;
    const melhorNota = Math.max(...redacoes.map(r => r.notaFinal));
    const piorNota = Math.min(...redacoes.map(r => r.notaFinal));

    // Calcular média do último mês
    const umMesAtras = new Date();
    umMesAtras.setMonth(umMesAtras.getMonth() - 1);
    
    const redacoesUltimoMes = redacoes.filter(r => new Date(r.dataCorrecao) >= umMesAtras);
    const mediaUltimoMes = redacoesUltimoMes.length > 0 
      ? Math.round(redacoesUltimoMes.reduce((soma, r) => soma + r.notaFinal, 0) / redacoesUltimoMes.length)
      : 0;

    // Calcular tendência
    const tendencia = this.calcularTendencia(redacoes);
    
    // Calcular velocidade de evolução (pontos por semana)
    const velocidadeEvolucao = this.calcularVelocidadeEvolucao(redacoes);

    return {
      totalRedacoes,
      mediaUltimoMes,
      melhorNota,
      piorNota,
      tendencia,
      velocidadeEvolucao
    };
  }

  // Calcular tendência de evolução
  private calcularTendencia(redacoes: CorrecaoRedacao[]): 'crescimento' | 'estagnacao' | 'declinio' {
    if (redacoes.length < 3) return 'estagnacao';

    const notas = redacoes.map(r => r.notaFinal);
    const primeiraMetade = notas.slice(0, Math.floor(notas.length / 2));
    const segundaMetade = notas.slice(Math.floor(notas.length / 2));

    const mediaPrimeira = primeiraMetade.reduce((soma, nota) => soma + nota, 0) / primeiraMetade.length;
    const mediaSegunda = segundaMetade.reduce((soma, nota) => soma + nota, 0) / segundaMetade.length;

    const diferenca = mediaSegunda - mediaPrimeira;

    if (diferenca > 20) return 'crescimento';
    if (diferenca < -20) return 'declinio';
    return 'estagnacao';
  }

  // Calcular velocidade de evolução
  private calcularVelocidadeEvolucao(redacoes: CorrecaoRedacao[]): number {
    if (redacoes.length < 2) return 0;

    const redacoesOrdenadas = redacoes.sort((a, b) => new Date(a.dataCorrecao).getTime() - new Date(b.dataCorrecao).getTime());
    const primeira = redacoesOrdenadas[0];
    const ultima = redacoesOrdenadas[redacoesOrdenadas.length - 1];

    const diferencaTempo = new Date(ultima.dataCorrecao).getTime() - new Date(primeira.dataCorrecao).getTime();
    const semanas = diferencaTempo / (1000 * 60 * 60 * 24 * 7);

    if (semanas === 0) return 0;

    const diferencaNota = ultima.notaFinal - primeira.notaFinal;
    return Math.round(diferencaNota / semanas);
  }

  // Gerar insights e sugestões
  private gerarInsights(redacoes: CorrecaoRedacao[], evolucaoCompetencias: { [key: number]: number[] }): {
    competenciaMaisForte: number;
    competenciaMaisFraca: number;
    sugestoes: string[];
    metas: MetaEvolucao[];
  } {
    // Calcular médias por competência
    const mediasCompetencias: { [key: number]: number } = {};
    
    for (let i = 1; i <= 5; i++) {
      const notas = evolucaoCompetencias[i] || [];
      mediasCompetencias[i] = notas.length > 0 
        ? Math.round(notas.reduce((soma, nota) => soma + nota, 0) / notas.length)
        : 0;
    }

    // Encontrar competência mais forte e mais fraca
    const competenciaMaisForte = Object.entries(mediasCompetencias)
      .reduce((max, [comp, nota]) => nota > mediasCompetencias[max] ? parseInt(comp) : max, 1);
    
    const competenciaMaisFraca = Object.entries(mediasCompetencias)
      .reduce((min, [comp, nota]) => nota < mediasCompetencias[min] ? parseInt(comp) : min, 1);

    // Gerar sugestões
    const sugestoes = this.gerarSugestoes(mediasCompetencias, competenciaMaisFraca);
    
    // Gerar metas
    const metas = this.gerarMetas(mediasCompetencias, competenciaMaisFraca);

    return {
      competenciaMaisForte,
      competenciaMaisFraca,
      sugestoes,
      metas
    };
  }

  // Gerar sugestões personalizadas
  private gerarSugestoes(mediasCompetencias: { [key: number]: number }, competenciaMaisFraca: number): string[] {
    const sugestoes: string[] = [];
    const nomesCompetencias = {
      1: 'Domínio da norma culta',
      2: 'Compreensão da proposta',
      3: 'Seleção e organização de informações',
      4: 'Mecanismos linguísticos',
      5: 'Proposta de intervenção'
    };

    // Sugestão geral baseada na competência mais fraca
    const notaMaisFraca = mediasCompetencias[competenciaMaisFraca];
    if (notaMaisFraca < 100) {
      sugestoes.push(`Foque especialmente na ${nomesCompetencias[competenciaMaisFraca]} - sua área de maior necessidade de melhoria.`);
    }

    // Sugestões específicas por competência
    Object.entries(mediasCompetencias).forEach(([comp, nota]) => {
      const competencia = parseInt(comp);
      if (nota < 120) {
        switch (competencia) {
          case 1:
            sugestoes.push('Pratique gramática e ortografia diariamente. Use aplicativos de correção automática.');
            break;
          case 2:
            sugestoes.push('Leia mais sobre temas atuais e pratique a interpretação de propostas de redação.');
            break;
          case 3:
            sugestoes.push('Desenvolva sua capacidade de argumentação e organização de ideias.');
            break;
          case 4:
            sugestoes.push('Estude conectivos e mecanismos de coesão textual.');
            break;
          case 5:
            sugestoes.push('Pratique a elaboração de propostas de intervenção detalhadas e viáveis.');
            break;
        }
      }
    });

    // Sugestão de frequência
    const totalRedacoes = Object.values(mediasCompetencias).filter(nota => nota > 0).length;
    if (totalRedacoes < 5) {
      sugestoes.push('Aumente a frequência de redações para pelo menos 2 por semana.');
    }

    return sugestoes;
  }

  // Gerar metas de evolução
  private gerarMetas(mediasCompetencias: { [key: number]: number }, competenciaMaisFraca: number): MetaEvolucao[] {
    const metas: MetaEvolucao[] = [];
    const nomesCompetencias = {
      1: 'Domínio da norma culta',
      2: 'Compreensão da proposta',
      3: 'Seleção e organização de informações',
      4: 'Mecanismos linguísticos',
      5: 'Proposta de intervenção'
    };

    // Meta para competência mais fraca
    const notaAtual = mediasCompetencias[competenciaMaisFraca];
    if (notaAtual < 150) {
      const prazo = new Date();
      prazo.setMonth(prazo.getMonth() + 2); // 2 meses para melhorar

      metas.push({
        id: this.gerarId(),
        competencia: competenciaMaisFraca,
        notaAtual,
        notaMeta: Math.min(150, notaAtual + 50),
        prazo,
        progresso: 0,
        status: 'ativa'
      });
    }

    // Metas para outras competências que precisam de melhoria
    Object.entries(mediasCompetencias).forEach(([comp, nota]) => {
      const competencia = parseInt(comp);
      if (competencia !== competenciaMaisFraca && nota < 140 && nota > 0) {
        const prazo = new Date();
        prazo.setMonth(prazo.getMonth() + 1); // 1 mês para melhorar

        metas.push({
          id: this.gerarId(),
          competencia,
          notaAtual: nota,
          notaMeta: Math.min(160, nota + 30),
          prazo,
          progresso: 0,
          status: 'ativa'
        });
      }
    });

    return metas;
  }

  // Obter histórico de redações
  obterHistoricoRedacoes(): CorrecaoRedacao[] {
    return [...this.redacoes].sort((a, b) => new Date(b.dataCorrecao).getTime() - new Date(a.dataCorrecao).getTime());
  }

  // Obter estatísticas resumidas
  obterEstatisticasResumidas(): {
    totalRedacoes: number;
    mediaGeral: number;
    melhorNota: number;
    ultimaRedacao: CorrecaoRedacao | null;
    tendencia: string;
  } {
    const totalRedacoes = this.redacoes.length;
    const mediaGeral = totalRedacoes > 0 
      ? Math.round(this.redacoes.reduce((soma, r) => soma + r.notaFinal, 0) / totalRedacoes)
      : 0;
    const melhorNota = totalRedacoes > 0 
      ? Math.max(...this.redacoes.map(r => r.notaFinal))
      : 0;
    const ultimaRedacao = totalRedacoes > 0 
      ? this.redacoes.sort((a, b) => new Date(b.dataCorrecao).getTime() - new Date(a.dataCorrecao).getTime())[0]
      : null;
    
    const tendencia = this.calcularTendencia(this.redacoes);

    return {
      totalRedacoes,
      mediaGeral,
      melhorNota,
      ultimaRedacao,
      tendencia
    };
  }

  // Exportar dados para CSV
  exportarDadosCSV(): string {
    const headers = [
      'Data',
      'Tema',
      'Nota Final',
      'C1 - Norma Culta',
      'C2 - Compreensão',
      'C3 - Seleção/Organização',
      'C4 - Mecanismos Linguísticos',
      'C5 - Proposta de Intervenção',
      'Nível',
      'Avaliadores',
      'Discrepância'
    ];

    const rows = this.redacoes.map(redacao => [
      new Date(redacao.dataCorrecao).toLocaleDateString('pt-BR'),
      redacao.tema,
      redacao.notaFinal.toString(),
      redacao.competencias.find(c => c.competencia === 1)?.nota.toString() || '0',
      redacao.competencias.find(c => c.competencia === 2)?.nota.toString() || '0',
      redacao.competencias.find(c => c.competencia === 3)?.nota.toString() || '0',
      redacao.competencias.find(c => c.competencia === 4)?.nota.toString() || '0',
      redacao.competencias.find(c => c.competencia === 5)?.nota.toString() || '0',
      redacao.nivel,
      redacao.avaliadores.toString(),
      redacao.discrepancia ? 'Sim' : 'Não'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Salvar dados no localStorage
  private async salvarDados(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      await userDataService.updateUserData({ 
        essays: this.redacoes,
        goals: this.metas 
      });
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  }

  // Carregar dados do localStorage
  async carregarDados(): Promise<void> {
    if (typeof window === 'undefined') {
      this.redacoes = [];
      this.metas = [];
      return;
    }
    try {
      const userData = await userDataService.loadUserData();
      if (userData) {
        this.redacoes = userData.essays ? userData.essays.map((r: any) => ({
          ...r,
          dataCorrecao: new Date(r.dataCorrecao)
        })) : [];

        this.metas = userData.goals ? userData.goals.map((m: any) => ({
          ...m,
          prazo: new Date(m.prazo)
        })) : [];
      } else {
        this.redacoes = [];
        this.metas = [];
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.redacoes = [];
      this.metas = [];
    }
  }

  // Gerar ID único
  private gerarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
