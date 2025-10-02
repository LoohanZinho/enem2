// Sistema de IA para Correção Automática de Redações ENEM
// Baseado na Matriz de Referência Oficial do ENEM

import { Competencia1Analyzer } from "./Competencia1Analyzer";
import { Competencia2Analyzer } from "./Competencia2Analyzer";
import { Competencia3Analyzer } from "./Competencia3Analyzer";
import { Competencia4Analyzer } from "./Competencia4Analyzer";
import { Competencia5Analyzer } from "./Competencia5Analyzer";
import { RealisticCorrectionEngine, CorrecaoRealista } from "./RealisticCorrectionEngine";

export interface Competencia {
  numero: number;
  nome: string;
  descricao: string;
  criterios: string[];
  peso: number;
}

export interface PontuacaoCompetencia {
  competencia: number;
  nota: number; // 0-200
  justificativa: string;
  pontosFortes: string[];
  pontosFracos: string[];
  sugestoes: string[];
}

export interface CorrecaoRedacao {
  id: string;
  texto: string;
  tema: string;
  competencias: PontuacaoCompetencia[];
  notaTotal: number; // 0-1000 (soma das 5 competências)
  notaFinal: number; // 0-1000 (média entre avaliadores)
  feedbackGeral: string;
  nivel: 'Insuficiente' | 'Regular' | 'Bom' | 'Muito Bom' | 'Excelente';
  dataCorrecao: Date;
  avaliadores: number;
  discrepancia: boolean;
  estatisticas: {
    totalPalavras: number;
    totalParagrafos: number;
    tempoCorrecao: number; // em segundos
  };
}

export interface RelatorioEvolucao {
  redacoes: CorrecaoRedacao[];
  evolucaoCompetencias: { [key: number]: number[] };
  mediaGeral: number;
  comparacaoNacional: {
    mediaNacional: number;
    posicaoPercentil: number;
  };
  estatisticas: {
    totalRedacoes: number;
    mediaUltimoMes: number;
    melhorNota: number;
    piorNota: number;
  };
  insights: {
    competenciaMaisForte: number;
    competenciaMaisFraca: number;
    sugestoes: string[];
    metas: MetaEvolucao[];
  };
}

// Matriz de Referência Oficial do ENEM
export const COMPETENCIAS_ENEM: Competencia[] = [
  {
    numero: 1,
    nome: "Domínio da norma culta da língua portuguesa",
    descricao: "Demonstrar domínio da modalidade escrita formal da língua portuguesa",
    criterios: [
      "Ausência de desvios gramaticais",
      "Uso adequado da pontuação",
      "Ortografia correta",
      "Concordância verbal e nominal",
      "Regência verbal e nominal",
      "Uso adequado de pronomes",
      "Estruturação correta de períodos"
    ],
    peso: 1.0
  },
  {
    numero: 2,
    nome: "Compreensão da proposta de redação",
    descricao: "Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento",
    criterios: [
      "Fidelidade ao tema proposto",
      "Desenvolvimento do tema sem tangenciamento",
      "Aplicação de conhecimentos de diferentes áreas",
      "Abordagem crítica e reflexiva",
      "Coerência com a proposta"
    ],
    peso: 1.0
  },
  {
    numero: 3,
    nome: "Seleção, relacionamento, organização e interpretação de informações",
    descricao: "Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos",
    criterios: [
      "Seleção adequada de informações",
      "Relacionamento coerente entre ideias",
      "Organização lógica do texto",
      "Interpretação crítica das informações",
      "Uso de dados e estatísticas relevantes",
      "Argumentação consistente"
    ],
    peso: 1.0
  },
  {
    numero: 4,
    nome: "Conhecimento dos mecanismos linguísticos",
    descricao: "Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação",
    criterios: [
      "Uso adequado de conectivos",
      "Coesão textual",
      "Progressão temática",
      "Paralelismo sintático",
      "Uso de recursos expressivos",
      "Variedade lexical"
    ],
    peso: 1.0
  },
  {
    numero: 5,
    nome: "Elaboração de proposta de intervenção",
    descricao: "Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos",
    criterios: [
      "Proposta clara e específica",
      "Viabilidade da proposta",
      "Respeito aos direitos humanos",
      "Detalhamento da proposta",
      "Agentes envolvidos",
      "Meios de implementação"
    ],
    peso: 1.0
  }
];

export class RedacaoAIService {
  private static instance: RedacaoAIService;
  private competencia1Analyzer: Competencia1Analyzer;
  private competencia2Analyzer: Competencia2Analyzer;
  private competencia3Analyzer: Competencia3Analyzer;
  private competencia4Analyzer: Competencia4Analyzer;
  private competencia5Analyzer: Competencia5Analyzer;
  private realisticEngine: RealisticCorrectionEngine;
  
  constructor() {
    this.competencia1Analyzer = new Competencia1Analyzer();
    this.competencia2Analyzer = new Competencia2Analyzer();
    this.competencia3Analyzer = new Competencia3Analyzer();
    this.competencia4Analyzer = new Competencia4Analyzer();
    this.competencia5Analyzer = new Competencia5Analyzer();
    this.realisticEngine = new RealisticCorrectionEngine();
  }
  
  public static getInstance(): RedacaoAIService {
    if (!RedacaoAIService.instance) {
      RedacaoAIService.instance = new RedacaoAIService();
    }
    return RedacaoAIService.instance;
  }

  // Análise principal da redação - MÉTODO REALISTA
  async corrigirRedacao(texto: string, tema: string): Promise<CorrecaoRedacao> {
    console.log('🚀 INICIANDO CORREÇÃO REALISTA...');
    
    // Usar o motor realista para análise
    const correcaoRealista = await this.realisticEngine.corrigirRedacaoRealista(texto, tema);
    
    // Converter para formato compatível
    const competencias: PontuacaoCompetencia[] = [
      {
        competencia: 1,
        nota: correcaoRealista.competencias.competencia_1.nota,
        justificativa: correcaoRealista.competencias.competencia_1.feedback,
        pontosFortes: correcaoRealista.competencias.competencia_1.pontosFortes,
        pontosFracos: correcaoRealista.competencias.competencia_1.pontosFracos,
        sugestoes: correcaoRealista.competencias.competencia_1.sugestoes
      },
      {
        competencia: 2,
        nota: correcaoRealista.competencias.competencia_2.nota,
        justificativa: correcaoRealista.competencias.competencia_2.feedback,
        pontosFortes: correcaoRealista.competencias.competencia_2.pontosFortes,
        pontosFracos: correcaoRealista.competencias.competencia_2.pontosFracos,
        sugestoes: correcaoRealista.competencias.competencia_2.sugestoes
      },
      {
        competencia: 3,
        nota: correcaoRealista.competencias.competencia_3.nota,
        justificativa: correcaoRealista.competencias.competencia_3.feedback,
        pontosFortes: correcaoRealista.competencias.competencia_3.pontosFortes,
        pontosFracos: correcaoRealista.competencias.competencia_3.pontosFracos,
        sugestoes: correcaoRealista.competencias.competencia_3.sugestoes
      },
      {
        competencia: 4,
        nota: correcaoRealista.competencias.competencia_4.nota,
        justificativa: correcaoRealista.competencias.competencia_4.feedback,
        pontosFortes: correcaoRealista.competencias.competencia_4.pontosFortes,
        pontosFracos: correcaoRealista.competencias.competencia_4.pontosFracos,
        sugestoes: correcaoRealista.competencias.competencia_4.sugestoes
      },
      {
        competencia: 5,
        nota: correcaoRealista.competencias.competencia_5.nota,
        justificativa: correcaoRealista.competencias.competencia_5.feedback,
        pontosFortes: correcaoRealista.competencias.competencia_5.pontosFortes,
        pontosFracos: correcaoRealista.competencias.competencia_5.pontosFracos,
        sugestoes: correcaoRealista.competencias.competencia_5.sugestoes
      }
    ];

    const id = this.gerarId();
    const inicioCorrecao = Date.now();
    
    // Calcular estatísticas
    const totalPalavras = texto.split(/\s+/).filter(palavra => palavra.length > 0).length;
    const totalParagrafos = texto.split(/\n\s*\n/).filter(paragrafo => paragrafo.trim().length > 0).length;
    const tempoCorrecao = Math.round((Date.now() - inicioCorrecao) / 1000);

    // Gerar feedback geral baseado na correção realista
    const feedbackGeral = this.gerarFeedbackRealista(correcaoRealista);

    return {
      id,
      texto,
      tema,
      competencias,
      notaTotal: correcaoRealista.nota_total,
      notaFinal: correcaoRealista.nota_total,
      feedbackGeral,
      nivel: this.converterNivel(correcaoRealista.nivel_geral),
      dataCorrecao: new Date(),
      avaliadores: 1,
      discrepancia: false,
      estatisticas: {
        totalPalavras,
        totalParagrafos,
        tempoCorrecao
      }
    };
  }

  // Simulação de dupla correção
  async corrigirRedacaoDupla(texto: string, tema: string): Promise<CorrecaoRedacao> {
    const [correcao1, correcao2] = await Promise.all([
      this.corrigirRedacao(texto, tema),
      this.corrigirRedacao(texto, tema)
    ]);

    const notaFinal = Math.round((correcao1.notaTotal + correcao2.notaTotal) / 2); // 0-1000
    const discrepancia = Math.abs(correcao1.notaTotal - correcao2.notaTotal) > 100;

    return {
      ...correcao1,
      notaTotal: Math.round((correcao1.notaTotal + correcao2.notaTotal) / 2), // 0-1000
      notaFinal, // 0-1000
      avaliadores: 2,
      discrepancia
    };
  }

  // Análise da Competência 1 - Domínio da norma culta
  private async analisarCompetencia1(texto: string): Promise<PontuacaoCompetencia> {
    const analise = this.competencia1Analyzer.analisar(texto);
    const nota = this.competencia1Analyzer.calcularNota(analise);
    const feedback = this.competencia1Analyzer.gerarFeedback(analise, nota);
    
    return {
      competencia: 1,
      nota,
      justificativa: feedback.justificativa,
      pontosFortes: feedback.pontosFortes,
      pontosFracos: feedback.pontosFracos,
      sugestoes: feedback.sugestoes
    };
  }

  // Análise da Competência 2 - Compreensão da proposta
  private async analisarCompetencia2(texto: string, tema: string): Promise<PontuacaoCompetencia> {
    const analise = this.competencia2Analyzer.analisar(texto, tema);
    const nota = this.competencia2Analyzer.calcularNota(analise);
    const feedback = this.competencia2Analyzer.gerarFeedback(analise, nota);
    
    return {
      competencia: 2,
      nota,
      justificativa: feedback.justificativa,
      pontosFortes: feedback.pontosFortes,
      pontosFracos: feedback.pontosFracos,
      sugestoes: feedback.sugestoes
    };
  }

  // Análise da Competência 3 - Seleção e organização de informações
  private async analisarCompetencia3(texto: string): Promise<PontuacaoCompetencia> {
    const analise = this.competencia3Analyzer.analisar(texto);
    const nota = this.competencia3Analyzer.calcularNota(analise);
    const feedback = this.competencia3Analyzer.gerarFeedback(analise, nota);
    
    return {
      competencia: 3,
      nota,
      justificativa: feedback.justificativa,
      pontosFortes: feedback.pontosFortes,
      pontosFracos: feedback.pontosFracos,
      sugestoes: feedback.sugestoes
    };
  }

  // Análise da Competência 4 - Mecanismos linguísticos
  private async analisarCompetencia4(texto: string): Promise<PontuacaoCompetencia> {
    const analise = this.competencia4Analyzer.analisar(texto);
    const nota = this.competencia4Analyzer.calcularNota(analise);
    const feedback = this.competencia4Analyzer.gerarFeedback(analise, nota);
    
    return {
      competencia: 4,
      nota,
      justificativa: feedback.justificativa,
      pontosFortes: feedback.pontosFortes,
      pontosFracos: feedback.pontosFracos,
      sugestoes: feedback.sugestoes
    };
  }

  // Análise da Competência 5 - Proposta de intervenção
  private async analisarCompetencia5(texto: string): Promise<PontuacaoCompetencia> {
    const analise = this.competencia5Analyzer.analisar(texto);
    const nota = this.competencia5Analyzer.calcularNota(analise);
    const feedback = this.competencia5Analyzer.gerarFeedback(analise, nota);
    
    return {
      competencia: 5,
      nota,
      justificativa: feedback.justificativa,
      pontosFortes: feedback.pontosFortes,
      pontosFracos: feedback.pontosFracos,
      sugestoes: feedback.sugestoes
    };
  }

  // Métodos auxiliares para análise
  private gerarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private determinarNivel(notaTotal: number): 'Insuficiente' | 'Regular' | 'Bom' | 'Muito Bom' | 'Excelente' {
    if (notaTotal < 200) return 'Insuficiente';      // 0-199
    if (notaTotal < 400) return 'Regular';           // 200-399
    if (notaTotal < 600) return 'Bom';               // 400-599
    if (notaTotal < 800) return 'Muito Bom';         // 600-799
    return 'Excelente';                              // 800-1000
  }

  private gerarFeedbackGeral(competencias: PontuacaoCompetencia[], notaTotal: number): string {
    const nivel = this.determinarNivel(notaTotal);
    const competenciaMaisFraca = competencias.reduce((min, comp) => comp.nota < min.nota ? comp : min);
    const competenciaMaisForte = competencias.reduce((max, comp) => comp.nota > max.nota ? comp : max);

    return `Sua redação obteve nota ${notaTotal}/1000 pontos, classificada como ${nivel}. ` +
           `Sua maior força está na Competência ${competenciaMaisForte.competencia} (${competenciaMaisForte.nota}/200 pontos), ` +
           `enquanto a Competência ${competenciaMaisFraca.competencia} (${competenciaMaisFraca.nota}/200 pontos) precisa de mais atenção. ` +
           `Continue praticando e focando nas áreas de melhoria indicadas.`;
  }

  // Gerar feedback realista baseado na correção
  private gerarFeedbackRealista(correcaoRealista: CorrecaoRealista): string {
    const { nota_total, nivel_geral, sugestoes_gerais, resumo } = correcaoRealista;
    
    let feedback = `Sua redação obteve nota ${nota_total}/1000 pontos, classificada como ${nivel_geral.toUpperCase()}. `;
    
    if (resumo.pontos_fortes_gerais.length > 0) {
      feedback += `Pontos fortes: ${resumo.pontos_fortes_gerais.join(', ')}. `;
    }
    
    if (resumo.pontos_fracos_gerais.length > 0) {
      feedback += `Áreas de melhoria: ${resumo.pontos_fracos_gerais.join(', ')}. `;
    }
    
    if (sugestoes_gerais.length > 0) {
      feedback += `Sugestões: ${sugestoes_gerais.join(' ')}`;
    }
    
    return feedback;
  }

  // Converter nível do formato realista para o formato original
  private converterNivel(nivel: string): 'Insuficiente' | 'Regular' | 'Bom' | 'Muito Bom' | 'Excelente' {
    switch (nivel) {
      case 'excelente': return 'Excelente';
      case 'bom': return 'Bom';
      case 'regular': return 'Regular';
      case 'ruim': return 'Insuficiente';
      case 'muito_ruim': return 'Insuficiente';
      default: return 'Regular';
    }
  }

}
