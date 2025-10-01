// Motor de Correção Realista - Gera notas baseadas na qualidade real do texto
// Sistema que analisa profundamente o texto e gera notas variadas e realistas

import { Competencia1Analyzer } from './Competencia1Analyzer';
import { Competencia2Analyzer } from './Competencia2Analyzer';
import { Competencia3Analyzer } from './Competencia3Analyzer';
import { Competencia4Analyzer } from './Competencia4Analyzer';
import { Competencia5Analyzer } from './Competencia5Analyzer';

export interface CompetenciaReal {
  nota: number; // 0-200
  feedback: string;
  pontosFortes: string[];
  pontosFracos: string[];
  sugestoes: string[];
  detalhes: {
    errosEncontrados: number;
    qualidade: 'excelente' | 'bom' | 'regular' | 'ruim' | 'muito_ruim';
    percentualAdequacao: number;
  };
}

export interface CorrecaoRealista {
  competencias: {
    competencia_1: CompetenciaReal;
    competencia_2: CompetenciaReal;
    competencia_3: CompetenciaReal;
    competencia_4: CompetenciaReal;
    competencia_5: CompetenciaReal;
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
}

export class RealisticCorrectionEngine {
  private competencia1Analyzer: Competencia1Analyzer;
  private competencia2Analyzer: Competencia2Analyzer;
  private competencia3Analyzer: Competencia3Analyzer;
  private competencia4Analyzer: Competencia4Analyzer;
  private competencia5Analyzer: Competencia5Analyzer;

  constructor() {
    this.competencia1Analyzer = new Competencia1Analyzer();
    this.competencia2Analyzer = new Competencia2Analyzer();
    this.competencia3Analyzer = new Competencia3Analyzer();
    this.competencia4Analyzer = new Competencia4Analyzer();
    this.competencia5Analyzer = new Competencia5Analyzer();
  }

  // Método principal de correção realista
  async corrigirRedacaoRealista(texto: string, tema: string): Promise<CorrecaoRealista> {
    console.log('🔍 INICIANDO CORREÇÃO REALISTA...');
    console.log(`📝 Texto: ${texto.substring(0, 100)}...`);
    console.log(`🎯 Tema: ${tema}`);

    // Análise de cada competência
    const competencia1 = await this.analisarCompetencia1Realista(texto);
    const competencia2 = await this.analisarCompetencia2Realista(texto, tema);
    const competencia3 = await this.analisarCompetencia3Realista(texto);
    const competencia4 = await this.analisarCompetencia4Realista(texto);
    const competencia5 = await this.analisarCompetencia5Realista(texto);

    // Calcular nota total
    const notaTotal = competencia1.nota + competencia2.nota + competencia3.nota + 
                     competencia4.nota + competencia5.nota;

    // Determinar nível geral
    const nivelGeral = this.determinarNivelGeral(notaTotal);

    // Gerar sugestões gerais
    const sugestoesGerais = this.gerarSugestoesGerais(competencia1, competencia2, competencia3, competencia4, competencia5);

    // Gerar resumo
    const resumo = this.gerarResumo(competencia1, competencia2, competencia3, competencia4, competencia5);

    const resultado: CorrecaoRealista = {
      competencias: {
        competencia_1: competencia1,
        competencia_2: competencia2,
        competencia_3: competencia3,
        competencia_4: competencia4,
        competencia_5: competencia5
      },
      nota_total: notaTotal,
      nivel_geral: nivelGeral,
      sugestoes_gerais: sugestoesGerais,
      resumo
    };

    console.log(`✅ CORREÇÃO CONCLUÍDA - Nota Total: ${notaTotal}/1000`);
    console.log(`📊 Nível Geral: ${nivelGeral.toUpperCase()}`);

    return resultado;
  }

  // Análise realista da Competência 1
  private async analisarCompetencia1Realista(texto: string): Promise<CompetenciaReal> {
    console.log('🔍 Analisando Competência 1...');
    
    const analise = this.competencia1Analyzer.analisar(texto);
    const nota = this.competencia1Analyzer.calcularNota(analise);
    const feedback = this.competencia1Analyzer.gerarFeedback(analise, nota);

    // Análise mais profunda para gerar nota realista
    const errosEncontrados = this.contarErrosReais(texto);
    const qualidade = this.avaliarQualidadeReal(nota, errosEncontrados);
    const percentualAdequacao = this.calcularPercentualAdequacao(nota, errosEncontrados);

    return {
      nota: this.ajustarNotaRealista(nota, errosEncontrados, qualidade),
      feedback: this.gerarFeedbackRealista('Competência 1', feedback, errosEncontrados),
      pontosFortes: feedback.pontosFortes,
      pontosFracos: feedback.pontosFracos,
      sugestoes: feedback.sugestoes,
      detalhes: {
        errosEncontrados,
        qualidade,
        percentualAdequacao
      }
    };
  }

  // Análise realista da Competência 2
  private async analisarCompetencia2Realista(texto: string, tema: string): Promise<CompetenciaReal> {
    console.log('🔍 Analisando Competência 2...');
    
    const analise = this.competencia2Analyzer.analisar(texto, tema);
    const nota = this.competencia2Analyzer.calcularNota(analise);
    const feedback = this.competencia2Analyzer.gerarFeedback(analise, nota);

    // Análise específica para fidelidade ao tema
    const fidelidadeTema = this.avaliarFidelidadeTema(texto, tema);
    const conhecimentosAplicados = this.contarConhecimentosAplicados(texto);
    const qualidade = this.avaliarQualidadeReal(nota, fidelidadeTema + conhecimentosAplicados);

    return {
      nota: this.ajustarNotaRealista(nota, fidelidadeTema, qualidade),
      feedback: this.gerarFeedbackRealista('Competência 2', feedback, fidelidadeTema),
      pontosFortes: feedback.pontosFortes,
      pontosFracos: feedback.pontosFracos,
      sugestoes: feedback.sugestoes,
      detalhes: {
        errosEncontrados: fidelidadeTema,
        qualidade,
        percentualAdequacao: this.calcularPercentualAdequacao(nota, fidelidadeTema)
      }
    };
  }

  // Análise realista da Competência 3
  private async analisarCompetencia3Realista(texto: string): Promise<CompetenciaReal> {
    console.log('🔍 Analisando Competência 3...');
    
    const analise = this.competencia3Analyzer.analisar(texto);
    const nota = this.competencia3Analyzer.calcularNota(analise);
    const feedback = this.competencia3Analyzer.gerarFeedback(analise, nota);

    // Análise específica para argumentação
    const argumentosSolidos = this.contarArgumentosSolidos(texto);
    const exemplosConcretos = this.contarExemplosConcretos(texto);
    const qualidade = this.avaliarQualidadeReal(nota, argumentosSolidos + exemplosConcretos);

    return {
      nota: this.ajustarNotaRealista(nota, argumentosSolidos, qualidade),
      feedback: this.gerarFeedbackRealista('Competência 3', feedback, argumentosSolidos),
      pontosFortes: feedback.pontosFortes,
      pontosFracos: feedback.pontosFracos,
      sugestoes: feedback.sugestoes,
      detalhes: {
        errosEncontrados: argumentosSolidos,
        qualidade,
        percentualAdequacao: this.calcularPercentualAdequacao(nota, argumentosSolidos)
      }
    };
  }

  // Análise realista da Competência 4
  private async analisarCompetencia4Realista(texto: string): Promise<CompetenciaReal> {
    console.log('🔍 Analisando Competência 4...');
    
    const analise = this.competencia4Analyzer.analisar(texto);
    const nota = this.competencia4Analyzer.calcularNota(analise);
    const feedback = this.competencia4Analyzer.gerarFeedback(analise, nota);

    // Análise específica para coesão
    const conectivosAdequados = this.contarConectivosAdequados(texto);
    const coesaoReferencial = this.avaliarCoesaoReferencial(texto);
    const qualidade = this.avaliarQualidadeReal(nota, conectivosAdequados + coesaoReferencial);

    return {
      nota: this.ajustarNotaRealista(nota, conectivosAdequados, qualidade),
      feedback: this.gerarFeedbackRealista('Competência 4', feedback, conectivosAdequados),
      pontosFortes: feedback.pontosFortes,
      pontosFracos: feedback.pontosFracos,
      sugestoes: feedback.sugestoes,
      detalhes: {
        errosEncontrados: conectivosAdequados,
        qualidade,
        percentualAdequacao: this.calcularPercentualAdequacao(nota, conectivosAdequados)
      }
    };
  }

  // Análise realista da Competência 5
  private async analisarCompetencia5Realista(texto: string): Promise<CompetenciaReal> {
    console.log('🔍 Analisando Competência 5...');
    
    const analise = this.competencia5Analyzer.analisar(texto);
    const nota = this.competencia5Analyzer.calcularNota(analise);
    const feedback = this.competencia5Analyzer.gerarFeedback(analise, nota);

    // Análise específica para proposta de intervenção
    const propostaDetalhada = this.avaliarPropostaDetalhada(texto);
    const agentesIdentificados = this.contarAgentesIdentificados(texto);
    const qualidade = this.avaliarQualidadeReal(nota, propostaDetalhada + agentesIdentificados);

    return {
      nota: this.ajustarNotaRealista(nota, propostaDetalhada, qualidade),
      feedback: this.gerarFeedbackRealista('Competência 5', feedback, propostaDetalhada),
      pontosFortes: feedback.pontosFortes,
      pontosFracos: feedback.pontosFracos,
      sugestoes: feedback.sugestoes,
      detalhes: {
        errosEncontrados: propostaDetalhada,
        qualidade,
        percentualAdequacao: this.calcularPercentualAdequacao(nota, propostaDetalhada)
      }
    };
  }

  // Métodos auxiliares para análise realista
  private contarErrosReais(texto: string): number {
    let erros = 0;
    
    // Erros ortográficos comuns
    const errosOrtograficos = [
      'nao', 'voce', 'tambem', 'alem', 'atraves', 'sobre', 'acima', 'abaixo',
      'dentro', 'fora', 'antes', 'depois', 'agora', 'hoje', 'ontem', 'amanha'
    ];
    
    errosOrtograficos.forEach(erro => {
      const regex = new RegExp(`\\b${erro}\\b`, 'gi');
      const matches = texto.match(regex);
      if (matches) erros += matches.length;
    });

    // Erros de concordância
    const errosConcordancia = [
      'os pessoas', 'as meninos', 'eles foi', 'elas foi', 'nós vai', 'vocês vai'
    ];
    
    errosConcordancia.forEach(erro => {
      if (texto.toLowerCase().includes(erro)) erros += 2;
    });

    // Erros de pontuação
    const errosPontuacao = [
      'texto,texto', 'texto.texto', 'texto;texto', 'texto:texto'
    ];
    
    errosPontuacao.forEach(erro => {
      if (texto.includes(erro)) erros += 1;
    });

    return erros;
  }

  private avaliarFidelidadeTema(texto: string, tema: string): number {
    const palavrasTema = tema.toLowerCase().split(/\s+/).filter(p => p.length > 3);
    const palavrasTexto = texto.toLowerCase().split(/\s+/);
    
    let fidelidade = 0;
    palavrasTema.forEach(palavra => {
      if (palavrasTexto.includes(palavra)) fidelidade += 1;
    });
    
    return fidelidade;
  }

  private contarConhecimentosAplicados(texto: string): number {
    const areasConhecimento = [
      'sociologia', 'filosofia', 'história', 'geografia', 'direito', 'economia',
      'política', 'cultura', 'sociedade', 'educação', 'saúde', 'meio ambiente'
    ];
    
    let conhecimentos = 0;
    areasConhecimento.forEach(area => {
      if (texto.toLowerCase().includes(area)) conhecimentos += 1;
    });
    
    return conhecimentos;
  }

  private contarArgumentosSolidos(texto: string): number {
    const conectivosArgumentativos = [
      'portanto', 'assim', 'dessa forma', 'consequentemente', 'logo',
      'por isso', 'por conseguinte', 'em decorrência', 'devido a'
    ];
    
    let argumentos = 0;
    conectivosArgumentativos.forEach(conectivo => {
      if (texto.toLowerCase().includes(conectivo)) argumentos += 1;
    });
    
    return argumentos;
  }

  private contarExemplosConcretos(texto: string): number {
    const indicadoresExemplos = [
      'por exemplo', 'como', 'tal como', 'a saber', 'isto é', 'ou seja'
    ];
    
    let exemplos = 0;
    indicadoresExemplos.forEach(indicador => {
      if (texto.toLowerCase().includes(indicador)) exemplos += 1;
    });
    
    return exemplos;
  }

  private contarConectivosAdequados(texto: string): number {
    const conectivos = [
      'além disso', 'ademais', 'outrossim', 'igualmente', 'também',
      'porém', 'contudo', 'todavia', 'entretanto', 'no entanto',
      'portanto', 'consequentemente', 'logo', 'assim', 'dessa forma'
    ];
    
    let conectivosEncontrados = 0;
    conectivos.forEach(conectivo => {
      if (texto.toLowerCase().includes(conectivo)) conectivosEncontrados += 1;
    });
    
    return conectivosEncontrados;
  }

  private avaliarCoesaoReferencial(texto: string): number {
    const pronomesReferencia = [
      'este', 'esta', 'isto', 'esse', 'essa', 'isso', 'aquele', 'aquela', 'aquilo'
    ];
    
    let coesao = 0;
    pronomesReferencia.forEach(pronome => {
      if (texto.toLowerCase().includes(pronome)) coesao += 1;
    });
    
    return coesao;
  }

  private avaliarPropostaDetalhada(texto: string): number {
    const indicadoresProposta = [
      'proposta', 'solução', 'medida', 'ação', 'iniciativa', 'estratégia'
    ];
    
    let proposta = 0;
    indicadoresProposta.forEach(indicador => {
      if (texto.toLowerCase().includes(indicador)) proposta += 1;
    });
    
    return proposta;
  }

  private contarAgentesIdentificados(texto: string): number {
    const agentes = [
      'governo', 'estado', 'município', 'sociedade', 'cidadãos', 'escola',
      'empresas', 'organizações', 'mídia', 'família'
    ];
    
    let agentesEncontrados = 0;
    agentes.forEach(agente => {
      if (texto.toLowerCase().includes(agente)) agentesEncontrados += 1;
    });
    
    return agentesEncontrados;
  }

  private avaliarQualidadeReal(nota: number, indicadores: number): 'excelente' | 'bom' | 'regular' | 'ruim' | 'muito_ruim' {
    if (nota >= 160 && indicadores >= 5) return 'excelente';
    if (nota >= 120 && indicadores >= 3) return 'bom';
    if (nota >= 80 && indicadores >= 2) return 'regular';
    if (nota >= 40 && indicadores >= 1) return 'ruim';
    return 'muito_ruim';
  }

  private calcularPercentualAdequacao(nota: number, indicadores: number): number {
    const percentualNota = (nota / 200) * 100;
    const percentualIndicadores = Math.min(100, (indicadores / 5) * 100);
    return Math.round((percentualNota + percentualIndicadores) / 2);
  }

  private ajustarNotaRealista(nota: number, indicadores: number, qualidade: string): number {
    let notaAjustada = nota;
    
    // Ajustar baseado na qualidade real
    switch (qualidade) {
      case 'excelente':
        notaAjustada = Math.min(200, nota + 20);
        break;
      case 'bom':
        notaAjustada = Math.min(200, nota + 10);
        break;
      case 'regular':
        notaAjustada = nota;
        break;
      case 'ruim':
        notaAjustada = Math.max(0, nota - 20);
        break;
      case 'muito_ruim':
        notaAjustada = Math.max(0, nota - 40);
        break;
    }
    
    // Ajustar baseado nos indicadores
    if (indicadores >= 5) notaAjustada = Math.min(200, notaAjustada + 15);
    else if (indicadores >= 3) notaAjustada = Math.min(200, notaAjustada + 5);
    else if (indicadores < 2) notaAjustada = Math.max(0, notaAjustada - 15);
    
    return Math.round(notaAjustada);
  }

  private gerarFeedbackRealista(competencia: string, feedback: any, indicadores: number): string {
    let feedbackRealista = feedback.justificativa;
    
    if (indicadores >= 5) {
      feedbackRealista += ` ${competencia} apresenta excelente qualidade com ${indicadores} indicadores positivos.`;
    } else if (indicadores >= 3) {
      feedbackRealista += ` ${competencia} apresenta boa qualidade com ${indicadores} indicadores positivos.`;
    } else if (indicadores < 2) {
      feedbackRealista += ` ${competencia} apresenta limitações com apenas ${indicadores} indicadores positivos.`;
    }
    
    return feedbackRealista;
  }

  private determinarNivelGeral(notaTotal: number): 'excelente' | 'bom' | 'regular' | 'ruim' | 'muito_ruim' {
    if (notaTotal >= 800) return 'excelente';
    if (notaTotal >= 600) return 'bom';
    if (notaTotal >= 400) return 'regular';
    if (notaTotal >= 200) return 'ruim';
    return 'muito_ruim';
  }

  private gerarSugestoesGerais(comp1: CompetenciaReal, comp2: CompetenciaReal, comp3: CompetenciaReal, comp4: CompetenciaReal, comp5: CompetenciaReal): string[] {
    const sugestoes: string[] = [];
    
    // Sugestões baseadas nas competências mais fracas
    const competencias = [comp1, comp2, comp3, comp4, comp5];
    const notas = competencias.map(comp => comp.nota);
    const menorNota = Math.min(...notas);
    
    if (menorNota < 100) {
      sugestoes.push('Foque na competência com menor pontuação para melhorar significativamente sua nota.');
    }
    
    if (comp1.nota < 120) {
      sugestoes.push('Revise cuidadosamente a gramática, ortografia e concordância.');
    }
    
    if (comp2.nota < 120) {
      sugestoes.push('Mantenha o foco no tema proposto e aplique conhecimentos de diferentes áreas.');
    }
    
    if (comp3.nota < 120) {
      sugestoes.push('Fortaleça a argumentação com exemplos concretos e dados específicos.');
    }
    
    if (comp4.nota < 120) {
      sugestoes.push('Use mais conectivos e melhore a coesão entre as ideias.');
    }
    
    if (comp5.nota < 120) {
      sugestoes.push('Detalhe melhor a proposta de intervenção com agentes e meios específicos.');
    }
    
    return sugestoes;
  }

  private gerarResumo(comp1: CompetenciaReal, comp2: CompetenciaReal, comp3: CompetenciaReal, comp4: CompetenciaReal, comp5: CompetenciaReal): any {
    const competencias = [
      { num: 1, comp: comp1 },
      { num: 2, comp: comp2 },
      { num: 3, comp: comp3 },
      { num: 4, comp: comp4 },
      { num: 5, comp: comp5 }
    ];
    
    const notas = competencias.map(c => c.comp.nota);
    const maiorNota = Math.max(...notas);
    const menorNota = Math.min(...notas);
    
    const competenciaMaisForte = competencias.find(c => c.comp.nota === maiorNota)?.num || 1;
    const competenciaMaisFraca = competencias.find(c => c.comp.nota === menorNota)?.num || 1;
    
    const pontosFortesGerais = competencias
      .filter(c => c.comp.nota >= 140)
      .map(c => `Competência ${c.num}: ${c.comp.pontosFortes.join(', ')}`);
    
    const pontosFracosGerais = competencias
      .filter(c => c.comp.nota < 120)
      .map(c => `Competência ${c.num}: ${c.comp.pontosFracos.join(', ')}`);
    
    return {
      pontos_fortes_gerais: pontosFortesGerais,
      pontos_fracos_gerais: pontosFracosGerais,
      competencia_mais_forte: competenciaMaisForte,
      competencia_mais_fraca: competenciaMaisFraca
    };
  }
}
