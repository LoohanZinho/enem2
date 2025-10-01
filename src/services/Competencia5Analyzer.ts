// Analisador da Competência 5 - Elaboração de proposta de intervenção
// C5: Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos

export interface PropostaIntervencao {
  texto: string;
  clareza: number; // 0-100
  especificidade: number; // 0-100
  viabilidade: number; // 0-100
  agentes: string[];
  meios: string[];
  finalidade: string;
  detalhamento: number; // 0-100
}

export interface AnaliseC5 {
  proposta: PropostaIntervencao;
  direitosHumanos: {
    respeitados: boolean;
    violacoes: string[];
    sugestoes: string[];
    problemas?: string[];
  };
  estrutura: {
    clareza: number; // 0-100
    especificidade: number; // 0-100
    viabilidade: number; // 0-100
    detalhamento: number; // 0-100
    problemas?: string[];
  };
  agentes: {
    identificados: string[];
    adequados: boolean;
    diversidade: number; // 0-100
    problemas?: string[];
  };
  meios: {
    identificados: string[];
    adequados: boolean;
    diversidade: number; // 0-100
    problemas?: string[];
  };
  finalidade: {
    clara: boolean;
    especifica: boolean;
    relevante: boolean;
    problemas?: string[];
  };
}

export class Competencia5Analyzer {
  // Agentes de intervenção comuns
  private agentesComuns = [
    'governo', 'estado', 'município', 'prefeitura', 'ministério',
    'secretaria', 'órgão', 'instituição', 'organização', 'sociedade',
    'cidadãos', 'comunidade', 'família', 'escola', 'universidade',
    'empresas', 'setor privado', 'ong', 'associação', 'coletivo'
  ];

  // Meios de intervenção comuns
  private meiosComuns = [
    'política pública', 'lei', 'decreto', 'portaria', 'resolução',
    'programa', 'projeto', 'campanha', 'educação', 'conscientização',
    'fiscalização', 'monitoramento', 'investimento', 'recursos',
    'infraestrutura', 'tecnologia', 'capacitação', 'treinamento',
    'parceria', 'colaboração', 'cooperação', 'articulação'
  ];

  // Direitos humanos fundamentais
  private direitosHumanos = [
    'dignidade', 'igualdade', 'liberdade', 'justiça', 'solidariedade',
    'cidadania', 'democracia', 'participação', 'acesso', 'inclusão',
    'diversidade', 'tolerância', 'respeito', 'não discriminação',
    'saúde', 'educação', 'trabalho', 'moradia', 'alimentação',
    'segurança', 'meio ambiente', 'cultura', 'lazer'
  ];

  // Palavras que indicam proposta
  private indicadoresProposta = [
    'necessário', 'importante', 'fundamental', 'essencial', 'crucial',
    'deve', 'precisa', 'requer', 'exige', 'demanda',
    'solução', 'medida', 'ação', 'iniciativa', 'estratégia',
    'proposta', 'sugestão', 'recomendação', 'orientação'
  ];

  // Análise principal da Competência 5
  analisar(texto: string): AnaliseC5 {
    const proposta = this.extrairPropostaIntervencao(texto);
    const direitosHumanos = this.verificarDireitosHumanos(proposta);
    const estrutura = this.verificarEstrutura(proposta);
    const agentes = this.verificarAgentes(proposta);
    const meios = this.verificarMeios(proposta);
    const finalidade = this.verificarFinalidade(proposta);

    return {
      proposta,
      direitosHumanos,
      estrutura,
      agentes,
      meios,
      finalidade
    };
  }

  // Extração da proposta de intervenção
  private extrairPropostaIntervencao(texto: string): PropostaIntervencao {
    // Buscar por parágrafos que contenham propostas
    const paragrafos = texto.split(/\n\s*\n/);
    let propostaTexto = '';

    // Procurar por parágrafos que contenham indicadores de proposta
    paragrafos.forEach(paragrafo => {
      const temIndicador = this.indicadoresProposta.some(indicador => 
        paragrafo.toLowerCase().includes(indicador)
      );
      if (temIndicador && paragrafo.trim().length > 50) {
        propostaTexto += paragrafo + ' ';
      }
    });

    // Se não encontrou, usar o último parágrafo
    if (!propostaTexto.trim()) {
      propostaTexto = paragrafos[paragrafos.length - 1] || '';
    }

    const clareza = this.calcularClareza(propostaTexto);
    const especificidade = this.calcularEspecificidade(propostaTexto);
    const viabilidade = this.calcularViabilidade(propostaTexto);
    const agentes = this.extrairAgentes(propostaTexto);
    const meios = this.extrairMeios(propostaTexto);
    const finalidade = this.extrairFinalidade(propostaTexto);
    const detalhamento = this.calcularDetalhamento(propostaTexto);

    return {
      texto: propostaTexto.trim(),
      clareza,
      especificidade,
      viabilidade,
      agentes,
      meios,
      finalidade,
      detalhamento
    };
  }

  // Verificação de direitos humanos
  private verificarDireitosHumanos(proposta: PropostaIntervencao): AnaliseC5['direitosHumanos'] {
    const violacoes: string[] = [];
    const sugestoes: string[] = [];
    const texto = proposta.texto.toLowerCase();

    // Verificar se há violações de direitos humanos
    const violacoesComuns = [
      'discriminação', 'preconceito', 'exclusão', 'marginalização',
      'violência', 'repressão', 'censura', 'opressão'
    ];

    violacoesComuns.forEach(violacao => {
      if (texto.includes(violacao)) {
        violacoes.push(`Possível violação: ${violacao}`);
      }
    });

    // Verificar se há respeito aos direitos humanos
    const direitosPresentes = this.direitosHumanos.filter(direito => 
      texto.includes(direito)
    );

    const respeitados = violacoes.length === 0 && direitosPresentes.length > 0;

    if (!respeitados) {
      sugestoes.push('Garanta que a proposta respeite os direitos humanos');
    }

    return {
      respeitados,
      violacoes,
      sugestoes
    };
  }

  // Verificação da estrutura da proposta
  private verificarEstrutura(proposta: PropostaIntervencao): AnaliseC5['estrutura'] {
    return {
      clareza: proposta.clareza,
      especificidade: proposta.especificidade,
      viabilidade: proposta.viabilidade,
      detalhamento: proposta.detalhamento
    };
  }

  // Verificação dos agentes
  private verificarAgentes(proposta: PropostaIntervencao): AnaliseC5['agentes'] {
    const agentes = proposta.agentes;
    const adequados = agentes.length > 0;
    const diversidade = Math.min(100, agentes.length * 20);

    return {
      identificados: agentes,
      adequados,
      diversidade
    };
  }

  // Verificação dos meios
  private verificarMeios(proposta: PropostaIntervencao): AnaliseC5['meios'] {
    const meios = proposta.meios;
    const adequados = meios.length > 0;
    const diversidade = Math.min(100, meios.length * 20);

    return {
      identificados: meios,
      adequados,
      diversidade
    };
  }

  // Verificação da finalidade
  private verificarFinalidade(proposta: PropostaIntervencao): AnaliseC5['finalidade'] {
    const finalidade = proposta.finalidade;
    const clara = finalidade.length > 10;
    const especifica = finalidade.length > 20;
    const relevante = this.verificarRelevanciaFinalidade(finalidade);

    return {
      clara,
      especifica,
      relevante
    };
  }

  // Métodos auxiliares
  private calcularClareza(texto: string): number {
    let clareza = 0;

    // Verificar presença de conectivos clarificadores
    const conectivosClarificadores = [
      'portanto', 'assim', 'dessa forma', 'desse modo', 'logo',
      'consequentemente', 'por isso', 'por conseguinte'
    ];

    conectivosClarificadores.forEach(conectivo => {
      if (texto.toLowerCase().includes(conectivo)) {
        clareza += 20;
      }
    });

    // Verificar estrutura de frases
    const frases = texto.split(/[.!?]+/);
    const frasesClaras = frases.filter(frase => {
      const palavras = frase.trim().split(/\s+/);
      return palavras.length >= 5 && palavras.length <= 25;
    });

    clareza += (frasesClaras.length / frases.length) * 40;

    // Verificar presença de exemplos
    if (/\bexemplo\b|\bcomo\b|\btal como\b/i.test(texto)) {
      clareza += 20;
    }

    return Math.min(100, clareza);
  }

  private calcularEspecificidade(texto: string): number {
    let especificidade = 0;

    // Verificar presença de dados específicos
    if (/\d+%|\d+,\d+|\d+\.\d+/.test(texto)) {
      especificidade += 30;
    }

    // Verificar presença de prazos
    if (/\bem\s+\d+\s+(dias|meses|anos)\b|\bno\s+prazo\b|\bem\s+curto\s+prazo\b/i.test(texto)) {
      especificidade += 25;
    }

    // Verificar presença de valores ou recursos
    if (/\bR\$\s*\d+|\bmilhões\b|\bmilhares\b|\brecursos\b|\binvestimento\b/i.test(texto)) {
      especificidade += 20;
    }

    // Verificar presença de locais específicos
    if (/\bno\s+(Brasil|país|estado|município|região)\b/i.test(texto)) {
      especificidade += 15;
    }

    // Verificar presença de exemplos concretos
    if (/\bexemplo\b|\bcomo\b|\btal como\b/i.test(texto)) {
      especificidade += 10;
    }

    return Math.min(100, especificidade);
  }

  private calcularViabilidade(texto: string): number {
    let viabilidade = 0;

    // Verificar presença de agentes viáveis
    const agentesViáveis = this.agentesComuns.filter(agente => 
      texto.toLowerCase().includes(agente)
    );
    viabilidade += agentesViáveis.length * 15;

    // Verificar presença de meios viáveis
    const meiosViáveis = this.meiosComuns.filter(meio => 
      texto.toLowerCase().includes(meio)
    );
    viabilidade += meiosViáveis.length * 15;

    // Verificar presença de prazos realistas
    if (/\bem\s+\d+\s+(dias|meses|anos)\b/i.test(texto)) {
      viabilidade += 20;
    }

    // Verificar presença de recursos
    if (/\brecursos\b|\binvestimento\b|\bfinanciamento\b/i.test(texto)) {
      viabilidade += 15;
    }

    // Verificar presença de parcerias
    if (/\bparceria\b|\bcolaboração\b|\bcooperação\b/i.test(texto)) {
      viabilidade += 15;
    }

    return Math.min(100, viabilidade);
  }

  private extrairAgentes(texto: string): string[] {
    const agentes: string[] = [];
    const textoLower = texto.toLowerCase();

    this.agentesComuns.forEach(agente => {
      if (textoLower.includes(agente)) {
        agentes.push(agente);
      }
    });

    return agentes;
  }

  private extrairMeios(texto: string): string[] {
    const meios: string[] = [];
    const textoLower = texto.toLowerCase();

    this.meiosComuns.forEach(meio => {
      if (textoLower.includes(meio)) {
        meios.push(meio);
      }
    });

    return meios;
  }

  private extrairFinalidade(texto: string): string {
    // Buscar por frases que indiquem finalidade
    const padroesFinalidade = [
      /para\s+([^.!?]+)/gi,
      /com\s+o\s+objetivo\s+de\s+([^.!?]+)/gi,
      /visando\s+([^.!?]+)/gi,
      /a\s+fim\s+de\s+([^.!?]+)/gi
    ];

    for (const padrao of padroesFinalidade) {
      const match = texto.match(padrao);
      if (match) {
        return match[0].trim();
      }
    }

    // Se não encontrou, usar a última frase
    const frases = texto.split(/[.!?]+/);
    return frases[frases.length - 1]?.trim() || '';
  }

  private calcularDetalhamento(texto: string): number {
    let detalhamento = 0;

    // Verificar presença de exemplos
    if (/\bexemplo\b|\bcomo\b|\btal como\b/i.test(texto)) {
      detalhamento += 25;
    }

    // Verificar presença de dados
    if (/\d+%|\d+,\d+|\d+\.\d+/.test(texto)) {
      detalhamento += 20;
    }

    // Verificar presença de prazos
    if (/\bem\s+\d+\s+(dias|meses|anos)\b/i.test(texto)) {
      detalhamento += 20;
    }

    // Verificar presença de valores
    if (/\bR\$\s*\d+|\bmilhões\b|\bmilhares\b/i.test(texto)) {
      detalhamento += 15;
    }

    // Verificar presença de locais
    if (/\bno\s+(Brasil|país|estado|município|região)\b/i.test(texto)) {
      detalhamento += 10;
    }

    // Verificar tamanho do texto
    const palavras = texto.split(/\s+/).length;
    if (palavras > 100) detalhamento += 10;

    return Math.min(100, detalhamento);
  }

  private verificarRelevanciaFinalidade(finalidade: string): boolean {
    const palavrasRelevantes = [
      'problema', 'solução', 'melhoria', 'desenvolvimento', 'progresso',
      'bem-estar', 'qualidade', 'acesso', 'inclusão', 'democracia'
    ];

    return palavrasRelevantes.some(palavra => 
      finalidade.toLowerCase().includes(palavra)
    );
  }

  // Cálculo da nota para Competência 5
  calcularNota(analise: AnaliseC5): number {
    let nota = 0;

    // Estrutura da proposta (40% da nota)
    nota += (analise.estrutura.clareza / 100) * 20;
    nota += (analise.estrutura.especificidade / 100) * 20;
    nota += (analise.estrutura.viabilidade / 100) * 20;
    nota += (analise.estrutura.detalhamento / 100) * 20;

    // Agentes (20% da nota)
    if (analise.agentes.adequados) nota += 20;
    nota += (analise.agentes.diversidade / 100) * 20;

    // Meios (20% da nota)
    if (analise.meios.adequados) nota += 20;
    nota += (analise.meios.diversidade / 100) * 20;

    // Finalidade (10% da nota)
    if (analise.finalidade.clara) nota += 5;
    if (analise.finalidade.especifica) nota += 5;
    if (analise.finalidade.relevante) nota += 10;

    // Direitos humanos (10% da nota)
    if (analise.direitosHumanos.respeitados) nota += 20;

    // Contar total de problemas
    const totalProblemas = (analise.estrutura.problemas?.length || 0) +
                          (analise.agentes.problemas?.length || 0) +
                          (analise.meios.problemas?.length || 0) +
                          (analise.finalidade.problemas?.length || 0) +
                          (analise.direitosHumanos.problemas?.length || 0);

    // Penalização por mais de 3 erros: -40 pontos
    if (totalProblemas > 3) {
      nota = Math.max(0, nota - 40);
      console.log(`⚠️ PENALIZAÇÃO APLICADA: ${totalProblemas} problemas encontrados (>3) = -40 pontos na Competência 5`);
    }

    // Penalizações
    if (!analise.direitosHumanos.respeitados) {
      nota = Math.max(0, nota - 50);
    }

    if (!analise.agentes.adequados) {
      nota = Math.max(0, nota - 30);
    }

    if (!analise.meios.adequados) {
      nota = Math.max(0, nota - 30);
    }

    return Math.min(200, Math.max(0, nota));
  }

  // Geração de feedback para Competência 5
  gerarFeedback(analise: AnaliseC5, nota: number): {
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

  private gerarJustificativa(analise: AnaliseC5, nota: number): string {
    if (nota >= 180) {
      return 'Excelente proposta de intervenção. Clara, específica, viável, bem detalhada, com agentes e meios adequados, respeitando os direitos humanos.';
    } else if (nota >= 140) {
      return 'Boa proposta de intervenção. Clara e específica, com agentes e meios adequados, respeitando os direitos humanos.';
    } else if (nota >= 100) {
      return 'Proposta de intervenção regular. Alguns elementos presentes, mas com limitações na clareza, especificidade ou viabilidade.';
    } else if (nota >= 60) {
      return 'Proposta de intervenção insuficiente. Poucos elementos presentes, com limitações significativas na estrutura e viabilidade.';
    } else {
      return 'Proposta de intervenção muito insuficiente. Ausência de elementos essenciais ou violação dos direitos humanos.';
    }
  }

  private identificarPontosFortes(analise: AnaliseC5): string[] {
    const pontos: string[] = [];

    if (analise.estrutura.clareza >= 80) {
      pontos.push('Proposta clara e bem estruturada');
    }

    if (analise.estrutura.especificidade >= 80) {
      pontos.push('Proposta específica e detalhada');
    }

    if (analise.agentes.adequados && analise.agentes.diversidade >= 60) {
      pontos.push('Agentes adequados e diversos');
    }

    if (analise.meios.adequados && analise.meios.diversidade >= 60) {
      pontos.push('Meios adequados e diversos');
    }

    if (analise.direitosHumanos.respeitados) {
      pontos.push('Respeito aos direitos humanos');
    }

    return pontos;
  }

  private identificarPontosFracos(analise: AnaliseC5): string[] {
    const pontos: string[] = [];

    if (analise.estrutura.clareza < 60) {
      pontos.push('Proposta pouco clara');
    }

    if (analise.estrutura.especificidade < 60) {
      pontos.push('Proposta pouco específica');
    }

    if (!analise.agentes.adequados) {
      pontos.push('Agentes não identificados ou inadequados');
    }

    if (!analise.meios.adequados) {
      pontos.push('Meios não identificados ou inadequados');
    }

    if (!analise.direitosHumanos.respeitados) {
      pontos.push('Violação dos direitos humanos');
    }

    if (analise.estrutura.viabilidade < 60) {
      pontos.push('Proposta pouco viável');
    }

    return pontos;
  }

  private gerarSugestoes(analise: AnaliseC5): string[] {
    const sugestoes: string[] = [];

    if (analise.estrutura.clareza < 60) {
      sugestoes.push('Torne a proposta mais clara e objetiva');
    }

    if (analise.estrutura.especificidade < 60) {
      sugestoes.push('Detalhe mais a proposta com dados, prazos e recursos');
    }

    if (!analise.agentes.adequados) {
      sugestoes.push('Identifique claramente os agentes responsáveis pela implementação');
    }

    if (!analise.meios.adequados) {
      sugestoes.push('Especifique os meios e recursos necessários');
    }

    if (!analise.direitosHumanos.respeitados) {
      sugestoes.push('Garanta que a proposta respeite os direitos humanos');
    }

    if (analise.estrutura.viabilidade < 60) {
      sugestoes.push('Torne a proposta mais viável e realista');
    }

    if (analise.estrutura.detalhamento < 60) {
      sugestoes.push('Detalhe mais a proposta com exemplos e casos concretos');
    }

    return sugestoes;
  }
}
