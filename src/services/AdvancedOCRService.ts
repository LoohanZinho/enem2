// Sistema Avançado de OCR para Redações Manuscritas
// Integração com múltiplas APIs de OCR e processamento de imagem

export interface OCRResult {
  text: string;
  confidence: number;
  words: OCRWord[];
  processingTime: number;
  provider: 'tesseract' | 'google' | 'azure' | 'aws';
}

export interface OCRWord {
  text: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ImagePreprocessingOptions {
  enhanceContrast: boolean;
  removeNoise: boolean;
  deskew: boolean;
  resize: boolean;
  targetWidth?: number;
  targetHeight?: number;
}

export interface OCRConfig {
  language: string;
  preprocessing: ImagePreprocessingOptions;
  fallbackProviders: string[];
  maxRetries: number;
  timeout: number;
}

export class AdvancedOCRService {
  private static instance: AdvancedOCRService;
  private config: OCRConfig = {
    language: 'por',
    preprocessing: {
      enhanceContrast: true,
      removeNoise: true,
      deskew: true,
      resize: true,
      targetWidth: 1200,
      targetHeight: 1600
    },
    fallbackProviders: ['tesseract', 'google', 'azure'],
    maxRetries: 3,
    timeout: 30000
  };

  static getInstance(): AdvancedOCRService {
    if (!AdvancedOCRService.instance) {
      AdvancedOCRService.instance = new AdvancedOCRService();
    }
    return AdvancedOCRService.instance;
  }

  // Processar imagem e extrair texto
  async processImage(imageFile: File): Promise<OCRResult> {
    const startTime = Date.now();
    
    try {
      // Pré-processar imagem
      const processedImage = await this.preprocessImage(imageFile);
      
      // Tentar OCR com diferentes provedores
      let result: OCRResult | null = null;
      
      for (const provider of this.config.fallbackProviders) {
        try {
          result = await this.extractTextWithProvider(processedImage, provider);
          if (result && result.confidence > 0.7) {
            break;
          }
        } catch (error) {
          console.warn(`OCR failed with ${provider}:`, error);
          continue;
        }
      }

      if (!result) {
        throw new Error('Todos os provedores de OCR falharam');
      }

      result.processingTime = Date.now() - startTime;
      return result;

    } catch (error) {
      console.error('OCR processing failed:', error);
      throw error;
    }
  }

  // Pré-processar imagem para melhorar OCR
  private async preprocessImage(imageFile: File): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      img.onload = () => {
        // Configurar dimensões
        let { width, height } = img;
        
        if (this.config.preprocessing.resize) {
          const maxWidth = this.config.preprocessing.targetWidth || 1200;
          const maxHeight = this.config.preprocessing.targetHeight || 1600;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Desenhar imagem
        ctx.drawImage(img, 0, 0, width, height);

        // Aplicar filtros de pré-processamento
        if (this.config.preprocessing.enhanceContrast) {
          this.enhanceContrast(ctx, width, height);
        }

        if (this.config.preprocessing.removeNoise) {
          this.removeNoise(ctx, width, height);
        }

        if (this.config.preprocessing.deskew) {
          this.deskewImage(ctx, width, height);
        }

        resolve(canvas);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(imageFile);
    });
  }

  // Melhorar contraste da imagem
  private enhanceContrast(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Aplicar filtro de contraste
    const contrast = 1.5;
    const brightness = 0;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128 + brightness));
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrast + 128 + brightness));
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrast + 128 + brightness));
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // Remover ruído da imagem
  private removeNoise(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const newData = new Uint8ClampedArray(data);

    // Aplicar filtro de mediana
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        for (let c = 0; c < 3; c++) {
          const values: number[] = [];
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const neighborIdx = ((y + dy) * width + (x + dx)) * 4 + c;
              if (data[neighborIdx] !== undefined) {
                values.push(data[neighborIdx]);
              }
            }
          }
          values.sort((a, b) => a - b);
          newData[idx + c] = values[Math.floor(values.length / 2)];
        }
      }
    }

    const newImageData = new ImageData(newData, width, height);
    ctx.putImageData(newImageData, 0, 0);
  }

  // Corrigir inclinação da imagem
  private deskewImage(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Implementação simplificada de correção de inclinação
    // Em uma implementação real, usaria detecção de linhas de texto
    const imageData = ctx.getImageData(0, 0, width, height);
    
    // Aplicar rotação baseada em análise de inclinação
    const angle = this.detectSkewAngle(imageData, width, height);
    
    if (Math.abs(angle) > 0.5) {
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(-angle * Math.PI / 180);
      ctx.translate(-width / 2, -height / 2);
      ctx.drawImage(ctx.canvas, 0, 0);
      ctx.restore();
    }
  }

  // Detectar ângulo de inclinação
  private detectSkewAngle(imageData: ImageData, width: number, height: number): number {
    // Implementação simplificada
    // Em uma implementação real, usaria transformada de Hough
    return 0;
  }

  // Extrair texto usando provedor específico
  private async extractTextWithProvider(canvas: HTMLCanvasElement, provider: string): Promise<OCRResult> {
    switch (provider) {
      case 'tesseract':
        return this.extractWithTesseract(canvas);
      case 'google':
        return this.extractWithGoogle(canvas);
      case 'azure':
        return this.extractWithAzure(canvas);
      case 'aws':
        return this.extractWithAWS(canvas);
      default:
        throw new Error(`Unsupported OCR provider: ${provider}`);
    }
  }

  // OCR com Tesseract.js (local)
  private async extractWithTesseract(canvas: HTMLCanvasElement): Promise<OCRResult> {
    // Esta implementação requer a biblioteca Tesseract.js
    // Para demonstração, retornamos um resultado simulado
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: "Texto extraído com Tesseract.js",
          confidence: 0.85,
          words: [],
          processingTime: 0,
          provider: 'tesseract'
        });
      }, 1000);
    });
  }

  // OCR com Google Vision API
  private async extractWithGoogle(canvas: HTMLCanvasElement): Promise<OCRResult> {
    const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
    
    // Simulação de chamada para Google Vision API
    // Em uma implementação real, faria a chamada HTTP
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: "Texto extraído com Google Vision API",
          confidence: 0.92,
          words: [],
          processingTime: 0,
          provider: 'google'
        });
      }, 1500);
    });
  }

  // OCR com Azure Computer Vision
  private async extractWithAzure(canvas: HTMLCanvasElement): Promise<OCRResult> {
    const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
    
    // Simulação de chamada para Azure Computer Vision
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: "Texto extraído com Azure Computer Vision",
          confidence: 0.88,
          words: [],
          processingTime: 0,
          provider: 'azure'
        });
      }, 1200);
    });
  }

  // OCR com AWS Textract
  private async extractWithAWS(canvas: HTMLCanvasElement): Promise<OCRResult> {
    const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
    
    // Simulação de chamada para AWS Textract
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: "Texto extraído com AWS Textract",
          confidence: 0.90,
          words: [],
          processingTime: 0,
          provider: 'aws'
        });
      }, 1800);
    });
  }

  // Processar texto extraído para redação
  processExtractedText(ocrResult: OCRResult): {
    cleanText: string;
    wordCount: number;
    paragraphCount: number;
    estimatedScore: number;
    suggestions: string[];
  } {
    const cleanText = this.cleanText(ocrResult.text);
    const wordCount = this.countWords(cleanText);
    const paragraphCount = this.countParagraphs(cleanText);
    const estimatedScore = this.estimateScore(cleanText, wordCount);
    const suggestions = this.generateSuggestions(cleanText, wordCount);

    return {
      cleanText,
      wordCount,
      paragraphCount,
      estimatedScore,
      suggestions
    };
  }

  // Limpar texto extraído
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Múltiplos espaços
      .replace(/\n\s*\n/g, '\n\n') // Múltiplas quebras de linha
      .trim();
  }

  // Contar palavras
  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  // Contar parágrafos
  private countParagraphs(text: string): number {
    return text.split(/\n\s*\n/).filter(para => para.trim().length > 0).length;
  }

  // Estimar pontuação baseada no texto
  private estimateScore(text: string, wordCount: number): number {
    let score = 0;
    
    if (wordCount >= 300) score += 20;
    else if (wordCount >= 200) score += 15;
    else if (wordCount >= 100) score += 10;
    
    const paragraphs = this.countParagraphs(text);
    if (paragraphs >= 4) score += 15;
    else if (paragraphs >= 3) score += 10;
    
    const connectives = text.match(/\b(portanto|assim|dessa forma|além disso|por outro lado|contudo|entretanto|no entanto)\b/gi);
    if (connectives && connectives.length >= 3) score += 10;
    
    return Math.min(score, 100);
  }

  // Gerar sugestões de melhoria
  private generateSuggestions(text: string, wordCount: number): string[] {
    const suggestions: string[] = [];
    
    if (wordCount < 300) {
      suggestions.push('Tente expandir suas ideias para atingir o mínimo de 300 palavras');
    }
    
    if (text.split('\n\n').length < 4) {
      suggestions.push('Considere dividir seu texto em mais parágrafos para melhor organização');
    }
    
    if (!text.match(/\b(portanto|assim|dessa forma|além disso)\b/i)) {
      suggestions.push('Use mais conectivos para melhorar a coesão textual');
    }
    
    if (!text.match(/\b(primeiro|segundo|terceiro|por fim|em conclusão)\b/i)) {
      suggestions.push('Estruture melhor sua argumentação com marcadores de sequência');
    }
    
    return suggestions;
  }

  // Configurar OCR
  updateConfig(newConfig: Partial<OCRConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Obter configuração atual
  getConfig(): OCRConfig {
    return this.config;
  }
}

export default AdvancedOCRService;

    