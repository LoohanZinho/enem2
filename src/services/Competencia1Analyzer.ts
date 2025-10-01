// Analisador da Competência 1 - Domínio da norma culta da língua portuguesa
// C1: Demonstração de domínio da modalidade escrita formal da língua portuguesa

export interface ErroGramatical {
  tipo: 'concordancia' | 'regencia' | 'ortografia' | 'pontuacao' | 'acentuacao' | 'crase' | 'sintaxe';
  posicao: number;
  texto: string;
  correcao: string;
  explicacao: string;
  severidade: 'leve' | 'moderado' | 'grave';
  pontosPerdidos: number;
}

export interface AnaliseC1 {
  erros: ErroGramatical[];
  pontuacao: {
    correta: boolean;
    problemas: string[];
    sugestoes: string[];
  };
  ortografia: {
    correta: boolean;
    erros: string[];
    sugestoes: string[];
  };
  concordancia: {
    verbal: { correta: boolean; erros: string[] };
    nominal: { correta: boolean; erros: string[] };
  };
  regencia: {
    verbal: { correta: boolean; erros: string[] };
    nominal: { correta: boolean; erros: string[] };
  };
  pronomes: {
    uso: { correto: boolean; erros: string[] };
    colocacao: { correta: boolean; erros: string[] };
  };
  estrutura: {
    periodos: { bemFormados: boolean; problemas: string[] };
    oracoes: { bemEstruturadas: boolean; problemas: string[] };
  };
  qualidadeGeral: {
    nivel: 'excelente' | 'bom' | 'regular' | 'ruim' | 'muito_ruim';
    justificativa: string;
  };
}

export class Competencia1Analyzer {
  // Dicionários e padrões para análise - EXPANDIDOS E MELHORADOS
  private errosComuns: Record<string, { erro: RegExp; correcao: string; explicacao: string; severidade: 'leve' | 'moderado' | 'grave'; pontos: number }[]> = {
    concordancia: [
      { erro: /os alunos foi/g, correcao: 'os alunos foram', explicacao: 'Concordância verbal incorreta', severidade: 'grave', pontos: 40 },
      { erro: /as meninas saiu/g, correcao: 'as meninas saíram', explicacao: 'Concordância verbal incorreta', severidade: 'grave', pontos: 40 },
      { erro: /a maioria dos alunos foi/g, correcao: 'a maioria dos alunos foi', explicacao: 'Concordância com coletivo', severidade: 'moderado', pontos: 20 },
      { erro: /os dados mostra/g, correcao: 'os dados mostram', explicacao: 'Concordância verbal incorreta', severidade: 'grave', pontos: 40 },
      { erro: /as pessoas pensa/g, correcao: 'as pessoas pensam', explicacao: 'Concordância verbal incorreta', severidade: 'grave', pontos: 40 },
      { erro: /os jovens tem/g, correcao: 'os jovens têm', explicacao: 'Concordância verbal incorreta', severidade: 'grave', pontos: 40 },
      { erro: /as crianças vai/g, correcao: 'as crianças vão', explicacao: 'Concordância verbal incorreta', severidade: 'grave', pontos: 40 },
      { erro: /os professores ensina/g, correcao: 'os professores ensinam', explicacao: 'Concordância verbal incorreta', severidade: 'grave', pontos: 40 },
      { erro: /nós vai/g, correcao: 'nós vamos', explicacao: 'Concordância verbal incorreta', severidade: 'grave', pontos: 40 },
      { erro: /vocês vai/g, correcao: 'vocês vão', explicacao: 'Concordância verbal incorreta', severidade: 'grave', pontos: 40 },
      { erro: /a gente foi/g, correcao: 'a gente foi', explicacao: 'Concordância com "a gente"', severidade: 'moderado', pontos: 20 }
    ],
    regencia: [
      { erro: /assistir o filme/g, correcao: 'assistir ao filme', explicacao: 'Regência verbal incorreta', severidade: 'moderado', pontos: 20 },
      { erro: /obedecer os pais/g, correcao: 'obedecer aos pais', explicacao: 'Regência verbal incorreta', severidade: 'moderado', pontos: 20 },
      { erro: /aspirar o cargo/g, correcao: 'aspirar ao cargo', explicacao: 'Regência verbal incorreta', severidade: 'moderado', pontos: 20 },
      { erro: /desobedecer as regras/g, correcao: 'desobedecer às regras', explicacao: 'Regência verbal incorreta', severidade: 'moderado', pontos: 20 },
      { erro: /visar o objetivo/g, correcao: 'visar ao objetivo', explicacao: 'Regência verbal incorreta', severidade: 'moderado', pontos: 20 }
    ],
    ortografia: [
      { erro: /concerteza/g, correcao: 'com certeza', explicacao: 'Ortografia incorreta', severidade: 'leve', pontos: 10 },
      { erro: /menas/g, correcao: 'menos', explicacao: 'Ortografia incorreta', severidade: 'leve', pontos: 10 },
      { erro: /tambem/g, correcao: 'também', explicacao: 'Acentuação incorreta', severidade: 'leve', pontos: 10 },
      { erro: /atras/g, correcao: 'atrás', explicacao: 'Acentuação incorreta', severidade: 'leve', pontos: 10 },
      { erro: /atraves/g, correcao: 'através', explicacao: 'Acentuação incorreta', severidade: 'leve', pontos: 10 },
      { erro: /alem/g, correcao: 'além', explicacao: 'Acentuação incorreta', severidade: 'leve', pontos: 10 },
      { erro: /nao/g, correcao: 'não', explicacao: 'Acentuação incorreta', severidade: 'leve', pontos: 10 },
      { erro: /porem/g, correcao: 'porém', explicacao: 'Acentuação incorreta', severidade: 'leve', pontos: 10 },
      { erro: /entretanto/g, correcao: 'entretanto', explicacao: 'Ortografia incorreta', severidade: 'leve', pontos: 10 }
    ],
    pontuacao: [
      { erro: /,e/g, correcao: ' e', explicacao: 'Vírgula desnecessária antes de conjunção', severidade: 'leve', pontos: 5 },
      { erro: /\.\./g, correcao: '.', explicacao: 'Pontos excessivos', severidade: 'leve', pontos: 5 },
      { erro: /,,/g, correcao: ',', explicacao: 'Vírgulas excessivas', severidade: 'leve', pontos: 5 },
      { erro: /;\./g, correcao: ';', explicacao: 'Ponto e vírgula incorreto', severidade: 'leve', pontos: 5 }
    ],
    sintaxe: [
      { erro: /mim fazer/g, correcao: 'eu fazer', explicacao: 'Uso incorreto de pronome', severidade: 'grave', pontos: 40 },
      { erro: /para mim fazer/g, correcao: 'para eu fazer', explicacao: 'Uso incorreto de pronome', severidade: 'grave', pontos: 40 },
      { erro: /mim ajudar/g, correcao: 'eu ajudar', explicacao: 'Uso incorreto de pronome', severidade: 'grave', pontos: 40 },
      { erro: /para mim ajudar/g, correcao: 'para eu ajudar', explicacao: 'Uso incorreto de pronome', severidade: 'grave', pontos: 40 }
    ]
  };

  private conectivos = [
    'portanto', 'entretanto', 'contudo', 'todavia', 'assim', 'dessa forma',
    'além disso', 'por outro lado', 'em primeiro lugar', 'em segundo lugar',
    'por fim', 'consequentemente', 'logo', 'assim sendo', 'desse modo',
    'ademais', 'outrossim', 'igualmente', 'similarmente', 'analogamente'
  ];

  private pronomes = [
    'que', 'quem', 'onde', 'cujo', 'cuja', 'cujos', 'cujas',
    'ele', 'ela', 'eles', 'elas', 'o', 'a', 'os', 'as',
    'me', 'te', 'se', 'nos', 'vos', 'lhe', 'lhes'
  ];

  // Análise principal da Competência 1 - MELHORADA
  analisar(texto: string): AnaliseC1 {
    const erros = this.detectarErrosGramaticais(texto);
    const pontuacao = this.verificarPontuacao(texto);
    const ortografia = this.verificarOrtografia(texto);
    const concordancia = this.verificarConcordancia(texto);
    const regencia = this.verificarRegencia(texto);
    const pronomes = this.verificarPronomes(texto);
    const estrutura = this.verificarEstrutura(texto);
    const qualidadeGeral = this.avaliarQualidadeGeral(texto, erros);

    return {
      erros,
      pontuacao,
      ortografia,
      concordancia,
      regencia,
      pronomes,
      estrutura,
      qualidadeGeral
    };
  }

  // Detecção de erros gramaticais - MELHORADA E MAIS PRECISA
  private detectarErrosGramaticais(texto: string): ErroGramatical[] {
    const erros: ErroGramatical[] = [];
    
    // Verificar todos os tipos de erros
    Object.entries(this.errosComuns).forEach(([tipo, listaErros]) => {
      listaErros.forEach(erro => {
        const matches = texto.match(erro.erro);
        if (matches) {
          matches.forEach(match => {
            erros.push({
              tipo: tipo as any,
              posicao: texto.indexOf(match),
              texto: match,
              correcao: erro.correcao,
              explicacao: erro.explicacao,
              severidade: erro.severidade,
              pontosPerdidos: erro.pontos
            });
          });
        }
      });
    });

    // Detectar erros adicionais específicos
    this.detectarErrosAdicionais(texto, erros);

    return erros;
  }

  // Detecção de erros adicionais específicos
  private detectarErrosAdicionais(texto: string, erros: ErroGramatical[]): void {
    // Verificar concordância com coletivos
    const coletivos = ['a maioria', 'a minoria', 'a metade', 'a parte', 'o resto'];
    coletivos.forEach(coletivo => {
      const padrao = new RegExp(`${coletivo}\\s+(dos|das)\\s+\\w+\\s+(foi|está|tem|pode|deve)`, 'gi');
      const matches = texto.match(padrao);
      if (matches) {
        matches.forEach(match => {
          erros.push({
            tipo: 'concordancia',
            posicao: texto.indexOf(match),
            texto: match,
            correcao: match.replace(/(foi|está|tem|pode|deve)/, 'foram/estão/têm/podem/devem'),
            explicacao: 'Concordância com coletivo',
            severidade: 'moderado',
            pontosPerdidos: 20
          });
        });
      }
    });

    // Verificar uso incorreto de "a gente"
    const padraoA = /a gente (foi|está|tem|pode|deve)/gi;
    const matchesA = texto.match(padraoA);
    if (matchesA) {
      matchesA.forEach(match => {
        erros.push({
          tipo: 'concordancia',
          posicao: texto.indexOf(match),
          texto: match,
          correcao: match.replace(/(foi|está|tem|pode|deve)/, 'foi/está/tem/pode/deve'),
          explicacao: 'Concordância com "a gente"',
          severidade: 'moderado',
          pontosPerdidos: 20
        });
      });
    }

    // Verificar uso incorreto de "nós"
    const padraoN = /nós (foi|está|tem|pode|deve)/gi;
    const matchesN = texto.match(padraoN);
    if (matchesN) {
      matchesN.forEach(match => {
        erros.push({
          tipo: 'concordancia',
          posicao: texto.indexOf(match),
          texto: match,
          correcao: match.replace(/(foi|está|tem|pode|deve)/, 'fomos/estamos/temos/podemos/devemos'),
          explicacao: 'Concordância com "nós"',
          severidade: 'grave',
          pontosPerdidos: 40
        });
      });
    }
  }

  // Verificação de pontuação - MELHORADA
  private verificarPontuacao(texto: string) {
    const problemas: string[] = [];
    const sugestoes: string[] = [];

    // Verificar vírgulas desnecessárias
    if (/,e/g.test(texto)) {
      problemas.push('Vírgula desnecessária antes de conjunção "e"');
      sugestoes.push('Remova a vírgula antes de "e" quando não há pausa');
    }

    // Verificar pontos excessivos
    if (/\.{2,}/g.test(texto)) {
      problemas.push('Uso excessivo de pontos');
      sugestoes.push('Use apenas um ponto no final de frases');
    }

    // Verificar ausência de vírgulas em enumerações
    const enumerações = texto.match(/\d+[.)]\s*[^,]+[^,]+[^,]+/g);
    if (enumerações) {
      problemas.push('Possível ausência de vírgulas em enumerações');
      sugestoes.push('Use vírgulas para separar itens em enumerações');
    }

    // Verificar vírgulas antes de "e" em enumerações
    const enumeraçõesComE = texto.match(/\d+[.)]\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*e\s+[^,]+/g);
    if (enumeraçõesComE) {
      problemas.push('Vírgula antes de "e" em enumerações');
      sugestoes.push('Não use vírgula antes de "e" em enumerações');
    }

    return {
      correta: problemas.length === 0,
      problemas,
      sugestoes
    };
  }

  // Verificação de ortografia - MELHORADA
  private verificarOrtografia(texto: string) {
    const erros: string[] = [];
    const sugestoes: string[] = [];

    // Verificar palavras comuns mal escritas
    const palavrasComuns = {
      'concerteza': 'com certeza',
      'menas': 'menos',
      'tambem': 'também',
      'atras': 'atrás',
      'atraves': 'através',
      'alem': 'além',
      'nao': 'não',
      'porem': 'porém',
      'entretanto': 'entretanto',
      'consequentemente': 'consequentemente',
      'portanto': 'portanto',
      'todavia': 'todavia',
      'contudo': 'contudo'
    };

    Object.entries(palavrasComuns).forEach(([erro, correcao]) => {
      if (texto.toLowerCase().includes(erro)) {
        erros.push(`"${erro}" deve ser escrito "${correcao}"`);
        sugestoes.push(`Substitua "${erro}" por "${correcao}"`);
      }
    });

    // Verificar acentuação
    const palavrasSemAcento = ['nao', 'tambem', 'alem', 'porem', 'entretanto'];
    palavrasSemAcento.forEach(palavra => {
      if (texto.toLowerCase().includes(palavra)) {
        erros.push(`"${palavra}" deve ser acentuado`);
        sugestoes.push(`Adicione acento em "${palavra}"`);
      }
    });

    return {
      correta: erros.length === 0,
      erros,
      sugestoes
    };
  }

  // Verificação de concordância - MELHORADA
  private verificarConcordancia(texto: string) {
    const errosVerbal: string[] = [];
    const errosNominal: string[] = [];

    // Verificar concordância verbal
    const sujeitosPlurais = ['os alunos', 'as pessoas', 'os estudantes', 'as crianças', 'os jovens', 'os professores'];
    const verbosSingulares = ['foi', 'está', 'tem', 'pode', 'deve', 'vai', 'ensina', 'pensa'];

    sujeitosPlurais.forEach(sujeito => {
      verbosSingulares.forEach(verbo => {
        const padrao = new RegExp(`${sujeito}\\s+${verbo}`, 'gi');
        if (padrao.test(texto)) {
          errosVerbal.push(`Concordância incorreta: "${sujeito} ${verbo}"`);
        }
      });
    });

    // Verificar concordância nominal
    const artigosPlurais = ['os', 'as'];
    const substantivosSingulares = ['problema', 'questão', 'situação', 'problema', 'questão'];

    artigosPlurais.forEach(artigo => {
      substantivosSingulares.forEach(substantivo => {
        const padrao = new RegExp(`${artigo}\\s+${substantivo}`, 'gi');
        if (padrao.test(texto)) {
          errosNominal.push(`Concordância incorreta: "${artigo} ${substantivo}"`);
        }
      });
    });

    return {
      verbal: {
        correta: errosVerbal.length === 0,
        erros: errosVerbal
      },
      nominal: {
        correta: errosNominal.length === 0,
        erros: errosNominal
      }
    };
  }

  // Verificação de regência - MELHORADA
  private verificarRegencia(texto: string) {
    const errosVerbal: string[] = [];
    const errosNominal: string[] = [];

    // Verificar regência verbal
    const verbosTransitivosIndiretos = [
      { verbo: 'assistir', preposicao: 'a' },
      { verbo: 'obedecer', preposicao: 'a' },
      { verbo: 'desobedecer', preposicao: 'a' },
      { verbo: 'aspirar', preposicao: 'a' },
      { verbo: 'visar', preposicao: 'a' },
      { verbo: 'chegar', preposicao: 'a' },
      { verbo: 'ir', preposicao: 'a' }
    ];

    verbosTransitivosIndiretos.forEach(({ verbo, preposicao }) => {
      const padrao = new RegExp(`${verbo}\\s+(?!${preposicao}\\s)`, 'gi');
      if (padrao.test(texto)) {
        errosVerbal.push(`"${verbo}" requer a preposição "${preposicao}"`);
      }
    });

    return {
      verbal: {
        correta: errosVerbal.length === 0,
        erros: errosVerbal
      },
      nominal: {
        correta: errosNominal.length === 0,
        erros: errosNominal
      }
    };
  }

  // Verificação de pronomes - MELHORADA
  private verificarPronomes(texto: string) {
    const errosUso: string[] = [];
    const errosColocacao: string[] = [];

    // Verificar uso de pronomes
    const pronomesIncorretos = [
      { erro: 'mim fazer', correcao: 'eu fazer' },
      { erro: 'para mim fazer', correcao: 'para eu fazer' },
      { erro: 'mim ajudar', correcao: 'eu ajudar' },
      { erro: 'para mim ajudar', correcao: 'para eu ajudar' }
    ];

    pronomesIncorretos.forEach(({ erro, correcao }) => {
      if (texto.toLowerCase().includes(erro)) {
        errosUso.push(`"${erro}" deve ser "${correcao}"`);
      }
    });

    // Verificar colocação pronominal
    const verbosProclise = ['não', 'jamais', 'nunca', 'sempre', 'já', 'ainda'];
    verbosProclise.forEach(adv => {
      const padrao = new RegExp(`${adv}\\s+[a-z]+\\s+(me|te|se|nos|vos|lhe|lhes)`, 'gi');
      if (padrao.test(texto)) {
        errosColocacao.push('Pronome deve vir antes do verbo após advérbio de negação');
      }
    });

    return {
      uso: {
        correto: errosUso.length === 0,
        erros: errosUso
      },
      colocacao: {
        correta: errosColocacao.length === 0,
        erros: errosColocacao
      }
    };
  }

  // Verificação de estrutura - MELHORADA
  private verificarEstrutura(texto: string) {
    const problemasPeriodos: string[] = [];
    const problemasOracoes: string[] = [];

    // Verificar períodos muito longos
    const frases = texto.split(/[.!?]+/);
    frases.forEach((frase, index) => {
      if (frase.trim().split(' ').length > 30) {
        problemasPeriodos.push(`Frase ${index + 1} muito longa (${frase.trim().split(' ').length} palavras)`);
      }
    });

    // Verificar orações mal estruturadas
    const oracoesSubordinadas = texto.match(/[^.!?]*(que|quando|onde|como|porque|se|embora)[^.!?]*/gi);
    if (oracoesSubordinadas) {
      oracoesSubordinadas.forEach((oracao, index) => {
        if (oracao.trim().split(' ').length > 25) {
          problemasOracoes.push(`Oração subordinada ${index + 1} muito complexa`);
        }
      });
    }

    return {
      periodos: {
        bemFormados: problemasPeriodos.length === 0,
        problemas: problemasPeriodos
      },
      oracoes: {
        bemEstruturadas: problemasOracoes.length === 0,
        problemas: problemasOracoes
      }
    };
  }

  // Avaliação da qualidade geral - NOVO MÉTODO
  private avaliarQualidadeGeral(texto: string, erros: ErroGramatical[]): {
    nivel: 'excelente' | 'bom' | 'regular' | 'ruim' | 'muito_ruim';
    justificativa: string;
  } {
    const totalErros = erros.length;
    const errosGraves = erros.filter(e => e.severidade === 'grave').length;
    const errosModerados = erros.filter(e => e.severidade === 'moderado').length;
    const errosLeves = erros.filter(e => e.severidade === 'leve').length;

    let nivel: 'excelente' | 'bom' | 'regular' | 'ruim' | 'muito_ruim';
    let justificativa: string;

    if (totalErros === 0) {
      nivel = 'excelente';
      justificativa = 'Excelente domínio da norma culta. Nenhum erro gramatical detectado.';
    } else if (errosGraves === 0 && errosModerados <= 2 && totalErros <= 5) {
      nivel = 'bom';
      justificativa = 'Bom domínio da norma culta. Poucos erros leves e moderados.';
    } else if (errosGraves <= 2 && errosModerados <= 4 && totalErros <= 10) {
      nivel = 'regular';
      justificativa = 'Domínio regular da norma culta. Alguns erros que comprometem parcialmente a compreensão.';
    } else if (errosGraves <= 5 && totalErros <= 15) {
      nivel = 'ruim';
      justificativa = 'Domínio insuficiente da norma culta. Muitos erros que comprometem significativamente a compreensão.';
    } else {
      nivel = 'muito_ruim';
      justificativa = 'Domínio muito insuficiente da norma culta. Desvios gramaticais graves que comprometem totalmente a compreensão.';
    }

    return { nivel, justificativa };
  }

  // Cálculo da nota para Competência 1 - SISTEMA REALISTA DO ENEM
  calcularNota(analise: AnaliseC1): number {
    const notaInicial = 200; // Nota máxima
    let penalizacoes = 0;

    // Contar total de erros
    const totalErros = analise.erros.length + 
                      analise.pontuacao.problemas.length + 
                      analise.ortografia.erros.length + 
                      (analise.concordancia.verbal.erros.length + analise.concordancia.nominal.erros.length) +
                      (analise.regencia.verbal.erros.length + analise.regencia.nominal.erros.length) +
                      (analise.pronomes.uso.erros.length + analise.pronomes.colocacao.erros.length) +
                      (analise.estrutura.periodos.problemas.length + analise.estrutura.oracoes.problemas.length);

    // Penalização por mais de 3 erros: -40 pontos (REGRA ENEM)
    if (totalErros > 3) {
      penalizacoes += 40;
      console.log(`⚠️ PENALIZAÇÃO APLICADA: ${totalErros} erros encontrados (>3) = -40 pontos na Competência 1`);
    }

    // Penalizar por erros gramaticais baseado na severidade
    analise.erros.forEach(erro => {
      penalizacoes += erro.pontosPerdidos;
    });

    // Penalizar por problemas de pontuação
    penalizacoes += analise.pontuacao.problemas.length * 15;

    // Penalizar por erros de ortografia
    penalizacoes += analise.ortografia.erros.length * 10;

    // Penalizar por problemas de concordância
    penalizacoes += (analise.concordancia.verbal.erros.length + analise.concordancia.nominal.erros.length) * 20;

    // Penalizar por problemas de regência
    penalizacoes += (analise.regencia.verbal.erros.length + analise.regencia.nominal.erros.length) * 15;

    // Penalizar por problemas de pronomes
    penalizacoes += (analise.pronomes.uso.erros.length + analise.pronomes.colocacao.erros.length) * 10;

    // Penalizar por problemas de estrutura
    penalizacoes += (analise.estrutura.periodos.problemas.length + analise.estrutura.oracoes.problemas.length) * 5;

    // Aplicar penalização adicional baseada na qualidade geral
    switch (analise.qualidadeGeral.nivel) {
      case 'excelente':
        // Sem penalização adicional
        break;
      case 'bom':
        penalizacoes += 10;
        break;
      case 'regular':
        penalizacoes += 30;
        break;
      case 'ruim':
        penalizacoes += 60;
        break;
      case 'muito_ruim':
        penalizacoes += 100;
        break;
    }

    const notaFinal = Math.max(0, notaInicial - penalizacoes);
    
    console.log(`📊 COMPETÊNCIA 1 - Nota: ${notaFinal}/200 (Penalizações: ${penalizacoes})`);
    console.log(`   - Total de erros: ${totalErros}`);
    console.log(`   - Qualidade geral: ${analise.qualidadeGeral.nivel}`);
    
    return notaFinal;
  }

  // Geração de feedback para Competência 1 - MELHORADA
  gerarFeedback(analise: AnaliseC1, nota: number): {
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

  private gerarJustificativa(analise: AnaliseC1, nota: number): string {
    if (nota >= 180) {
      return 'Excelente domínio da norma culta. Poucos ou nenhum desvio gramatical, pontuação adequada e ortografia correta.';
    } else if (nota >= 140) {
      return 'Bom domínio da norma culta. Alguns desvios gramaticais leves, mas não comprometem a compreensão.';
    } else if (nota >= 100) {
      return 'Domínio regular da norma culta. Vários desvios gramaticais que comprometem parcialmente a compreensão.';
    } else if (nota >= 60) {
      return 'Domínio insuficiente da norma culta. Muitos desvios gramaticais que comprometem significativamente a compreensão.';
    } else {
      return 'Domínio muito insuficiente da norma culta. Desvios gramaticais graves que comprometem totalmente a compreensão.';
    }
  }

  private identificarPontosFortes(analise: AnaliseC1): string[] {
    const pontos: string[] = [];

    if (analise.erros.length === 0) {
      pontos.push('Ausência de erros gramaticais graves');
    }

    if (analise.pontuacao.correta) {
      pontos.push('Uso correto da pontuação');
    }

    if (analise.ortografia.correta) {
      pontos.push('Ortografia correta');
    }

    if (analise.concordancia.verbal.correta && analise.concordancia.nominal.correta) {
      pontos.push('Concordância verbal e nominal corretas');
    }

    if (analise.estrutura.periodos.bemFormados) {
      pontos.push('Períodos bem estruturados');
    }

    if (analise.qualidadeGeral.nivel === 'excelente') {
      pontos.push('Excelente qualidade geral do texto');
    }

    return pontos;
  }

  private identificarPontosFracos(analise: AnaliseC1): string[] {
    const pontos: string[] = [];

    if (analise.erros.length > 0) {
      pontos.push(`${analise.erros.length} erro(s) gramatical(is) detectado(s)`);
    }

    if (!analise.pontuacao.correta) {
      pontos.push('Problemas na pontuação');
    }

    if (!analise.ortografia.correta) {
      pontos.push('Erros de ortografia');
    }

    if (!analise.concordancia.verbal.correta) {
      pontos.push('Problemas na concordância verbal');
    }

    if (!analise.concordancia.nominal.correta) {
      pontos.push('Problemas na concordância nominal');
    }

    if (analise.qualidadeGeral.nivel === 'ruim' || analise.qualidadeGeral.nivel === 'muito_ruim') {
      pontos.push('Qualidade geral do texto comprometida');
    }

    return pontos;
  }

  private gerarSugestoes(analise: AnaliseC1): string[] {
    const sugestoes: string[] = [];

    if (analise.erros.length > 0) {
      sugestoes.push('Revise as regras gramaticais básicas');
    }

    if (!analise.pontuacao.correta) {
      sugestoes.push('Estude as regras de pontuação');
    }

    if (!analise.ortografia.correta) {
      sugestoes.push('Pratique a ortografia das palavras comuns');
    }

    if (!analise.concordancia.verbal.correta) {
      sugestoes.push('Estude as regras de concordância verbal');
    }

    if (!analise.concordancia.nominal.correta) {
      sugestoes.push('Estude as regras de concordância nominal');
    }

    if (analise.qualidadeGeral.nivel === 'ruim' || analise.qualidadeGeral.nivel === 'muito_ruim') {
      sugestoes.push('Pratique mais a escrita formal e revise cuidadosamente seu texto');
    }

    return sugestoes;
  }
}
