/**
 * @fileoverview Defines the TypeScript types and Zod schemas for the flashcard generation flow.
 */
import { z } from 'genkit';

// Input schema: just a string of text
export const GerarFlashcardsInputSchema = z.object({
  texto: z
    .string()
    .min(50, { message: 'O texto precisa ter pelo menos 50 caracteres.' })
    .describe('O texto a partir do qual os flashcards serão gerados.'),
  materia: z.string().optional().describe('A matéria do texto, se conhecida.'),
});
export type GerarFlashcardsInput = z.infer<typeof GerarFlashcardsInputSchema>;

// Schema for a single flashcard
const FlashcardSchema = z.object({
  front: z.string().describe('A pergunta ou o termo principal do flashcard.'),
  back: z.string().describe('A resposta ou a definição do flashcard.'),
  subject: z
    .string()
    .describe('A matéria do flashcard (ex: Matemática, História).'),
  module: z
    .string()
    .describe(
      'O módulo ou tópico específico do flashcard (ex: Álgebra, Segunda Guerra Mundial).'
    ),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z
    .array(z.string())
    .describe('Uma lista de 2 a 3 palavras-chave sobre o card.'),
});

// Output schema: an array of flashcards
export const GerarFlashcardsOutputSchema = z.array(FlashcardSchema);
export type GerarFlashcardsOutput = z.infer<typeof GerarFlashcardsOutputSchema>;
export type FlashcardGerado = z.infer<typeof FlashcardSchema>;
