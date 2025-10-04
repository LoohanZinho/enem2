// Sistema de IA para Correção Automática de Redações ENEM
// Baseado na Matriz de Referência Oficial do ENEM
import { corrigirRedacao } from '@/ai/flows/redacao-flow';
import type { CorrecaoRedacaoInput, CorrecaoRedacaoOutput } from '@/ai/flows/redacao-types';

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

export interface MetaEvolucao {
  id: string;
  competencia: number;
  notaAtual: number;
  notaMeta: number;
  prazo: Date;
  progresso: number;
  status: 'ativa' | 'concluida' | 'atrasada';
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
    descricao: "Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento para desenvolver o tema, dentro dos limites estruturais do texto dissertativo-argumentativo em prosa",
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
    descricao: "Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos em defesa de um ponto de vista",
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
  
  public static getInstance(): RedacaoAIService {
    if (!RedacaoAIService.instance) {
      RedacaoAIService.instance = new RedacaoAIService();
    }
    return RedacaoAIService.instance;
  }

  // Análise principal da redação usando Genkit
  async corrigirRedacao(texto: string, tema: string): Promise<CorrecaoRedacao> {
    console.log('🚀 INICIANDO CORREÇÃO COM IA...');
    const startTime = Date.now();

    const input: CorrecaoRedacaoInput = { texto, tema };
    
    // Chama o flow do Genkit
    const aiResult: CorrecaoRedacaoOutput = await corrigirRedacao(input);

    const totalPalavras = texto.split(/\s+/).filter(Boolean).length;
    const totalParagrafos = texto.split('\n').filter(p => p.trim().length > 10).length;
    
    return {
      id: this.gerarId(),
      texto,
      tema,
      competencias: aiResult.competencias,
      notaTotal: aiResult.notaFinal,
      notaFinal: aiResult.notaFinal, // Para um único avaliador, notaTotal e notaFinal são iguais
      feedbackGeral: aiResult.feedbackGeral,
      nivel: aiResult.nivel,
      dataCorrecao: new Date(),
      avaliadores: 1,
      discrepancia: false,
      estatisticas: {
        totalPalavras,
        totalParagrafos,
        tempoCorrecao: (Date.now() - startTime) / 1000,
      },
    };
  }

  // Simulação de dupla correção
  async corrigirRedacaoDupla(texto: string, tema: string): Promise<CorrecaoRedacao> {
    const [correcao1, correcao2] = await Promise.all([
      this.corrigirRedacao(texto, tema),
      this.corrigirRedacao(texto, tema) // Em um cenário real, poderia haver uma segunda chamada com um prompt ligeiramente diferente
    ]);

    const notaFinal = Math.round((correcao1.notaTotal + correcao2.notaTotal) / 2);
    const discrepancia = Math.abs(correcao1.notaTotal - correcao2.notaTotal) > 100;

    return {
      ...correcao1,
      notaTotal: Math.round((correcao1.notaTotal + correcao2.notaTotal) / 2),
      notaFinal,
      avaliadores: 2,
      discrepancia
    };
  }

  private gerarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
