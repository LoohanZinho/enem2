// Analisador da Competência 3 - Seleção, relacionamento, organização e interpretação de informações
// C3: Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos

export interface AnaliseC3 {
  selecaoInformacoes: {
    relevancia: number; // 0-100
    diversidade: number; // 0-100
    atualidade: boolean;
    fontes: string[];
    problemas?: string[];
  };
  relacionamentoIdeias: {
    coesao: number; // 0-100
    progressao: number; // 0-100
    conectivos: string[];
    sequenciaLogica: boolean;
    problemas?: string[];
  };
  organizacaoTexto: {
    estrutura: 'boa' | 'regular' | 'ruim';
    paragrafos: number;
    introducao: boolean;
    desenvolvimento: boolean;
    conclusao: boolean;
    problemas?: string[];
  };
  interpretacaoCritica: {
    analise: number; // 0-100
    argumentacao: number; // 0-100
    exemplos: number; // 0-100
    dados: number; // 0-100
    problemas?: string[];
  };
  argumentacao: {
    tese: boolean;
    argumentos: number;
    contraArgumentos: boolean;
    conclusao: boolean;
    persuasao: number; // 0-100
    problemas?: string[];
  };
}

export class Competencia3Analyzer {
  // Conectivos para análise de coesão
  private conectivosCoesao = {
    adicao: ['além disso', 'ademais', 'outrossim', 'igualmente', 'também', 'ainda', 'mais'],
    oposicao: ['porém', 'contudo', 'todavia', 'entretanto', 'no entanto', 'mas', 'por outro lado'],
    causa: ['porque', 'pois', 'já que', 'uma vez que', 'devido a', 'em virtude de'],
    consequencia: ['portanto', 'consequentemente', 'logo', 'assim', 'dessa forma', 'por isso'],
    tempo: ['primeiro', 'segundo', 'terceiro', 'inicialmente', 'posteriormente', 'finalmente', 'depois'],
    exemplificacao: ['por exemplo', 'como', 'tal como', 'a saber', 'isto é', 'ou seja', 'verbigracia'],
    comparacao: ['assim como', 'tal como', 'do mesmo modo', 'similarmente', 'igualmente', 'da mesma forma'],
    conclusao: ['em suma', 'resumindo', 'concluindo', 'finalmente', 'portanto', 'assim', 'dessa forma']
  };

  // Palavras que indicam argumentação
  private indicadoresArgumentacao = [
    'defendo', 'acredito', 'penso', 'considero', 'julgo', 'avaliar',
    'necessário', 'importante', 'fundamental', 'essencial', 'crucial',
    'evidência', 'prova', 'demonstra', 'comprova', 'confirma'
  ];

  // Palavras que indicam dados e estatísticas
  private indicadoresDados = [
    'segundo', 'conforme', 'de acordo com', 'dados', 'estatísticas',
    'pesquisa', 'estudo', 'relatório', 'percentual', 'índice'
  ];

  // Análise principal da Competência 3
  analisar(texto: string): AnaliseC3 {
    const selecaoInformacoes = this.verificarSelecaoInformacoes(texto);
    const relacionamentoIdeias = this.verificarRelacionamentoIdeias(texto);
    const organizacaoTexto = this.verificarOrganizacaoTexto(texto);
    const interpretacaoCritica = this.verificarInterpretacaoCritica(texto);
    const argumentacao = this.verificarArgumentacao(texto);

    return {
      selecaoInformacoes,
      relacionamentoIdeias,
      organizacaoTexto,
      interpretacaoCritica,
      argumentacao
    };
  }

  // Verificação da seleção de informações
  private verificarSelecaoInformacoes(texto: string): AnaliseC3['selecaoInformacoes'] {
    const relevancia = this.calcularRelevancia(texto);
    const diversidade = this.calcularDiversidade(texto);
    const atualidade = this.verificarAtualidade(texto);
    const fontes = this.extrairFontes(texto);

    return {
      relevancia,
      diversidade,
      atualidade,
      fontes
    };
  }

  // Verificação do relacionamento de ideias
  private verificarRelacionamentoIdeias(texto: string): AnaliseC3['relacionamentoIdeias'] {
    const coesao = this.calcularCoesao(texto);
    const progressao = this.calcularProgressao(texto);
    const conectivos = this.identificarConectivos(texto);
    const sequenciaLogica = this.verificarSequenciaLogica(texto);

    return {
      coesao,
      progressao,
      conectivos,
      sequenciaLogica
    };
  }

  // Verificação da organização do texto
  private verificarOrganizacaoTexto(texto: string): AnaliseC3['organizacaoTexto'] {
    const paragrafos = this.contarParagrafos(texto);
    const introducao = this.verificarIntroducao(texto);
    const desenvolvimento = this.verificarDesenvolvimento(texto);
    const conclusao = this.verificarConclusao(texto);
    const estrutura = this.avaliarEstrutura(paragrafos, introducao, desenvolvimento, conclusao);

    return {
      estrutura,
      paragrafos,
      introducao,
      desenvolvimento,
      conclusao
    };
  }

  // Verificação da interpretação crítica
  private verificarInterpretacaoCritica(texto: string): AnaliseC3['interpretacaoCritica'] {
    const analise = this.calcularAnalise(texto);
    const argumentacao = this.calcularArgumentacao(texto);
    const exemplos = this.calcularExemplos(texto);
    const dados = this.calcularDados(texto);

    return {
      analise,
      argumentacao,
      exemplos,
      dados
    };
  }

  // Verificação da argumentação
  private verificarArgumentacao(texto: string): AnaliseC3['argumentacao'] {
    const tese = this.verificarTese(texto);
    const argumentos = this.contarArgumentos(texto);
    const contraArgumentos = this.verificarContraArgumentos(texto);
    const conclusao = this.verificarConclusaoArgumentativa(texto);
    const persuasao = this.calcularPersuasao(texto);

    return {
      tese,
      argumentos,
      contraArgumentos,
      conclusao,
      persuasao
    };
  }

  // Métodos auxiliares para seleção de informações
  private calcularRelevancia(texto: string): number {
    let relevancia = 0;
    const palavras = texto.toLowerCase().split(/\s+/);

    // Verificar presença de palavras-chave relevantes
    const palavrasRelevantes = [
      'problema', 'solução', 'causa', 'consequência', 'impacto', 'efeito',
      'necessário', 'importante', 'fundamental', 'essencial', 'crucial'
    ];

    palavrasRelevantes.forEach(palavra => {
      if (palavras.includes(palavra)) {
        relevancia += 10;
      }
    });

    // Verificar uso de exemplos concretos
    if (/\bexemplo\b|\bcomo\b|\btal como\b|\bpor exemplo\b/i.test(texto)) {
      relevancia += 20;
    }

    // Verificar presença de dados e estatísticas
    if (/\d+%|\d+,\d+|\d+\.\d+/.test(texto)) {
      relevancia += 15;
    }

    return Math.min(100, relevancia);
  }

  private calcularDiversidade(texto: string): number {
    const areas = [
      'social', 'econômico', 'político', 'cultural', 'ambiental', 'tecnológico',
      'educacional', 'saúde', 'segurança', 'direitos', 'cidadania'
    ];

    const areasPresentes = areas.filter(area => 
      texto.toLowerCase().includes(area)
    ).length;

    return Math.min(100, areasPresentes * 15);
  }

  private verificarAtualidade(texto: string): boolean {
    const indicadoresAtualidade = [
      'atual', 'contemporâneo', 'moderno', 'recente', 'novo',
      'hoje', 'atualmente', 'nos dias de hoje', 'na atualidade'
    ];

    return indicadoresAtualidade.some(indicador => 
      texto.toLowerCase().includes(indicador)
    );
  }

  private extrairFontes(texto: string): string[] {
    const fontes: string[] = [];
    const padraoFonte = /(?:segundo|conforme|de acordo com|conforme|conforme)\s+([^.,]+)/gi;
    let match;

    while ((match = padraoFonte.exec(texto)) !== null) {
      fontes.push(match[1].trim());
    }

    return fontes;
  }

  // Métodos auxiliares para relacionamento de ideias
  private calcularCoesao(texto: string): number {
    let coesao = 0;
    const palavras = texto.toLowerCase().split(/\s+/);

    // Verificar presença de conectivos
    Object.values(this.conectivosCoesao).flat().forEach(conectivo => {
      if (palavras.includes(conectivo.toLowerCase())) {
        coesao += 5;
      }
    });

    // Verificar repetição de palavras-chave
    const palavrasChave = this.extrairPalavrasChave(texto);
    palavrasChave.forEach(palavra => {
      const ocorrencias = (texto.toLowerCase().match(new RegExp(palavra, 'g')) || []).length;
      if (ocorrencias > 1) {
        coesao += 10;
      }
    });

    return Math.min(100, coesao);
  }

  private calcularProgressao(texto: string): number {
    let progressao = 0;
    const paragrafos = texto.split(/\n\s*\n/);

    // Verificar conectivos de progressão
    const conectivosProgressao = this.conectivosCoesao.tempo;
    conectivosProgressao.forEach(conectivo => {
      if (texto.toLowerCase().includes(conectivo)) {
        progressao += 15;
      }
    });

    // Verificar numeração de argumentos
    if (/\bprimeiro\b.*\bsegundo\b.*\bterceiro\b/i.test(texto)) {
      progressao += 20;
    }

    // Verificar estrutura de paragrafos
    if (paragrafos.length >= 3) {
      progressao += 25;
    }

    return Math.min(100, progressao);
  }

  private identificarConectivos(texto: string): string[] {
    const conectivos: string[] = [];
    const palavras = texto.toLowerCase().split(/\s+/);

    Object.values(this.conectivosCoesao).flat().forEach(conectivo => {
      if (palavras.includes(conectivo.toLowerCase())) {
        conectivos.push(conectivo);
      }
    });

    return conectivos;
  }

  private verificarSequenciaLogica(texto: string): boolean {
    // Verificar se há introdução, desenvolvimento e conclusão
    const paragrafos = texto.split(/\n\s*\n/);
    if (paragrafos.length < 3) return false;

    // Verificar conectivos de sequência
    const conectivosSequencia = [
      'primeiro', 'segundo', 'terceiro', 'inicialmente', 'posteriormente', 'finalmente'
    ];

    return conectivosSequencia.some(conectivo => 
      texto.toLowerCase().includes(conectivo)
    );
  }

  // Métodos auxiliares para organização do texto
  private contarParagrafos(texto: string): number {
    return texto.split(/\n\s*\n/).filter(paragrafo => paragrafo.trim().length > 0).length;
  }

  private verificarIntroducao(texto: string): boolean {
    const primeiroParagrafo = texto.split(/\n\s*\n/)[0] || '';
    const indicadoresIntroducao = [
      'introdução', 'inicialmente', 'primeiro', 'começando', 'para começar'
    ];

    return indicadoresIntroducao.some(indicador => 
      primeiroParagrafo.toLowerCase().includes(indicador)
    ) || primeiroParagrafo.length > 50;
  }

  private verificarDesenvolvimento(texto: string): boolean {
    const paragrafos = texto.split(/\n\s*\n/);
    if (paragrafos.length < 2) return false;

    // Verificar se há paragrafos de desenvolvimento
    const paragrafosDesenvolvimento = paragrafos.slice(1, -1);
    return paragrafosDesenvolvimento.some(paragrafo => paragrafo.trim().length > 100);
  }

  private verificarConclusao(texto: string): boolean {
    const ultimoParagrafo = texto.split(/\n\s*\n/).pop() || '';
    const indicadoresConclusao = [
      'conclusão', 'concluindo', 'finalmente', 'portanto', 'assim',
      'dessa forma', 'em suma', 'resumindo', 'em resumo'
    ];

    return indicadoresConclusao.some(indicador => 
      ultimoParagrafo.toLowerCase().includes(indicador)
    ) || ultimoParagrafo.length > 50;
  }

  private avaliarEstrutura(paragrafos: number, introducao: boolean, desenvolvimento: boolean, conclusao: boolean): 'boa' | 'regular' | 'ruim' {
    if (paragrafos >= 4 && introducao && desenvolvimento && conclusao) return 'boa';
    if (paragrafos >= 3 && (introducao || desenvolvimento || conclusao)) return 'regular';
    return 'ruim';
  }

  // Métodos auxiliares para interpretação crítica
  private calcularAnalise(texto: string): number {
    let analise = 0;
    const palavras = texto.toLowerCase().split(/\s+/);

    // Verificar indicadores de análise
    const indicadoresAnalise = [
      'analisar', 'avaliar', 'examinar', 'investigar', 'estudar',
      'refletir', 'pensar', 'considerar', 'questionar', 'debater'
    ];

    indicadoresAnalise.forEach(indicador => {
      if (palavras.includes(indicador)) {
        analise += 15;
      }
    });

    // Verificar presença de dados
    if (/\d+%|\d+,\d+|\d+\.\d+/.test(texto)) {
      analise += 20;
    }

    // Verificar exemplos
    if (/\bexemplo\b|\bcomo\b|\btal como\b/i.test(texto)) {
      analise += 15;
    }

    return Math.min(100, analise);
  }

  private calcularArgumentacao(texto: string): number {
    let argumentacao = 0;
    const palavras = texto.toLowerCase().split(/\s+/);

    this.indicadoresArgumentacao.forEach(indicador => {
      if (palavras.includes(indicador)) {
        argumentacao += 10;
      }
    });

    // Verificar conectivos argumentativos
    const conectivosArgumentativos = this.conectivosCoesao.causa.concat(this.conectivosCoesao.consequencia);
    conectivosArgumentativos.forEach(conectivo => {
      if (palavras.includes(conectivo)) {
        argumentacao += 5;
      }
    });

    return Math.min(100, argumentacao);
  }

  private calcularExemplos(texto: string): number {
    let exemplos = 0;

    // Verificar indicadores de exemplos
    const indicadoresExemplos = [
      'por exemplo', 'como', 'tal como', 'a saber', 'isto é', 'ou seja'
    ];

    indicadoresExemplos.forEach(indicador => {
      if (texto.toLowerCase().includes(indicador)) {
        exemplos += 25;
      }
    });

    // Verificar presença de casos concretos
    if (/\bexemplo\b|\bcaso\b|\binstância\b/i.test(texto)) {
      exemplos += 15;
    }

    return Math.min(100, exemplos);
  }

  private calcularDados(texto: string): number {
    let dados = 0;

    // Verificar presença de números e estatísticas
    if (/\d+%/.test(texto)) {
      dados += 30;
    }

    if (/\d+,\d+|\d+\.\d+/.test(texto)) {
      dados += 20;
    }

    // Verificar indicadores de dados
    this.indicadoresDados.forEach(indicador => {
      if (texto.toLowerCase().includes(indicador)) {
        dados += 10;
      }
    });

    return Math.min(100, dados);
  }

  // Métodos auxiliares para argumentação
  private verificarTese(texto: string): boolean {
    const indicadoresTese = [
      'acredito', 'penso', 'considero', 'defendo', 'apoio',
      'necessário', 'importante', 'fundamental', 'essencial'
    ];

    return indicadoresTese.some(indicador => 
      texto.toLowerCase().includes(indicador)
    );
  }

  private contarArgumentos(texto: string): number {
    let argumentos = 0;
    const paragrafos = texto.split(/\n\s*\n/);

    paragrafos.forEach(paragrafo => {
      if (paragrafo.trim().length > 100) {
        argumentos++;
      }
    });

    return argumentos;
  }

  private verificarContraArgumentos(texto: string): boolean {
    const indicadoresContra = [
      'por outro lado', 'entretanto', 'contudo', 'todavia', 'no entanto',
      'embora', 'apesar de', 'mesmo que', 'ainda que'
    ];

    return indicadoresContra.some(indicador => 
      texto.toLowerCase().includes(indicador)
    );
  }

  private verificarConclusaoArgumentativa(texto: string): boolean {
    const ultimoParagrafo = texto.split(/\n\s*\n/).pop() || '';
    const indicadoresConclusao = [
      'portanto', 'consequentemente', 'logo', 'assim', 'dessa forma',
      'em suma', 'resumindo', 'concluindo', 'finalmente'
    ];

    return indicadoresConclusao.some(indicador => 
      ultimoParagrafo.toLowerCase().includes(indicador)
    );
  }

  private calcularPersuasao(texto: string): number {
    let persuasao = 0;

    // Verificar uso de dados e estatísticas
    if (/\d+%|\d+,\d+|\d+\.\d+/.test(texto)) {
      persuasao += 25;
    }

    // Verificar exemplos concretos
    if (/\bexemplo\b|\bcomo\b|\btal como\b/i.test(texto)) {
      persuasao += 20;
    }

    // Verificar conectivos persuasivos
    const conectivosPersuasivos = this.conectivosCoesao.causa.concat(this.conectivosCoesao.consequencia);
    conectivosPersuasivos.forEach(conectivo => {
      if (texto.toLowerCase().includes(conectivo)) {
        persuasao += 10;
      }
    });

    // Verificar tamanho do texto
    const palavras = texto.split(/\s+/).length;
    if (palavras > 300) persuasao += 15;
    if (palavras > 500) persuasao += 10;

    return Math.min(100, persuasao);
  }

  private extrairPalavrasChave(texto: string): string[] {
    const stopWords = ['de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos', 'a', 'o', 'as', 'os', 'e', 'ou', 'mas', 'por', 'para', 'com', 'sem', 'sobre', 'entre'];
    
    return texto.toLowerCase()
      .split(/\s+/)
      .filter(palavra => palavra.length > 3 && !stopWords.includes(palavra))
      .map(palavra => palavra.replace(/[.,!?;:]/, ''));
  }

  // Cálculo da nota para Competência 3
  calcularNota(analise: AnaliseC3): number {
    let nota = 0;

    // Seleção de informações (25% da nota)
    nota += (analise.selecaoInformacoes.relevancia / 100) * 30;
    nota += (analise.selecaoInformacoes.diversidade / 100) * 20;

    // Relacionamento de ideias (25% da nota)
    nota += (analise.relacionamentoIdeias.coesao / 100) * 15;
    nota += (analise.relacionamentoIdeias.progressao / 100) * 15;
    if (analise.relacionamentoIdeias.sequenciaLogica) nota += 20;

    // Organização do texto (20% da nota)
    switch (analise.organizacaoTexto.estrutura) {
      case 'boa': nota += 40; break;
      case 'regular': nota += 25; break;
      case 'ruim': nota += 10; break;
    }

    // Interpretação crítica (20% da nota)
    nota += (analise.interpretacaoCritica.analise / 100) * 10;
    nota += (analise.interpretacaoCritica.argumentacao / 100) * 10;
    nota += (analise.interpretacaoCritica.exemplos / 100) * 10;
    nota += (analise.interpretacaoCritica.dados / 100) * 10;

    // Argumentação (10% da nota)
    if (analise.argumentacao.tese) nota += 10;
    nota += Math.min(20, analise.argumentacao.argumentos * 5);
    if (analise.argumentacao.contraArgumentos) nota += 10;
    if (analise.argumentacao.conclusao) nota += 10;
    nota += (analise.argumentacao.persuasao / 100) * 10;

    // Contar total de problemas
    const totalProblemas = (analise.selecaoInformacoes.problemas?.length || 0) +
                          (analise.relacionamentoIdeias.problemas?.length || 0) +
                          (analise.organizacaoTexto.problemas?.length || 0) +
                          (analise.interpretacaoCritica.problemas?.length || 0) +
                          (analise.argumentacao.problemas?.length || 0);

    // Penalização por mais de 3 erros: -40 pontos
    if (totalProblemas > 3) {
      nota = Math.max(0, nota - 40);
      console.log(`⚠️ PENALIZAÇÃO APLICADA: ${totalProblemas} problemas encontrados (>3) = -40 pontos na Competência 3`);
    }

    return Math.min(200, Math.max(0, nota));
  }

  // Geração de feedback para Competência 3
  gerarFeedback(analise: AnaliseC3, nota: number): {
    justificativa: string;
    pontosFortes: string[];
    pontosFracos: string[];
    sugestoes: string[];
  } {
    const justificativa = this.gerarJustificativa(analise, nota);
    const pontosFortes = this.identificarPontosFortes(analise);
    const pontosFracos = this.identificarPontosFracos(analise);
    const sugestoes = this.gerarSugestoes(analise);

    return {
      justificativa,
      pontosFortes,
      pontosFracos,
      sugestoes
    };
  }

  private gerarJustificativa(analise: AnaliseC3, nota: number): string {
    if (nota >= 180) {
      return 'Excelente seleção e organização de informações. Ideias bem relacionadas, interpretação crítica consistente e argumentação sólida.';
    } else if (nota >= 140) {
      return 'Boa seleção e organização de informações. Ideias relacionadas adequadamente, com interpretação crítica e argumentação satisfatória.';
    } else if (nota >= 100) {
      return 'Seleção e organização regulares de informações. Relacionamento de ideias parcial, interpretação crítica limitada e argumentação básica.';
    } else if (nota >= 60) {
      return 'Seleção e organização insuficientes de informações. Relacionamento de ideias precário, interpretação crítica superficial e argumentação fraca.';
    } else {
      return 'Seleção e organização muito insuficientes de informações. Relacionamento de ideias ausente, interpretação crítica inexistente e argumentação inadequada.';
    }
  }

  private identificarPontosFortes(analise: AnaliseC3): string[] {
    const pontos: string[] = [];

    if (analise.selecaoInformacoes.relevancia >= 80) {
      pontos.push('Excelente seleção de informações relevantes');
    }

    if (analise.relacionamentoIdeias.coesao >= 80) {
      pontos.push('Boa coesão textual');
    }

    if (analise.organizacaoTexto.estrutura === 'boa') {
      pontos.push('Estrutura textual bem organizada');
    }

    if (analise.interpretacaoCritica.analise >= 70) {
      pontos.push('Boa interpretação crítica');
    }

    if (analise.argumentacao.persuasao >= 70) {
      pontos.push('Argumentação persuasiva');
    }

    return pontos;
  }

  private identificarPontosFracos(analise: AnaliseC3): string[] {
    const pontos: string[] = [];

    if (analise.selecaoInformacoes.relevancia < 60) {
      pontos.push('Seleção de informações pouco relevante');
    }

    if (analise.relacionamentoIdeias.coesao < 60) {
      pontos.push('Coesão textual insuficiente');
    }

    if (analise.organizacaoTexto.estrutura === 'ruim') {
      pontos.push('Estrutura textual mal organizada');
    }

    if (analise.interpretacaoCritica.analise < 50) {
      pontos.push('Interpretação crítica insuficiente');
    }

    if (analise.argumentacao.argumentos < 2) {
      pontos.push('Poucos argumentos apresentados');
    }

    return pontos;
  }

  private gerarSugestoes(analise: AnaliseC3): string[] {
    const sugestoes: string[] = [];

    if (analise.selecaoInformacoes.relevancia < 60) {
      sugestoes.push('Selecione informações mais relevantes para o tema');
    }

    if (analise.relacionamentoIdeias.coesao < 60) {
      sugestoes.push('Use mais conectivos para relacionar as ideias');
    }

    if (analise.organizacaoTexto.estrutura === 'ruim') {
      sugestoes.push('Organize melhor a estrutura do texto com introdução, desenvolvimento e conclusão');
    }

    if (analise.interpretacaoCritica.analise < 50) {
      sugestoes.push('Desenvolva uma análise mais crítica e reflexiva');
    }

    if (analise.argumentacao.argumentos < 2) {
      sugestoes.push('Apresente mais argumentos para sustentar sua tese');
    }

    return sugestoes;
  }
}
