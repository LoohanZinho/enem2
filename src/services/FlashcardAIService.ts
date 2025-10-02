// Serviço de IA para geração inteligente de flashcards
export interface Concept {
  text: string;
  type: 'definição' | 'fórmula' | 'característica' | 'função' | 'classificação' | 'conceito';
  importance: number;
}

export interface AnalysisResult {
  subject: string;
  module: string;
  concepts: Concept[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
}

export interface FlashcardData {
  id: string;
  front: string;
  back: string;
  subject: string;
  module: string;
  subModule: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  createdAt: Date;
  lastReviewed: Date | null;
  reviewCount: number;
  correctCount: number;
  nextReview: Date | null;
  interval: number;
  easeFactor: number;
  isNew: boolean;
  streak: number;
}

class FlashcardAIService {
  // Análise inteligente do texto
  async analyzeText(text: string): Promise<AnalysisResult> {
    // Detectar matéria e módulo
    const subject = this.detectSubjectIntelligently(text);
    const module = this.detectModuleIntelligently(text, subject);
    
    // Extrair conceitos principais
    const concepts = this.extractKeyConcepts(text);
    
    return {
      subject,
      module,
      concepts,
      difficulty: this.assessDifficulty(text),
      estimatedTime: this.estimateStudyTime(text)
    };
  }

  // Gerar flashcards a partir da análise
  async generateFlashcards(text: string): Promise<Omit<FlashcardData, 'incorrectCount' | 'quality' | 'isActive'>[]> {
    const analysis = await this.analyzeText(text);
    const flashcards: Omit<FlashcardData, 'incorrectCount' | 'quality' | 'isActive'>[] = [];
    
    analysis.concepts.forEach((concept, index) => {
      const flashcard = this.createIntelligentFlashcard(concept, analysis.subject, analysis.module, index);
      flashcards.push(flashcard);
    });
    
    return flashcards;
  }

  // Detecção inteligente de matéria
  private detectSubjectIntelligently(text: string): string {
    const lowerText = text.toLowerCase();
    
    const subjectPatterns = {
      'Matemática': {
        keywords: ['matemática', 'matematica', 'álgebra', 'algebra', 'geometria', 'trigonométrica', 'trigonometrica', 'função', 'funcao', 'equação', 'equacao', 'fórmula', 'formula', 'cálculo', 'calculo', 'derivada', 'integral', 'limite', 'matriz', 'determinante', 'vetor', 'plano cartesiano', 'coordenadas'],
        weight: 0
      },
      'Física': {
        keywords: ['física', 'fisica', 'mecânica', 'mecanica', 'energia', 'força', 'forca', 'velocidade', 'aceleração', 'aceleracao', 'newton', 'eletricidade', 'magnetismo', 'óptica', 'optica', 'termodinâmica', 'termodinamica', 'ondas', 'frequência', 'frequencia', 'amplitude', 'refração', 'reflexão', 'reflexao'],
        weight: 0
      },
      'Química': {
        keywords: ['química', 'quimica', 'átomo', 'atomo', 'molécula', 'molecula', 'reação', 'reacao', 'ácido', 'acido', 'base', 'solução', 'solucao', 'composto', 'elemento', 'tabela periódica', 'tabela periodica', 'ligação', 'ligacao', 'íon', 'ion', 'ph', 'concentração', 'concentracao', 'molaridade'],
        weight: 0
      },
      'Biologia': {
        keywords: ['biologia', 'célula', 'celula', 'organela', 'mitocôndria', 'mitocondria', 'núcleo', 'nucleo', 'dna', 'rna', 'proteína', 'proteina', 'enzima', 'metabolismo', 'fotossíntese', 'fotossintese', 'respiração', 'respiração', 'evolução', 'evolucao', 'genética', 'genetica', 'ecossistema', 'bioma'],
        weight: 0
      },
      'História': {
        keywords: ['história', 'historia', 'brasil', 'independência', 'independencia', 'revolução', 'revolucao', 'guerra', 'império', 'imperio', 'república', 'republica', 'colônia', 'colonia', 'escravidão', 'escravidao', 'abolição', 'abolicao', 'revolução industrial', 'revolucao industrial', 'primeira guerra', 'segunda guerra'],
        weight: 0
      },
      'Geografia': {
        keywords: ['geografia', 'clima', 'relevo', 'vegetação', 'vegetacao', 'hidrografia', 'bioma', 'amazônia', 'amazonia', 'cerrado', 'caatinga', 'mata atlântica', 'mata atlantica', 'pantanal', 'pampa', 'urbanização', 'urbanizacao', 'população', 'populacao', 'demografia', 'migração', 'migracao'],
        weight: 0
      },
      'Português': {
        keywords: ['português', 'portugues', 'literatura', 'gramática', 'gramatica', 'sintaxe', 'morfologia', 'figura', 'linguagem', 'metáfora', 'metafora', 'metonímia', 'metonimia', 'comparação', 'comparacao', 'personificação', 'personificacao', 'poesia', 'prosa', 'romance', 'conto', 'crônica', 'cronica'],
        weight: 0
      }
    };

    // Calcular peso para cada matéria
    Object.entries(subjectPatterns).forEach(([subject, data]) => {
      data.keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          data.weight += 1;
        }
      });
    });

    // Retornar matéria com maior peso
    const sortedSubjects = Object.entries(subjectPatterns)
      .sort(([,a], [,b]) => b.weight - a.weight);
    
    return sortedSubjects[0][0];
  }

  // Detecção inteligente de módulo
  private detectModuleIntelligently(text: string, subject: string): string {
    const lowerText = text.toLowerCase();
    
    const modulePatterns = {
      'Matemática': {
        'Álgebra': ['álgebra', 'algebra', 'equação', 'equacao', 'função', 'funcao', 'polinômio', 'polinomio', 'fatoração', 'fatoracao', 'bhaskara', 'discriminante'],
        'Geometria': ['geometria', 'área', 'area', 'volume', 'perímetro', 'perimetro', 'triângulo', 'triangulo', 'círculo', 'circulo', 'retângulo', 'retangulo', 'quadrado'],
        'Trigonometria': ['trigonométrica', 'trigonometrica', 'seno', 'cosseno', 'tangente', 'ângulo', 'angulo', 'radiano', 'grau'],
        'Estatística': ['estatística', 'estatistica', 'média', 'media', 'mediana', 'moda', 'desvio', 'padrão', 'padrao', 'probabilidade']
      },
      'Física': {
        'Mecânica': ['mecânica', 'mecanica', 'newton', 'força', 'forca', 'aceleração', 'aceleracao', 'velocidade', 'movimento', 'energia cinética', 'energia cinetica'],
        'Eletricidade': ['eletricidade', 'corrente', 'voltagem', 'resistência', 'resistencia', 'circuito', 'ampère', 'ampere', 'volt', 'ohm'],
        'Óptica': ['óptica', 'optica', 'luz', 'refração', 'reflexão', 'reflexao', 'lente', 'espelho', 'prisma'],
        'Termodinâmica': ['termodinâmica', 'termodinamica', 'calor', 'temperatura', 'entropia', 'energia térmica', 'energia termica']
      },
      'Química': {
        'Química Geral': ['química geral', 'quimica geral', 'átomo', 'atomo', 'molécula', 'molecula', 'elemento', 'composto', 'tabela periódica', 'tabela periodica'],
        'Química Orgânica': ['orgânica', 'organica', 'carbono', 'hidrocarboneto', 'álcool', 'alcool', 'ácido carboxílico', 'acido carboxilico', 'éster', 'ester'],
        'Química Inorgânica': ['inorgânica', 'inorganica', 'ácido', 'acido', 'base', 'sal', 'óxido', 'oxido', 'hidróxido', 'hidroxido']
      },
      'Biologia': {
        'Citologia': ['célula', 'celula', 'organela', 'mitocôndria', 'mitocondria', 'núcleo', 'nucleo', 'ribossomo', 'retículo', 'reticulo'],
        'Genética': ['genética', 'genetica', 'dna', 'rna', 'cromossomo', 'gene', 'hereditariedade', 'mutação', 'mutacao'],
        'Ecologia': ['ecologia', 'ecossistema', 'bioma', 'cadeia alimentar', 'biodiversidade', 'sustentabilidade']
      },
      'História': {
        'História do Brasil': ['brasil', 'independência', 'independencia', 'colônia', 'colonia', 'império', 'imperio', 'república', 'republica', 'escravidão', 'escravidao'],
        'História Geral': ['mundial', 'guerra', 'revolução', 'revolucao', 'renascimento', 'iluminismo', 'revolução francesa', 'revolucao francesa']
      },
      'Geografia': {
        'Geografia Física': ['física', 'fisica', 'clima', 'relevo', 'vegetação', 'vegetacao', 'hidrografia', 'bioma', 'amazônia', 'amazonia'],
        'Geografia Humana': ['humana', 'população', 'populacao', 'urbanização', 'urbanizacao', 'demografia', 'migração', 'migracao', 'economia']
      },
      'Português': {
        'Literatura': ['literatura', 'figura', 'linguagem', 'metáfora', 'metafora', 'metonímia', 'metonimia', 'poesia', 'prosa', 'romance'],
        'Gramática': ['gramática', 'gramatica', 'sintaxe', 'morfologia', 'substantivo', 'adjetivo', 'verbo', 'advérbio', 'adverbio']
      }
    };

    const subjectModules = modulePatterns[subject as keyof typeof modulePatterns];
    if (!subjectModules) return 'Geral';

    let maxWeight = 0;
    let bestModule = 'Geral';

    Object.entries(subjectModules).forEach(([module, keywords]) => {
      const weight = keywords.filter(keyword => lowerText.includes(keyword)).length;
      if (weight > maxWeight) {
        maxWeight = weight;
        bestModule = module;
      }
    });

    return bestModule;
  }

  // Extrair conceitos principais do texto
  private extractKeyConcepts(text: string): Concept[] {
    const concepts: Concept[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed.length > 15) {
        concepts.push({
          text: trimmed,
          type: this.classifyConceptType(trimmed),
          importance: this.calculateImportance(trimmed)
        });
      }
    });
    
    // Ordenar por importância e retornar os mais relevantes
    return concepts
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 8); // Máximo 8 conceitos
  }

  // Classificar tipo de conceito
  private classifyConceptType(text: string): Concept['type'] {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('definição') || lowerText.includes('definicao') || lowerText.includes('é') || lowerText.includes('são')) {
      return 'definição';
    } else if (lowerText.includes('fórmula') || lowerText.includes('formula') || lowerText.includes('=') || lowerText.includes('calcula')) {
      return 'fórmula';
    } else if (lowerText.includes('característica') || lowerText.includes('caracteristica') || lowerText.includes('propriedade')) {
      return 'característica';
    } else if (lowerText.includes('função') || lowerText.includes('funcao') || lowerText.includes('serve para')) {
      return 'função';
    } else if (lowerText.includes('tipo') || lowerText.includes('tipos') || lowerText.includes('classificação')) {
      return 'classificação';
    } else {
      return 'conceito';
    }
  }

  // Calcular importância do conceito
  private calculateImportance(text: string): number {
    let importance = 0;
    const lowerText = text.toLowerCase();
    
    // Palavras-chave que indicam alta importância
    const highImportanceKeywords = ['importante', 'principal', 'essencial', 'fundamental', 'básico', 'basico', 'definição', 'definicao', 'fórmula', 'formula'];
    const mediumImportanceKeywords = ['característica', 'caracteristica', 'função', 'funcao', 'tipo', 'exemplo'];
    
    highImportanceKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) importance += 3;
    });
    
    mediumImportanceKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) importance += 2;
    });
    
    // Aumentar importância baseada no tamanho do texto
    if (text.length > 50) importance += 1;
    if (text.length > 100) importance += 1;
    
    return importance;
  }

  // Avaliar dificuldade do texto
  private assessDifficulty(text: string): 'easy' | 'medium' | 'hard' {
    const lowerText = text.toLowerCase();
    let difficulty = 0;
    
    // Palavras que indicam dificuldade
    const hardWords = ['complexo', 'avançado', 'avançado', 'sofisticado', 'intrincado', 'matemática', 'matematica', 'física', 'fisica', 'química', 'quimica'];
    const mediumWords = ['intermediário', 'intermediario', 'moderado', 'regular'];
    const easyWords = ['simples', 'básico', 'basico', 'fácil', 'facil', 'elementar'];
    
    hardWords.forEach(word => {
      if (lowerText.includes(word)) difficulty += 2;
    });
    
    mediumWords.forEach(word => {
      if (lowerText.includes(word)) difficulty += 1;
    });
    
    easyWords.forEach(word => {
      if (lowerText.includes(word)) difficulty -= 1;
    });
    
    if (difficulty >= 3) return 'hard';
    if (difficulty >= 1) return 'medium';
    return 'easy';
  }

  // Estimar tempo de estudo
  private estimateStudyTime(text: string): number {
    const wordCount = text.split(' ').length;
    return Math.ceil(wordCount / 50); // 50 palavras por minuto
  }

  // Criar flashcard inteligente
  private createIntelligentFlashcard(concept: Concept, subject: string, module: string, index: number): Omit<FlashcardData, 'incorrectCount' | 'quality' | 'isActive'> {
    const question = this.generateIntelligentQuestion(concept);
    const answer = concept.text;
    
    return {
      id: `ai_${Date.now()}_${index}`,
      front: question,
      back: answer,
      subject: subject,
      module: module,
      subModule: 'Gerado por IA',
      difficulty: this.assessDifficulty(concept.text),
      category: module,
      tags: this.extractTags(concept.text),
      createdAt: new Date(),
      lastReviewed: null,
      reviewCount: 0,
      correctCount: 0,
      nextReview: new Date(),
      interval: 1,
      easeFactor: 2.5,
      isNew: true,
      streak: 0
    };
  }

  // Gerar pergunta inteligente
  private generateIntelligentQuestion(concept: Concept): string {
    const text = concept.text;
    const type = concept.type;
    
    switch (type) {
      case 'definição':
        if (text.includes('é')) {
          const parts = text.split('é');
          if (parts.length > 1) {
            return `O que é ${parts[0].trim()}?`;
          }
        }
        return `Defina: ${this.extractMainTerm(text)}`;
        
      case 'fórmula':
        return `Qual é a fórmula mencionada?`;
        
      case 'característica':
        return `Quais são as características de ${this.extractMainTerm(text)}?`;
        
      case 'função':
        return `Qual é a função de ${this.extractMainTerm(text)}?`;
        
      case 'classificação':
        return `Quais são os tipos de ${this.extractMainTerm(text)}?`;
        
      default:
        return `Explique sobre ${this.extractMainTerm(text)}:`;
    }
  }

  // Extrair termo principal do texto
  private extractMainTerm(text: string): string {
    const words = text.split(' ').filter(word => word.length > 3);
    return words[0] || 'este conceito';
  }

  // Extrair tags do texto
  private extractTags(text: string): string[] {
    const words = text.split(' ')
      .filter(word => word.length > 3)
      .map(word => word.toLowerCase().replace(/[^\w]/g, ''))
      .slice(0, 3);
    
    return words;
  }
}

export default new FlashcardAIService();
