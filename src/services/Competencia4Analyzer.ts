// Analisador da Competência 4 - Conhecimento dos mecanismos linguísticos
// C4: Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação

export interface AnaliseC4 {
  conectivos: {
    diversidade: number; // 0-100
    adequacao: number; // 0-100
    variedade: string[];
    problemas: string[];
  };
  coesao: {
    referencial: number; // 0-100
    sequencial: number; // 0-100
    problemas: string[];
  };
  progressao: {
    tematica: number; // 0-100
    informacional: number; // 0-100
    problemas: string[];
  };
  paralelismo: {
    sintatico: number; // 0-100
    semantico: number; // 0-100
    problemas: string[];
  };
  recursos: {
    expressivos: number; // 0-100
    variedade: number; // 0-100
    problemas: string[];
  };
  lexical: {
    variedade: number; // 0-100
    precisao: number; // 0-100
    problemas: string[];
  };
}

export class Competencia4Analyzer {
  // Conectivos por categoria
  private conectivosCategoria = {
    adicao: ['além disso', 'ademais', 'outrossim', 'igualmente', 'também', 'ainda', 'mais'],
    oposicao: ['porém', 'contudo', 'todavia', 'entretanto', 'no entanto', 'mas', 'por outro lado'],
    causa: ['porque', 'pois', 'já que', 'uma vez que', 'devido a', 'em virtude de', 'por causa de'],
    consequencia: ['portanto', 'consequentemente', 'logo', 'assim', 'dessa forma', 'por isso', 'então'],
    tempo: ['primeiro', 'segundo', 'terceiro', 'inicialmente', 'posteriormente', 'finalmente', 'depois'],
    exemplificacao: ['por exemplo', 'como', 'tal como', 'a saber', 'isto é', 'ou seja', 'verbigracia'],
    comparacao: ['assim como', 'tal como', 'do mesmo modo', 'similarmente', 'igualmente', 'da mesma forma'],
    conclusao: ['em suma', 'resumindo', 'concluindo', 'finalmente', 'portanto', 'assim', 'dessa forma']
  };

  // Pronomes de referência
  private pronomesReferencia = [
    'ele', 'ela', 'eles', 'elas', 'o', 'a', 'os', 'as',
    'este', 'esta', 'estes', 'estas', 'esse', 'essa', 'esses', 'essas',
    'aquele', 'aquela', 'aqueles', 'aquelas', 'isto', 'isso', 'aquilo'
  ];

  // Palavras de transição
  private palavrasTransicao = [
    'primeiro', 'segundo', 'terceiro', 'inicialmente', 'posteriormente',
    'finalmente', 'além disso', 'ademais', 'outrossim', 'igualmente',
    'por outro lado', 'entretanto', 'contudo', 'todavia', 'no entanto'
  ];

  // Recursos expressivos
  private recursosExpressivos = [
    'metáfora', 'comparação', 'analogia', 'ironia', 'sarcasmo',
    'antítese', 'paradoxo', 'eufemismo', 'hipérbole', 'personificação'
  ];

  // Análise principal da Competência 4
  analisar(texto: string): AnaliseC4 {
    const conectivos = this.verificarConectivos(texto);
    const coesao = this.verificarCoesao(texto);
    const progressao = this.verificarProgressao(texto);
    const paralelismo = this.verificarParalelismo(texto);
    const recursos = this.verificarRecursosExpressivos(texto);
    const lexical = this.verificarVariedadeLexical(texto);

    return {
      conectivos,
      coesao,
      progressao,
      paralelismo,
      recursos,
      lexical
    };
  }

  // Verificação de conectivos
  private verificarConectivos(texto: string): {
    diversidade: number;
    adequacao: number;
    variedade: string[];
    problemas: string[];
  } {
    const conectivosEncontrados: string[] = [];
    const problemas: string[] = [];
    const textoLower = texto.toLowerCase();

    // Identificar conectivos presentes
    Object.values(this.conectivosCategoria).flat().forEach(conectivo => {
      if (textoLower.includes(conectivo)) {
        conectivosEncontrados.push(conectivo);
      }
    });

    // Calcular diversidade
    const categoriasPresentes = Object.keys(this.conectivosCategoria).filter(categoria => 
      this.conectivosCategoria[categoria as keyof typeof this.conectivosCategoria].some(conectivo => 
        textoLower.includes(conectivo)
      )
    ).length;

    const diversidade = (categoriasPresentes / Object.keys(this.conectivosCategoria).length) * 100;

    // Verificar adequação
    const adequacao = this.calcularAdequacaoConectivos(texto, conectivosEncontrados);

    // Identificar problemas
    this.identificarProblemasConectivos(texto, problemas);

    return {
      diversidade,
      adequacao,
      variedade: conectivosEncontrados,
      problemas
    };
  }

  // Verificação de coesão
  private verificarCoesao(texto: string): {
    referencial: number;
    sequencial: number;
    problemas: string[];
  } {
    const referencial = this.calcularCoesaoReferencial(texto);
    const sequencial = this.calcularCoesaoSequencial(texto);
    const problemas: string[] = [];

    this.identificarProblemasCoesao(texto, problemas);

    return {
      referencial,
      sequencial,
      problemas
    };
  }

  // Verificação de progressão
  private verificarProgressao(texto: string): {
    tematica: number;
    informacional: number;
    problemas: string[];
  } {
    const tematica = this.calcularProgressaoTematica(texto);
    const informacional = this.calcularProgressaoInformacional(texto);
    const problemas: string[] = [];

    this.identificarProblemasProgressao(texto, problemas);

    return {
      tematica,
      informacional,
      problemas
    };
  }

  // Verificação de paralelismo
  private verificarParalelismo(texto: string): {
    sintatico: number;
    semantico: number;
    problemas: string[];
  } {
    const sintatico = this.calcularParalelismoSintatico(texto);
    const semantico = this.calcularParalelismoSemantico(texto);
    const problemas: string[] = [];

    this.identificarProblemasParalelismo(texto, problemas);

    return {
      sintatico,
      semantico,
      problemas
    };
  }

  // Verificação de recursos expressivos
  private verificarRecursosExpressivos(texto: string): {
    expressivos: number;
    variedade: number;
    problemas: string[];
  } {
    const expressivos = this.calcularRecursosExpressivos(texto);
    const variedade = this.calcularVariedadeRecursos(texto);
    const problemas: string[] = [];

    this.identificarProblemasRecursos(texto, problemas);

    return {
      expressivos,
      variedade,
      problemas
    };
  }

  // Verificação de variedade lexical
  private verificarVariedadeLexical(texto: string): {
    variedade: number;
    precisao: number;
    problemas: string[];
  } {
    const variedade = this.calcularVariedadeLexical(texto);
    const precisao = this.calcularPrecisaoLexical(texto);
    const problemas: string[] = [];

    this.identificarProblemasLexical(texto, problemas);

    return {
      variedade,
      precisao,
      problemas
    };
  }

  // Métodos auxiliares para conectivos
  private calcularAdequacaoConectivos(texto: string, conectivos: string[]): number {
    let adequacao = 0;
    const paragrafos = texto.split(/\n\s*\n/);

    // Verificar se há conectivos em cada parágrafo
    paragrafos.forEach(paragrafo => {
      if (paragrafo.trim().length > 50) {
        const temConectivo = conectivos.some(conectivo => 
          paragrafo.toLowerCase().includes(conectivo)
        );
        if (temConectivo) adequacao += 20;
      }
    });

    // Verificar variedade de conectivos
    const categoriasDiferentes = new Set();
    conectivos.forEach(conectivo => {
      Object.entries(this.conectivosCategoria).forEach(([categoria, lista]) => {
        if (lista.includes(conectivo)) {
          categoriasDiferentes.add(categoria);
        }
      });
    });

    adequacao += categoriasDiferentes.size * 10;

    return Math.min(100, adequacao);
  }

  private identificarProblemasConectivos(texto: string, problemas: string[]): void {
    // Verificar repetição excessiva de conectivos
    const conectivos = Object.values(this.conectivosCategoria).flat();
    conectivos.forEach(conectivo => {
      const ocorrencias = (texto.toLowerCase().match(new RegExp(conectivo, 'g')) || []).length;
      if (ocorrencias > 3) {
        problemas.push(`Uso excessivo do conectivo "${conectivo}"`);
      }
    });

    // Verificar conectivos inadequados
    const conectivosInadequados = [
      { conectivo: 'e', contexto: 'início de frase' },
      { conectivo: 'mas', contexto: 'início de parágrafo' }
    ];

    conectivosInadequados.forEach(({ conectivo, contexto }) => {
      const padrao = new RegExp(`^\\s*${conectivo}\\s+`, 'gm');
      if (padrao.test(texto)) {
        problemas.push(`Uso inadequado de "${conectivo}" no ${contexto}`);
      }
    });
  }

  // Métodos auxiliares para coesão
  private calcularCoesaoReferencial(texto: string): number {
    let coesao = 0;
    const palavras = texto.toLowerCase().split(/\s+/);

    // Verificar presença de pronomes de referência
    this.pronomesReferencia.forEach(pronome => {
      if (palavras.includes(pronome)) {
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

  private calcularCoesaoSequencial(texto: string): number {
    let coesao = 0;
    const paragrafos = texto.split(/\n\s*\n/);

    // Verificar conectivos entre parágrafos
    for (let i = 1; i < paragrafos.length; i++) {
      const paragrafo = paragrafos[i].toLowerCase();
      const temConectivo = this.palavrasTransicao.some(transicao => 
        paragrafo.includes(transicao)
      );
      if (temConectivo) coesao += 20;
    }

    // Verificar numeração de argumentos
    if (/\bprimeiro\b|\bsegundo\b|\bterceiro\b/i.test(texto)) {
      coesao += 30;
    }

    return Math.min(100, coesao);
  }

  private identificarProblemasCoesao(texto: string, problemas: string[]): void {
    // Verificar referências ambíguas
    const pronomesAmbiguos = ['ele', 'ela', 'eles', 'elas'];
    pronomesAmbiguos.forEach(pronome => {
      const padrao = new RegExp(`\\b${pronome}\\b`, 'gi');
      const matches = texto.match(padrao);
      if (matches && matches.length > 2) {
        problemas.push(`Uso excessivo do pronome "${pronome}" pode causar ambiguidade`);
      }
    });

    // Verificar repetição excessiva de palavras
    const palavras = texto.toLowerCase().split(/\s+/);
    const contagemPalavras: { [key: string]: number } = {};
    
    palavras.forEach(palavra => {
      if (palavra.length > 4) {
        contagemPalavras[palavra] = (contagemPalavras[palavra] || 0) + 1;
      }
    });

    Object.entries(contagemPalavras).forEach(([palavra, count]) => {
      if (count > 5) {
        problemas.push(`Repetição excessiva da palavra "${palavra}"`);
      }
    });
  }

  // Métodos auxiliares para progressão
  private calcularProgressaoTematica(texto: string): number {
    let progressao = 0;
    const paragrafos = texto.split(/\n\s*\n/);

    // Verificar se cada parágrafo desenvolve o tema
    paragrafos.forEach(paragrafo => {
      if (paragrafo.trim().length > 50) {
        const temDesenvolvimento = this.verificarDesenvolvimentoTema(paragrafo);
        if (temDesenvolvimento) progressao += 20;
      }
    });

    // Verificar conectivos de progressão
    const conectivosProgressao = this.conectivosCategoria.tempo;
    conectivosProgressao.forEach(conectivo => {
      if (texto.toLowerCase().includes(conectivo)) {
        progressao += 10;
      }
    });

    return Math.min(100, progressao);
  }

  private calcularProgressaoInformacional(texto: string): number {
    let progressao = 0;

    // Verificar presença de dados e informações
    if (/\d+%|\d+,\d+|\d+\.\d+/.test(texto)) {
      progressao += 30;
    }

    // Verificar exemplos e casos concretos
    if (/\bexemplo\b|\bcomo\b|\btal como\b/i.test(texto)) {
      progressao += 25;
    }

    // Verificar citações e referências
    if (/"([^"]+)"/.test(texto)) {
      progressao += 20;
    }

    // Verificar conectivos informativos
    const conectivosInformativos = this.conectivosCategoria.exemplificacao;
    conectivosInformativos.forEach(conectivo => {
      if (texto.toLowerCase().includes(conectivo)) {
        progressao += 10;
      }
    });

    return Math.min(100, progressao);
  }

  private identificarProblemasProgressao(texto: string, problemas: string[]): void {
    const paragrafos = texto.split(/\n\s*\n/);

    // Verificar parágrafos muito curtos
    paragrafos.forEach((paragrafo, index) => {
      if (paragrafo.trim().length < 30) {
        problemas.push(`Parágrafo ${index + 1} muito curto`);
      }
    });

    // Verificar repetição de ideias
    const ideias = paragrafos.map(p => p.trim().substring(0, 50));
    const ideiasRepetidas = ideias.filter((ideia, index) => 
      ideias.indexOf(ideia) !== index
    );

    if (ideiasRepetidas.length > 0) {
      problemas.push('Repetição de ideias entre parágrafos');
    }
  }

  // Métodos auxiliares para paralelismo
  private calcularParalelismoSintatico(texto: string): number {
    let paralelismo = 0;

    // Verificar estruturas paralelas
    const estruturasParalelas = [
      /(\w+)\s+e\s+(\w+)/g, // substantivo e substantivo
      /(\w+)\s+ou\s+(\w+)/g, // substantivo ou substantivo
      /(\w+)\s+mas\s+(\w+)/g // substantivo mas substantivo
    ];

    estruturasParalelas.forEach(estrutura => {
      const matches = texto.match(estrutura);
      if (matches) {
        paralelismo += matches.length * 15;
      }
    });

    return Math.min(100, paralelismo);
  }

  private calcularParalelismoSemantico(texto: string): number {
    let paralelismo = 0;

    // Verificar enumerações
    if (/\bprimeiro\b.*\bsegundo\b.*\bterceiro\b/i.test(texto)) {
      paralelismo += 40;
    }

    // Verificar listas
    if (/\d+[.)]\s*\w+/g.test(texto)) {
      paralelismo += 30;
    }

    // Verificar estruturas comparativas
    if (/\bassim como\b|\btal como\b|\bdo mesmo modo\b/i.test(texto)) {
      paralelismo += 30;
    }

    return Math.min(100, paralelismo);
  }

  private identificarProblemasParalelismo(texto: string, problemas: string[]): void {
    // Verificar estruturas não paralelas
    const estruturasNaoParalelas = [
      /(\w+)\s+e\s+(\w+ing)/g, // substantivo e verbo no gerúndio
      /(\w+)\s+ou\s+(\w+ed)/g // substantivo ou verbo no passado
    ];

    estruturasNaoParalelas.forEach(estrutura => {
      if (estrutura.test(texto)) {
        problemas.push('Estruturas não paralelas detectadas');
      }
    });
  }

  // Métodos auxiliares para recursos expressivos
  private calcularRecursosExpressivos(texto: string): number {
    let recursos = 0;

    // Verificar presença de recursos expressivos
    this.recursosExpressivos.forEach(recurso => {
      if (texto.toLowerCase().includes(recurso)) {
        recursos += 20;
      }
    });

    // Verificar metáforas e comparações
    if (/\bcomo\b|\btal como\b|\bassim como\b/i.test(texto)) {
      recursos += 25;
    }

    // Verificar antíteses
    if (/\bmas\b|\bporém\b|\bcontudo\b|\btodavia\b/i.test(texto)) {
      recursos += 15;
    }

    return Math.min(100, recursos);
  }

  private calcularVariedadeRecursos(texto: string): number {
    const recursosPresentes = this.recursosExpressivos.filter(recurso => 
      texto.toLowerCase().includes(recurso)
    ).length;

    return Math.min(100, recursosPresentes * 20);
  }

  private identificarProblemasRecursos(texto: string, problemas: string[]): void {
    // Verificar uso excessivo de recursos
    const recursosExcessivos = ['como', 'tal como', 'assim como'];
    recursosExcessivos.forEach(recurso => {
      const ocorrencias = (texto.toLowerCase().match(new RegExp(recurso, 'g')) || []).length;
      if (ocorrencias > 5) {
        problemas.push(`Uso excessivo do recurso "${recurso}"`);
      }
    });
  }

  // Métodos auxiliares para variedade lexical
  private calcularVariedadeLexical(texto: string): number {
    const palavras = texto.toLowerCase().split(/\s+/);
    const palavrasUnicas = new Set(palavras.filter(palavra => palavra.length > 3));
    const totalPalavras = palavras.length;

    if (totalPalavras === 0) return 0;

    const variedade = (palavrasUnicas.size / totalPalavras) * 100;
    return Math.min(100, variedade);
  }

  private calcularPrecisaoLexical(texto: string): number {
    let precisao = 100;

    // Verificar palavras imprecisas
    const palavrasImprecisas = [
      'coisa', 'algo', 'algum', 'alguma', 'alguns', 'algumas',
      'muito', 'pouco', 'bastante', 'demais'
    ];

    palavrasImprecisas.forEach(palavra => {
      const ocorrencias = (texto.toLowerCase().match(new RegExp(`\\b${palavra}\\b`, 'g')) || []).length;
      precisao -= ocorrencias * 10;
    });

    return Math.max(0, precisao);
  }

  private identificarProblemasLexical(texto: string, problemas: string[]): void {
    // Verificar palavras imprecisas
    const palavrasImprecisas = [
      'coisa', 'algo', 'algum', 'alguma', 'alguns', 'algumas'
    ];

    palavrasImprecisas.forEach(palavra => {
      if (texto.toLowerCase().includes(palavra)) {
        problemas.push(`Uso de palavra imprecisa "${palavra}"`);
      }
    });

    // Verificar repetição excessiva
    const palavras = texto.toLowerCase().split(/\s+/);
    const contagemPalavras: { [key: string]: number } = {};
    
    palavras.forEach(palavra => {
      if (palavra.length > 4) {
        contagemPalavras[palavra] = (contagemPalavras[palavra] || 0) + 1;
      }
    });

    Object.entries(contagemPalavras).forEach(([palavra, count]) => {
      if (count > 8) {
        problemas.push(`Repetição excessiva da palavra "${palavra}"`);
      }
    });
  }

  private verificarDesenvolvimentoTema(paragrafo: string): boolean {
    const indicadoresDesenvolvimento = [
      'exemplo', 'como', 'tal como', 'por exemplo', 'a saber',
      'dados', 'estatísticas', 'pesquisa', 'estudo'
    ];

    return indicadoresDesenvolvimento.some(indicador => 
      paragrafo.toLowerCase().includes(indicador)
    );
  }

  private extrairPalavrasChave(texto: string): string[] {
    const stopWords = ['de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos', 'a', 'o', 'as', 'os', 'e', 'ou', 'mas', 'por', 'para', 'com', 'sem', 'sobre', 'entre'];
    
    return texto.toLowerCase()
      .split(/\s+/)
      .filter(palavra => palavra.length > 3 && !stopWords.includes(palavra))
      .map(palavra => palavra.replace(/[.,!?;:]/, ''));
  }

  // Cálculo da nota para Competência 4
  calcularNota(analise: AnaliseC4): number {
    let nota = 0;

    // Conectivos (25% da nota)
    nota += (analise.conectivos.diversidade / 100) * 15;
    nota += (analise.conectivos.adequacao / 100) * 35;

    // Coesão (25% da nota)
    nota += (analise.coesao.referencial / 100) * 15;
    nota += (analise.coesao.sequencial / 100) * 35;

    // Progressão (20% da nota)
    nota += (analise.progressao.tematica / 100) * 15;
    nota += (analise.progressao.informacional / 100) * 25;

    // Paralelismo (15% da nota)
    nota += (analise.paralelismo.sintatico / 100) * 10;
    nota += (analise.paralelismo.semantico / 100) * 20;

    // Recursos expressivos (10% da nota)
    nota += (analise.recursos.expressivos / 100) * 10;
    nota += (analise.recursos.variedade / 100) * 10;

    // Variedade lexical (5% da nota)
    nota += (analise.lexical.variedade / 100) * 5;
    nota += (analise.lexical.precisao / 100) * 5;

    // Contar total de problemas
    const totalProblemas = (analise.conectivos.problemas?.length || 0) +
                          (analise.coesao.problemas?.length || 0) +
                          (analise.progressao.problemas?.length || 0) +
                          (analise.paralelismo.problemas?.length || 0) +
                          (analise.recursos.problemas?.length || 0) +
                          (analise.lexical.problemas?.length || 0);

    // Penalização por mais de 3 erros: -40 pontos
    if (totalProblemas > 3) {
      nota = Math.max(0, nota - 40);
      console.log(`⚠️ PENALIZAÇÃO APLICADA: ${totalProblemas} problemas encontrados (>3) = -40 pontos na Competência 4`);
    }

    return Math.min(200, Math.max(0, nota));
  }

  // Geração de feedback para Competência 4
  gerarFeedback(analise: AnaliseC4, nota: number): {
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

  private gerarJustificativa(analise: AnaliseC4, nota: number): string {
    if (nota >= 180) {
      return 'Excelente conhecimento dos mecanismos linguísticos. Conectivos diversos e adequados, coesão perfeita, progressão clara e recursos expressivos variados.';
    } else if (nota >= 140) {
      return 'Bom conhecimento dos mecanismos linguísticos. Conectivos adequados, coesão satisfatória, progressão clara e recursos expressivos presentes.';
    } else if (nota >= 100) {
      return 'Conhecimento regular dos mecanismos linguísticos. Conectivos básicos, coesão parcial, progressão limitada e recursos expressivos escassos.';
    } else if (nota >= 60) {
      return 'Conhecimento insuficiente dos mecanismos linguísticos. Conectivos inadequados, coesão precária, progressão confusa e recursos expressivos ausentes.';
    } else {
      return 'Conhecimento muito insuficiente dos mecanismos linguísticos. Conectivos inadequados, coesão ausente, progressão inexistente e recursos expressivos ausentes.';
    }
  }

  private identificarPontosFortes(analise: AnaliseC4): string[] {
    const pontos: string[] = [];

    if (analise.conectivos.diversidade >= 80) {
      pontos.push('Excelente variedade de conectivos');
    }

    if (analise.coesao.referencial >= 80) {
      pontos.push('Boa coesão referencial');
    }

    if (analise.progressao.tematica >= 80) {
      pontos.push('Progressão temática clara');
    }

    if (analise.paralelismo.sintatico >= 70) {
      pontos.push('Bom uso de estruturas paralelas');
    }

    if (analise.lexical.variedade >= 70) {
      pontos.push('Variedade lexical adequada');
    }

    return pontos;
  }

  private identificarPontosFracos(analise: AnaliseC4): string[] {
    const pontos: string[] = [];

    if (analise.conectivos.diversidade < 60) {
      pontos.push('Pouca variedade de conectivos');
    }

    if (analise.coesao.sequencial < 60) {
      pontos.push('Coesão sequencial insuficiente');
    }

    if (analise.progressao.informacional < 60) {
      pontos.push('Progressão informacional limitada');
    }

    if (analise.paralelismo.semantico < 50) {
      pontos.push('Paralelismo semântico insuficiente');
    }

    if (analise.lexical.precisao < 70) {
      pontos.push('Precisão lexical insuficiente');
    }

    return pontos;
  }

  private gerarSugestoes(analise: AnaliseC4): string[] {
    const sugestoes: string[] = [];

    if (analise.conectivos.diversidade < 60) {
      sugestoes.push('Use mais variedade de conectivos para relacionar as ideias');
    }

    if (analise.coesao.sequencial < 60) {
      sugestoes.push('Melhore a coesão sequencial entre parágrafos');
    }

    if (analise.progressao.tematica < 60) {
      sugestoes.push('Desenvolva melhor a progressão temática');
    }

    if (analise.paralelismo.sintatico < 50) {
      sugestoes.push('Use mais estruturas paralelas para dar ritmo ao texto');
    }

    if (analise.lexical.variedade < 60) {
      sugestoes.push('Amplie o vocabulário para evitar repetições');
    }

    return sugestoes;
  }
}
