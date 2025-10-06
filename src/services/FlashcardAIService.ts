
// Serviço de IA para geração inteligente de flashcards
import {
  gerarFlashcards
} from '@/ai/flows/flashcard-flow';
import type { GerarFlashcardsInput, GerarFlashcardsOutput } from '@/ai/flows/flashcard-types';


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
  // Gerar flashcards a partir da análise
  async generateFlashcards(
    text: string,
    materia?: string
  ): Promise<GerarFlashcardsOutput> {
    const input: GerarFlashcardsInput = { texto: text };
    if (materia) {
      input.materia = materia;
    }

    // Chama o flow do Genkit para gerar os flashcards
    const flashcards = await gerarFlashcards(input);

    // O retorno já está no formato correto, então apenas retornamos
    return flashcards;
  }
}

export default new FlashcardAIService();
