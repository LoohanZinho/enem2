// API de Correção de Redações - Retorna JSON estruturado
// Formato compatível com o solicitado pelo usuário

import { RedacaoAIService } from './RedacaoAIService';

export interface CompetenciaAPI {
  nota: number;
  feedback: string;
  pontos_fortes: string[];
  pontos_fracos: string[];
  sugestoes: string[];
  detalhes: {
    erros_encontrados: number;
    qualidade: 'excelente' | 'bom' | 'regular' | 'ruim' | 'muito_ruim';
    percentual_adequacao: number;
  };
}

export interface CorrecaoAPIResponse {
  competencias: {
    competencia_1: CompetenciaAPI;
    competencia_2: CompetenciaAPI;
    competencia_3: CompetenciaAPI;
    competencia_4: CompetenciaAPI;
    competencia_5: CompetenciaAPI;
  };
  nota_total: number;
  nivel_geral: 'excelente' | 'bom' | 'regular' | 'ruim' | 'muito_ruim';
  sugestoes_gerais: string[];
  resumo: {
    pontos_fortes_gerais: string[];
    pontos_fracos_gerais: string[];
    competencia_mais_forte: number;
    competencia_mais_fraca: number;
  };
  estatisticas: {
    total_palavras: number;
    total_paragrafos: number;
    tempo_correcao: number;
  };
  metadata: {
    data_correcao: string;
    tema: string;
    id: string;
  };
}

export class CorrecaoAPI {
  private redacaoService: RedacaoAIService;

  constructor() {
    this.redacaoService = RedacaoAIService.getInstance();
  }

  // Endpoint principal de correção
  async corrigirRedacao(texto: string, tema: string): Promise<CorrecaoAPIResponse> {
    console.log('🚀 API: Iniciando correção de redação...');
    console.log(`📝 Tema: ${tema}`);
    console.log(`📄 Texto: ${texto.substring(0, 100)}...`);

    try {
      // Realizar correção usando o serviço realista
      const correcao = await this.redacaoService.corrigirRedacao(texto, tema);
      
      // Converter para formato API
      const resposta = this.converterParaAPI(correcao);
      
      console.log(`✅ API: Correção concluída - Nota: ${resposta.nota_total}/1000`);
      
      return resposta;
    } catch (error) {
      console.error('❌ API: Erro na correção:', error);
      throw new Error('Erro interno na correção da redação');
    }
  }

  // Converter correção para formato API
  private converterParaAPI(correcao: any): CorrecaoAPIResponse {
    const competencias = correcao.competencias;
    
    return {
      competencias: {
        competencia_1: this.converterCompetencia(competencias[0]),
        competencia_2: this.converterCompetencia(competencias[1]),
        competencia_3: this.converterCompetencia(competencias[2]),
        competencia_4: this.converterCompetencia(competencias[3]),
        competencia_5: this.converterCompetencia(competencias[4])
      },
      nota_total: correcao.notaTotal,
      nivel_geral: this.converterNivel(correcao.nivel),
      sugestoes_gerais: this.gerarSugestoesGerais(competencias),
      resumo: this.gerarResumo(competencias),
      estatisticas: {
        total_palavras: correcao.estatisticas.totalPalavras,
        total_paragrafos: correcao.estatisticas.totalParagrafos,
        tempo_correcao: correcao.estatisticas.tempoCorrecao
      },
      metadata: {
        data_correcao: correcao.dataCorrecao.toISOString(),
        tema: correcao.tema,
        id: correcao.id
      }
    };
  }

  // Converter competência para formato API
  private converterCompetencia(competencia: any): CompetenciaAPI {
    return {
      nota: competencia.nota,
      feedback: competencia.justificativa,
      pontos_fortes: competencia.pontosFortes,
      pontos_fracos: competencia.pontosFracos,
      sugestoes: competencia.sugestoes,
      detalhes: {
        erros_encontrados: this.contarErrosCompetencia(competencia),
        qualidade: this.determinarQualidade(competencia.nota),
        percentual_adequacao: Math.round((competencia.nota / 200) * 100)
      }
    };
  }

  // Contar erros específicos da competência
  private contarErrosCompetencia(competencia: any): number {
    // Baseado nos pontos fracos e sugestões
    let erros = 0;
    
    if (competencia.pontosFracos.length > 0) {
      erros += competencia.pontosFracos.length;
    }
    
    if (competencia.sugestoes.length > 0) {
      erros += competencia.sugestoes.length;
    }
    
    return erros;
  }

  // Determinar qualidade baseada na nota
  private determinarQualidade(nota: number): 'excelente' | 'bom' | 'regular' | 'ruim' | 'muito_ruim' {
    if (nota >= 160) return 'excelente';
    if (nota >= 120) return 'bom';
    if (nota >= 80) return 'regular';
    if (nota >= 40) return 'ruim';
    return 'muito_ruim';
  }

  // Converter nível para formato API
  private converterNivel(nivel: string): 'excelente' | 'bom' | 'regular' | 'ruim' | 'muito_ruim' {
    switch (nivel) {
      case 'Excelente': return 'excelente';
      case 'Muito Bom': return 'bom';
      case 'Bom': return 'bom';
      case 'Regular': return 'regular';
      case 'Insuficiente': return 'ruim';
      default: return 'regular';
    }
  }

  // Gerar sugestões gerais
  private gerarSugestoesGerais(competencias: any[]): string[] {
    const sugestoes: string[] = [];
    
    // Identificar competências com menor nota
    const notas = competencias.map(comp => comp.nota);
    const menorNota = Math.min(...notas);
    const competenciaMaisFraca = competencias.find(comp => comp.nota === menorNota);
    
    if (competenciaMaisFraca) {
      sugestoes.push(`Foque na Competência ${competenciaMaisFraca.competencia} para melhorar significativamente sua nota.`);
    }
    
    // Sugestões baseadas em problemas comuns
    const problemasComuns = this.identificarProblemasComuns(competencias);
    sugestoes.push(...problemasComuns);
    
    return sugestoes;
  }

  // Identificar problemas comuns
  private identificarProblemasComuns(competencias: any[]): string[] {
    const sugestoes: string[] = [];
    
    // Competência 1 - Gramática
    if (competencias[0].nota < 120) {
      sugestoes.push('Revise cuidadosamente a gramática, ortografia e concordância.');
    }
    
    // Competência 2 - Tema
    if (competencias[1].nota < 120) {
      sugestoes.push('Mantenha o foco no tema proposto e aplique conhecimentos de diferentes áreas.');
    }
    
    // Competência 3 - Argumentação
    if (competencias[2].nota < 120) {
      sugestoes.push('Fortaleça a argumentação com exemplos concretos e dados específicos.');
    }
    
    // Competência 4 - Coesão
    if (competencias[3].nota < 120) {
      sugestoes.push('Use mais conectivos e melhore a coesão entre as ideias.');
    }
    
    // Competência 5 - Proposta
    if (competencias[4].nota < 120) {
      sugestoes.push('Detalhe melhor a proposta de intervenção com agentes e meios específicos.');
    }
    
    return sugestoes;
  }

  // Gerar resumo
  private gerarResumo(competencias: any[]): any {
    const notas = competencias.map(comp => comp.nota);
    const maiorNota = Math.max(...notas);
    const menorNota = Math.min(...notas);
    
    const competenciaMaisForte = competencias.find(comp => comp.nota === maiorNota)?.competencia || 1;
    const competenciaMaisFraca = competencias.find(comp => comp.nota === menorNota)?.competencia || 1;
    
    const pontosFortesGerais = competencias
      .filter(comp => comp.nota >= 140)
      .map(comp => `Competência ${comp.competencia}: ${comp.pontosFortes.join(', ')}`);
    
    const pontosFracosGerais = competencias
      .filter(comp => comp.nota < 120)
      .map(comp => `Competência ${comp.competencia}: ${comp.pontosFracos.join(', ')}`);
    
    return {
      pontos_fortes_gerais: pontosFortesGerais,
      pontos_fracos_gerais: pontosFracosGerais,
      competencia_mais_forte: competenciaMaisForte,
      competencia_mais_fraca: competenciaMaisFraca
    };
  }

  // Endpoint para correção em lote
  async corrigirRedacoesLote(redacoes: Array<{texto: string, tema: string}>): Promise<CorrecaoAPIResponse[]> {
    console.log(`🚀 API: Iniciando correção em lote de ${redacoes.length} redações...`);
    
    const correcoes = await Promise.all(
      redacoes.map(redacao => this.corrigirRedacao(redacao.texto, redacao.tema))
    );
    
    console.log(`✅ API: Correção em lote concluída`);
    
    return correcoes;
  }

  // Endpoint para estatísticas
  async obterEstatisticas(correcoes: CorrecaoAPIResponse[]): Promise<any> {
    const totalRedacoes = correcoes.length;
    const mediaGeral = correcoes.reduce((sum, corr) => sum + corr.nota_total, 0) / totalRedacoes;
    const melhorNota = Math.max(...correcoes.map(corr => corr.nota_total));
    const piorNota = Math.min(...correcoes.map(corr => corr.nota_total));
    
    // Estatísticas por competência
    const estatisticasCompetencias = [1, 2, 3, 4, 5].map(comp => {
      const notas = correcoes.map(corr => corr.competencias[`competencia_${comp}` as keyof typeof corr.competencias].nota);
      return {
        competencia: comp,
        media: notas.reduce((sum, nota) => sum + nota, 0) / notas.length,
        melhor: Math.max(...notas),
        pior: Math.min(...notas)
      };
    });
    
    return {
      total_redacoes: totalRedacoes,
      media_geral: Math.round(mediaGeral),
      melhor_nota: melhorNota,
      pior_nota: piorNota,
      estatisticas_competencias: estatisticasCompetencias
    };
  }
}









