// Serviço de OCR para redações manuscritas
// Integração com Tesseract.js para reconhecimento de texto

import Tesseract, { OEM } from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  processingTime: number;
  language: string;
  errors: string[];
}

export interface OCRConfig {
  language: 'por' | 'eng' | 'spa';
  whitelist?: string;
  blacklist?: string;
  tessedit_char_whitelist?: string;
  tessedit_char_blacklist?: string;
}

export class OCRService {
  private static instance: OCRService;
  private worker: Tesseract.Worker | null = null;
  private isInitialized = false;

  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  // Inicializar o worker do Tesseract
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.worker = await Tesseract.createWorker('por', OEM.LSTM_ONLY, {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });
      
      this.isInitialized = true;
      console.log('OCR Service initialized successfully');
    } catch (error) {
      console.error('Error initializing OCR service:', error);
      throw new Error('Falha ao inicializar o serviço de OCR');
    }
  }

  // Processar imagem e extrair texto
  async processImage(imageFile: File, config?: OCRConfig): Promise<OCRResult> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      if (!this.worker || !this.isInitialized) {
        await this.initialize();
      }

      if (!this.worker) {
        throw new Error('Worker não inicializado');
      }

      // Configurar idioma se especificado
      if (config?.language && config.language !== 'por') {
        await this.worker.reinitialize(config.language);
      }

      // Configurar whitelist/blacklist de caracteres
      if (config?.tessedit_char_whitelist) {
        await this.worker.setParameters({
          tessedit_char_whitelist: config.tessedit_char_whitelist,
        });
      }

      if (config?.tessedit_char_blacklist) {
        await this.worker.setParameters({
          tessedit_char_blacklist: config.tessedit_char_blacklist,
        });
      }

      // Processar a imagem
      const { data } = await this.worker.recognize(imageFile);
      
      const processingTime = Date.now() - startTime;

      // Limpar e processar o texto extraído
      const cleanedText = this.cleanExtractedText(data.text);

      return {
        text: cleanedText,
        confidence: data.confidence,
        processingTime,
        language: config?.language || 'por',
        errors
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      errors.push(`Erro no processamento OCR: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      return {
        text: '',
        confidence: 0,
        processingTime,
        language: config?.language || 'por',
        errors
      };
    }
  }

  // Processar múltiplas imagens
  async processMultipleImages(imageFiles: File[], config?: OCRConfig): Promise<OCRResult[]> {
    const results: OCRResult[] = [];

    for (const file of imageFiles) {
      try {
        const result = await this.processImage(file, config);
        results.push(result);
      } catch (error) {
        results.push({
          text: '',
          confidence: 0,
          processingTime: 0,
          language: config?.language || 'por',
          errors: [`Erro ao processar ${file.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
        });
      }
    }

    return results;
  }

  // Limpar e processar texto extraído
  private cleanExtractedText(text: string): string {
    let cleanedText = text;

    // Remover caracteres especiais desnecessários
    cleanedText = cleanedText.replace(/[^\w\s.,!?;:()\-'"]/g, ' ');

    // Corrigir quebras de linha excessivas
    cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n');

    // Corrigir espaços excessivos
    cleanedText = cleanedText.replace(/\s{2,}/g, ' ');

    // Corrigir pontuação mal reconhecida
    cleanedText = this.correctPunctuation(cleanedText);

    // Corrigir palavras comuns mal reconhecidas
    cleanedText = this.correctCommonWords(cleanedText);

    // Remover linhas muito curtas (provavelmente ruído)
    cleanedText = cleanedText
      .split('\n')
      .filter(line => line.trim().length > 2)
      .join('\n');

    return cleanedText.trim();
  }

  // Corrigir pontuação mal reconhecida
  private correctPunctuation(text: string): string {
    let corrected = text;

    // Corrigir vírgulas mal reconhecidas
    corrected = corrected.replace(/\s+,\s+/g, ', ');
    corrected = corrected.replace(/,\s*\./g, '.');
    corrected = corrected.replace(/,\s*!/g, '!');
    corrected = corrected.replace(/,\s*\?/g, '?');

    // Corrigir pontos mal reconhecidos
    corrected = corrected.replace(/\.\s*\./g, '.');
    corrected = corrected.replace(/\s+\.\s+/g, '. ');

    // Corrigir dois pontos
    corrected = corrected.replace(/\s+:\s+/g, ': ');

    // Corrigir ponto e vírgula
    corrected = corrected.replace(/\s+;\s+/g, '; ');

    return corrected;
  }

  // Corrigir palavras comuns mal reconhecidas
  private correctCommonWords(text: string): string {
    let corrected = text;

    const commonCorrections: { [key: string]: string } = {
      // Palavras comuns mal reconhecidas
      '0': 'o',
      '1': 'i',
      '5': 's',
      '8': 'B',
      'rn': 'm',
      'cl': 'd',
      'ii': 'n',
      'll': 'h',
      'vv': 'w',
      
      // Palavras específicas do português
      'nao': 'não',
      'sim': 'sim',
      'que': 'que',
      'para': 'para',
      'com': 'com',
      'uma': 'uma',
      'sao': 'são',
      'mais': 'mais',
      'pela': 'pela',
      'pelo': 'pelo',
      'sobre': 'sobre',
      'entre': 'entre',
      'tambem': 'também',
      'alem': 'além',
      'atraves': 'através',
      'necessario': 'necessário',
      'importante': 'importante',
      'problema': 'problema',
      'sociedade': 'sociedade',
      'governo': 'governo',
      'educacao': 'educação',
      'saude': 'saúde',
      'seguranca': 'segurança',
      'desenvolvimento': 'desenvolvimento',
      'sustentavel': 'sustentável',
      'democracia': 'democracia',
      'cidadania': 'cidadania',
      'direitos': 'direitos',
      'humanos': 'humanos'
    };

    // Aplicar correções
    Object.entries(commonCorrections).forEach(([wrong, correct]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      corrected = corrected.replace(regex, correct);
    });

    return corrected;
  }

  // Validar se o texto extraído é uma redação válida
  validateEssayText(text: string): {
    isValid: boolean;
    wordCount: number;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    const wordCount = text.trim().split(/\s+/).length;

    // Verificar tamanho mínimo
    if (wordCount < 50) {
      issues.push('Texto muito curto para ser uma redação');
      suggestions.push('Certifique-se de que a imagem contém o texto completo da redação');
    }

    // Verificar se contém palavras típicas de redação
    const essayKeywords = [
      'introdução', 'desenvolvimento', 'conclusão', 'tema', 'problema',
      'solução', 'sociedade', 'governo', 'necessário', 'importante',
      'portanto', 'assim', 'dessa forma', 'além disso', 'por outro lado'
    ];

    const hasEssayKeywords = essayKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );

    if (!hasEssayKeywords && wordCount > 100) {
      issues.push('Texto não parece ser uma redação');
      suggestions.push('Verifique se a imagem contém uma redação acadêmica');
    }

    // Verificar qualidade do reconhecimento
    const hasManyNumbers = (text.match(/\d+/g) || []).length > wordCount * 0.1;
    if (hasManyNumbers) {
      issues.push('Muitos números detectados - possível erro de reconhecimento');
      suggestions.push('Tente melhorar a qualidade da imagem ou iluminação');
    }

    const hasManySpecialChars = (text.match(/[^a-zA-ZÀ-ÿ\s.,!?;:()\-'"]/g) || []).length > wordCount * 0.05;
    if (hasManySpecialChars) {
      issues.push('Muitos caracteres especiais - possível erro de reconhecimento');
      suggestions.push('Verifique se a imagem está nítida e bem iluminada');
    }

    return {
      isValid: issues.length === 0,
      wordCount,
      issues,
      suggestions
    };
  }

  // Obter estatísticas do texto extraído
  getTextStatistics(text: string): {
    wordCount: number;
    characterCount: number;
    paragraphCount: number;
    sentenceCount: number;
    averageWordsPerSentence: number;
    readabilityScore: number;
  } {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const characters = text.length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const wordCount = words.length;
    const characterCount = characters;
    const paragraphCount = paragraphs.length;
    const sentenceCount = sentences.length;
    const averageWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    
    // Cálculo simples de legibilidade (Flesch Reading Ease adaptado)
    const readabilityScore = this.calculateReadabilityScore(wordCount, sentenceCount, characters);

    return {
      wordCount,
      characterCount,
      paragraphCount,
      sentenceCount,
      averageWordsPerSentence,
      readabilityScore
    };
  }

  // Calcular pontuação de legibilidade
  private calculateReadabilityScore(wordCount: number, sentenceCount: number, characterCount: number): number {
    if (sentenceCount === 0 || wordCount === 0) return 0;

    const averageWordsPerSentence = wordCount / sentenceCount;
    const averageCharactersPerWord = characterCount / wordCount;

    // Fórmula adaptada do Flesch Reading Ease
    const score = 206.835 - (1.015 * averageWordsPerSentence) - (84.6 * averageCharactersPerWord);
    
    return Math.max(0, Math.min(100, score));
  }

  // Limpar recursos
  async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }

  // Verificar se o serviço está inicializado
  isReady(): boolean {
    return this.isInitialized && this.worker !== null;
  }
}
