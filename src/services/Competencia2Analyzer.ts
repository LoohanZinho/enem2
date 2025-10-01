// Analisador da Competência 2 - Compreensão da proposta de redação
// C2: Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento

export interface AnaliseC2 {
  fidelidadeTema: {
    tangenciamento: boolean;
    desenvolvimento: boolean;
    abordagem: 'adequada' | 'parcial' | 'inadequada';
    justificativa: string;
  };
  conhecimentosAreas: {
    aplicados: boolean;
    areas: string[];
    problemas?: string[];
    sugestoes: string[];
  };
  abordagemCritica: {
    presente: boolean;
    nivel: 'excelente' | 'bom' | 'regular' | 'ruim' | 'ausente';
    problemas?: string[];
    sugestoes: string[];
  };
  coerencia: {
    logica: boolean;
    problemas?: string[];
    sugestoes: string[];
  };
  qualidadeGeral: {
    nivel: 'excelente' | 'bom' | 'regular' | 'ruim' | 'muito_ruim';
    justificativa: string;
  };
}

export class Competencia2Analyzer {
  // Palavras-chave comuns que indicam tangenciamento
  private palavrasTangenciamento = [
    'educação', 'saúde', 'violência', 'corrupção', 'política', 'economia',
    'sociedade', 'cultura', 'tecnologia', 'meio ambiente', 'sustentabilidade'
  ];

  // Conectivos que indicam boa argumentação
  private conectivosArgumentativos = [
    'portanto', 'assim', 'dessa forma', 'consequentemente', 'logo',
    'por isso', 'por conseguinte', 'em decorrência', 'devido a',
    'em virtude de', 'tendo em vista', 'considerando que'
  ];

  // Expressões que indicam conhecimento de áreas
  private expressoesAreas = {
    sociologia: ['sociedade', 'coletivo', 'indivíduo', 'grupo social', 'instituições'],
    filosofia: ['ética', 'moral', 'valores', 'princípios', 'conceito', 'ideia'],
    historia: ['histórico', 'passado', 'tradição', 'evolução', 'processo histórico'],
    geografia: ['espaço', 'território', 'região', 'localização', 'distribuição'],
    direito: ['lei', 'legislação', 'direitos', 'deveres', 'constituição', 'jurídico'],
    economia: ['recursos', 'financiamento', 'investimento', 'orçamento', 'econômico']
  };

  // Propostas genéricas comuns
  private propostasGenericas = [
    'melhorar a educação',
    'investir em políticas públicas',
    'criar campanhas de conscientização',
    'aumentar o investimento',
    'melhorar a qualidade',
    'promover mudanças',
    'implementar medidas'
  ];

  // Análise principal da Competência 2
  analisar(texto: string, tema: string): AnaliseC2 {
    const fidelidadeTema = this.verificarFidelidadeTema(texto, tema);
    const conhecimentosAreas = this.verificarConhecimentosAreas(texto);
    const abordagemCritica = this.verificarAbordagemCritica(texto);
    const coerencia = this.verificarCoerencia(texto);
    const qualidadeGeral = this.avaliarQualidadeGeral(texto, fidelidadeTema, conhecimentosAreas, abordagemCritica);

    return {
      fidelidadeTema,
      conhecimentosAreas,
      abordagemCritica,
      coerencia,
      qualidadeGeral
    };
  }

  // Verificação de fidelidade ao tema - ANÁLISE REALISTA
  private verificarFidelidadeTema(texto: string, tema: string) {
    const palavrasTema = this.extrairPalavrasChave(tema);
    const palavrasTexto = this.extrairPalavrasChave(texto);
    
    // Verificar se o texto aborda o tema
    const abordagemTema = this.calcularAbordagemTema(palavrasTema, palavrasTexto);
    
    // Verificar tangenciamento
    const tangenciamento = this.detectarTangenciamento(texto, tema);
    
    // Verificar desenvolvimento do tema
    const desenvolvimento = this.verificarDesenvolvimento(texto, tema);
    
    let abordagem: 'adequada' | 'parcial' | 'inadequada';
    let justificativa: string;

    if (abordagemTema >= 0.7 && !tangenciamento && desenvolvimento) {
      abordagem = 'adequada';
      justificativa = 'O texto aborda adequadamente o tema proposto, sem tangenciamento e com desenvolvimento consistente.';
    } else if (abordagemTema >= 0.4 && !tangenciamento) {
      abordagem = 'parcial';
      justificativa = 'O texto aborda parcialmente o tema, mas pode aprofundar mais a discussão.';
    } else {
      abordagem = 'inadequada';
      justificativa = 'O texto não aborda adequadamente o tema proposto ou apresenta tangenciamento.';
    }

    return {
      tangenciamento,
      desenvolvimento,
      abordagem,
      justificativa
    };
  }

  // Extrair palavras-chave do tema
  private extrairPalavrasChave(texto: string): string[] {
    return texto.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(palavra => palavra.length > 3)
      .filter(palavra => !this.ePalavraComum(palavra));
  }

  // Verificar se é palavra comum (artigos, preposições, etc.)
  private ePalavraComum(palavra: string): boolean {
    const palavrasComuns = [
      'para', 'com', 'por', 'sobre', 'entre', 'através', 'durante', 'após',
      'antes', 'depois', 'quando', 'onde', 'como', 'porque', 'então', 'assim',
      'também', 'ainda', 'sempre', 'nunca', 'jamais', 'muito', 'pouco',
      'mais', 'menos', 'bem', 'mal', 'bom', 'ruim', 'grande', 'pequeno'
    ];
    return palavrasComuns.includes(palavra);
  }

  // Calcular abordagem do tema
  private calcularAbordagemTema(palavrasTema: string[], palavrasTexto: string[]): number {
    if (palavrasTema.length === 0) return 0;
    
    const palavrasComuns = palavrasTema.filter(palavra => 
      palavrasTexto.some(p => p.includes(palavra) || palavra.includes(p))
    );
    
    return palavrasComuns.length / palavrasTema.length;
  }

  // Detectar tangenciamento
  private detectarTangenciamento(texto: string, tema: string): boolean {
    const palavrasTema = this.extrairPalavrasChave(tema);
    const palavrasTexto = this.extrairPalavrasChave(texto);
    
    // Se o texto não menciona palavras-chave do tema
    const mencionaTema = palavrasTema.some(palavra => 
      palavrasTexto.some(p => p.includes(palavra) || palavra.includes(p))
    );
    
    if (!mencionaTema) return true;
    
    // Verificar se fala muito sobre temas genéricos
    const temasGenericos = this.palavrasTangenciamento.filter(palavra =>
      palavrasTexto.some(p => p.includes(palavra))
    );
    
    // Se menciona mais temas genéricos que específicos do tema
    return temasGenericos.length > palavrasTema.length;
  }

  // Verificar desenvolvimento do tema
  private verificarDesenvolvimento(texto: string, tema: string): boolean {
    const paragrafos = texto.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    if (paragrafos.length < 3) return false;
    
    // Verificar se cada parágrafo desenvolve o tema
    const paragrafosDesenvolvem = paragrafos.filter(paragrafo => {
      const palavrasParagrafo = this.extrairPalavrasChave(paragrafo);
      const palavrasTema = this.extrairPalavrasChave(tema);
      
      return palavrasTema.some(palavra => 
        palavrasParagrafo.some(p => p.includes(palavra) || palavra.includes(p))
      );
    });
    
    return paragrafosDesenvolvem.length >= paragrafos.length * 0.7;
  }

  // Verificação de conhecimentos de áreas
  private verificarConhecimentosAreas(texto: string) {
    const areasPresentes: string[] = [];
    const problemas: string[] = [];
    const sugestoes: string[] = [];

    Object.entries(this.expressoesAreas).forEach(([area, expressoes]) => {
      const mencionaArea = expressoes.some(expressao => 
        texto.toLowerCase().includes(expressao)
      );
      
      if (mencionaArea) {
        areasPresentes.push(area);
      }
    });

    if (areasPresentes.length === 0) {
      problemas.push('Não há aplicação de conhecimentos de diferentes áreas');
      sugestoes.push('Inclua conhecimentos de sociologia, filosofia, história, geografia, direito ou economia');
    } else if (areasPresentes.length < 2) {
      problemas.push('Poucos conhecimentos de diferentes áreas aplicados');
      sugestoes.push('Diversifique os conhecimentos aplicados, incluindo mais áreas');
    }

    return {
      aplicados: areasPresentes.length > 0,
      areas: areasPresentes,
      problemas: problemas.length > 0 ? problemas : undefined,
      sugestoes
    };
  }

  // Verificação de abordagem crítica
  private verificarAbordagemCritica(texto: string) {
    const conectivosCriticos = this.conectivosArgumentativos.filter(conectivo =>
      texto.toLowerCase().includes(conectivo)
    );

    const problemas: string[] = [];
    const sugestoes: string[] = [];
    let nivel: 'excelente' | 'bom' | 'regular' | 'ruim' | 'ausente';

    if (conectivosCriticos.length >= 5) {
      nivel = 'excelente';
    } else if (conectivosCriticos.length >= 3) {
      nivel = 'bom';
    } else if (conectivosCriticos.length >= 1) {
      nivel = 'regular';
    } else {
      nivel = 'ruim';
      problemas.push('Falta de conectivos argumentativos');
      sugestoes.push('Use conectivos como "portanto", "assim", "consequentemente" para melhorar a argumentação');
    }

    // Verificar se há argumentação sólida
    const frasesArgumentativas = texto.split(/[.!?]+/).filter(frase => 
      frase.trim().length > 20 && 
      (frase.includes('porque') || frase.includes('devido') || frase.includes('em virtude'))
    );

    if (frasesArgumentativas.length < 2) {
      problemas.push('Poucos argumentos fundamentados');
      sugestoes.push('Desenvolva mais argumentos com justificativas claras');
    }

    return {
      presente: conectivosCriticos.length > 0,
      nivel,
      problemas: problemas.length > 0 ? problemas : undefined,
      sugestoes
    };
  }

  // Verificação de coerência
  private verificarCoerencia(texto: string) {
    const problemas: string[] = [];
    const sugestoes: string[] = [];

    // Verificar repetição de ideias
    const frases = texto.split(/[.!?]+/).filter(f => f.trim().length > 10);
    const ideiasRepetidas = this.detectarIdeiasRepetidas(frases);

    if (ideiasRepetidas.length > 0) {
      problemas.push('Repetição de ideias');
      sugestoes.push('Evite repetir as mesmas ideias, desenvolva novos argumentos');
    }

    // Verificar contradições
    const contradicoes = this.detectarContradicoes(texto);
    if (contradicoes.length > 0) {
      problemas.push('Contradições no texto');
      sugestoes.push('Revise o texto para eliminar contradições');
    }

    return {
      logica: problemas.length === 0,
      problemas: problemas.length > 0 ? problemas : undefined,
      sugestoes
    };
  }

  // Detectar ideias repetidas
  private detectarIdeiasRepetidas(frases: string[]): string[] {
    const ideias: string[] = [];
    
    for (let i = 0; i < frases.length; i++) {
      for (let j = i + 1; j < frases.length; j++) {
        const similaridade = this.calcularSimilaridade(frases[i], frases[j]);
        if (similaridade > 0.7) {
          ideias.push(`Frase ${i + 1} e ${j + 1} são muito similares`);
        }
      }
    }
    
    return ideias;
  }

  // Calcular similaridade entre frases
  private calcularSimilaridade(frase1: string, frase2: string): number {
    const palavras1 = frase1.toLowerCase().split(/\s+/);
    const palavras2 = frase2.toLowerCase().split(/\s+/);
    
    const palavrasComuns = palavras1.filter(palavra => 
      palavras2.includes(palavra) && palavra.length > 3
    );
    
    return palavrasComuns.length / Math.max(palavras1.length, palavras2.length);
  }

  // Detectar contradições
  private detectarContradicoes(texto: string): string[] {
    const contradicoes: string[] = [];
    
    // Verificar contradições comuns
    const paresContraditorios = [
      ['sempre', 'nunca'],
      ['todos', 'ninguém'],
      ['sempre', 'às vezes'],
      ['nunca', 'sempre']
    ];
    
    paresContraditorios.forEach(([palavra1, palavra2]) => {
      if (texto.toLowerCase().includes(palavra1) && texto.toLowerCase().includes(palavra2)) {
        contradicoes.push(`Contradição entre "${palavra1}" e "${palavra2}"`);
      }
    });
    
    return contradicoes;
  }

  // Avaliação da qualidade geral
  private avaliarQualidadeGeral(
    texto: string, 
    fidelidadeTema: any, 
    conhecimentosAreas: any, 
    abordagemCritica: any
  ): {
    nivel: 'excelente' | 'bom' | 'regular' | 'ruim' | 'muito_ruim';
    justificativa: string;
  } {
    let pontuacao = 0;
    
    // Fidelidade ao tema
    if (fidelidadeTema.abordagem === 'adequada') pontuacao += 3;
    else if (fidelidadeTema.abordagem === 'parcial') pontuacao += 2;
    else pontuacao += 0;
    
    // Conhecimentos de áreas
    if (conhecimentosAreas.areas.length >= 3) pontuacao += 3;
    else if (conhecimentosAreas.areas.length >= 2) pontuacao += 2;
    else if (conhecimentosAreas.areas.length >= 1) pontuacao += 1;
    
    // Abordagem crítica
    if (abordagemCritica.nivel === 'excelente') pontuacao += 3;
    else if (abordagemCritica.nivel === 'bom') pontuacao += 2;
    else if (abordagemCritica.nivel === 'regular') pontuacao += 1;
    
    let nivel: 'excelente' | 'bom' | 'regular' | 'ruim' | 'muito_ruim';
    let justificativa: string;
    
    if (pontuacao >= 8) {
      nivel = 'excelente';
      justificativa = 'Excelente compreensão da proposta com aplicação adequada de conhecimentos e abordagem crítica.';
    } else if (pontuacao >= 6) {
      nivel = 'bom';
      justificativa = 'Boa compreensão da proposta com aplicação satisfatória de conhecimentos.';
    } else if (pontuacao >= 4) {
      nivel = 'regular';
      justificativa = 'Compreensão parcial da proposta com aplicação limitada de conhecimentos.';
    } else if (pontuacao >= 2) {
      nivel = 'ruim';
      justificativa = 'Compreensão insuficiente da proposta com pouca aplicação de conhecimentos.';
    } else {
      nivel = 'muito_ruim';
      justificativa = 'Compreensão muito insuficiente da proposta sem aplicação adequada de conhecimentos.';
    }
    
    return { nivel, justificativa };
  }

  // Cálculo da nota para Competência 2 - SISTEMA REALISTA DO ENEM
  calcularNota(analise: AnaliseC2): number {
    let nota = 0;
    
    // Fidelidade ao tema (0-60 pontos)
    if (analise.fidelidadeTema.abordagem === 'adequada') {
      nota += 60;
    } else if (analise.fidelidadeTema.abordagem === 'parcial') {
      nota += 40;
    } else {
      nota += 20;
    }
    
    // Conhecimentos de áreas (0-50 pontos)
    if (analise.conhecimentosAreas.areas.length >= 3) {
      nota += 50;
    } else if (analise.conhecimentosAreas.areas.length >= 2) {
      nota += 35;
    } else if (analise.conhecimentosAreas.areas.length >= 1) {
      nota += 20;
    }
    
    // Abordagem crítica (0-50 pontos)
    switch (analise.abordagemCritica.nivel) {
      case 'excelente':
        nota += 50;
        break;
      case 'bom':
        nota += 40;
        break;
      case 'regular':
        nota += 25;
        break;
      case 'ruim':
        nota += 10;
        break;
      case 'ausente':
        nota += 0;
        break;
    }
    
    // Coerência (0-40 pontos)
    if (analise.coerencia.logica) {
      nota += 40;
    } else {
      nota += 20;
    }
    
    // Penalização por problemas
    const totalProblemas = (analise.fidelidadeTema.tangenciamento ? 1 : 0) +
                          (!analise.fidelidadeTema.desenvolvimento ? 1 : 0) +
                          (analise.conhecimentosAreas.problemas?.length || 0) +
                          (analise.abordagemCritica.problemas?.length || 0) +
                          (analise.coerencia.problemas?.length || 0);

    if (totalProblemas > 3) {
      nota = Math.max(0, nota - 40);
      console.log(`⚠️ PENALIZAÇÃO APLICADA: ${totalProblemas} problemas encontrados (>3) = -40 pontos na Competência 2`);
    }
    
    const notaFinal = Math.min(200, Math.max(0, nota));
    
    console.log(`📊 COMPETÊNCIA 2 - Nota: ${notaFinal}/200`);
    console.log(`   - Fidelidade ao tema: ${analise.fidelidadeTema.abordagem}`);
    console.log(`   - Conhecimentos aplicados: ${analise.conhecimentosAreas.areas.length} áreas`);
    console.log(`   - Abordagem crítica: ${analise.abordagemCritica.nivel}`);
    
    return notaFinal;
  }

  // Geração de feedback para Competência 2
  gerarFeedback(analise: AnaliseC2, nota: number): {
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

  private gerarJustificativa(analise: AnaliseC2, nota: number): string {
    if (nota >= 160) {
      return 'Excelente compreensão da proposta com aplicação adequada de conhecimentos de diferentes áreas e abordagem crítica consistente.';
    } else if (nota >= 120) {
      return 'Boa compreensão da proposta com aplicação satisfatória de conhecimentos e argumentação adequada.';
    } else if (nota >= 80) {
      return 'Compreensão parcial da proposta com aplicação limitada de conhecimentos e argumentação básica.';
    } else if (nota >= 40) {
      return 'Compreensão insuficiente da proposta com pouca aplicação de conhecimentos e argumentação frágil.';
    } else {
      return 'Compreensão muito insuficiente da proposta sem aplicação adequada de conhecimentos e argumentação inadequada.';
    }
  }

  private identificarPontosFortes(analise: AnaliseC2): string[] {
    const pontos: string[] = [];

    if (analise.fidelidadeTema.abordagem === 'adequada') {
      pontos.push('Abordagem adequada do tema proposto');
    }

    if (analise.conhecimentosAreas.areas.length >= 2) {
      pontos.push(`Aplicação de conhecimentos de ${analise.conhecimentosAreas.areas.length} áreas diferentes`);
    }

    if (analise.abordagemCritica.nivel === 'excelente' || analise.abordagemCritica.nivel === 'bom') {
      pontos.push('Boa abordagem crítica e argumentativa');
    }

    if (analise.coerencia.logica) {
      pontos.push('Texto coerente e bem estruturado');
    }

    return pontos;
  }

  private identificarPontosFracos(analise: AnaliseC2): string[] {
    const pontos: string[] = [];

    if (analise.fidelidadeTema.tangenciamento) {
      pontos.push('Tangenciamento do tema proposto');
    }

    if (!analise.fidelidadeTema.desenvolvimento) {
      pontos.push('Desenvolvimento insuficiente do tema');
    }

    if (analise.conhecimentosAreas.areas.length < 2) {
      pontos.push('Poucos conhecimentos de diferentes áreas aplicados');
    }

    if (analise.abordagemCritica.nivel === 'ruim' || analise.abordagemCritica.nivel === 'ausente') {
      pontos.push('Falta de abordagem crítica e argumentativa');
    }

    if (!analise.coerencia.logica) {
      pontos.push('Problemas de coerência no texto');
    }

    return pontos;
  }

  private gerarSugestoes(analise: AnaliseC2): string[] {
    const sugestoes: string[] = [];

    if (analise.fidelidadeTema.tangenciamento) {
      sugestoes.push('Mantenha o foco no tema proposto, evitando tangenciamentos');
    }

    if (!analise.fidelidadeTema.desenvolvimento) {
      sugestoes.push('Desenvolva melhor o tema em cada parágrafo');
    }

    if (analise.conhecimentosAreas.areas.length < 2) {
      sugestoes.push('Aplique conhecimentos de diferentes áreas (sociologia, filosofia, história, etc.)');
    }

    if (analise.abordagemCritica.nivel === 'ruim' || analise.abordagemCritica.nivel === 'ausente') {
      sugestoes.push('Desenvolva uma argumentação mais crítica e fundamentada');
    }

    if (!analise.coerencia.logica) {
      sugestoes.push('Revise o texto para melhorar a coerência e evitar contradições');
    }

    return sugestoes;
  }
}