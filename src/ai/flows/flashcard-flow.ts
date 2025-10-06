'use server';
/**
 * @fileoverview Defines the AI flow for generating flashcards from a given text.
 */
import { ai } from '@/ai/genkit';
import {
  GerarFlashcardsInputSchema,
  GerarFlashcardsOutputSchema,
  type GerarFlashcardsInput,
  type GerarFlashcardsOutput,
} from './flashcard-types';

// Define o prompt do Genkit para a geração de flashcards
const gerarFlashcardsPrompt = ai.definePrompt({
  name: 'gerarFlashcardsPrompt',
  input: { schema: GerarFlashcardsInputSchema },
  output: { schema: GerarFlashcardsOutputSchema },
  prompt: `
    Você é um especialista em educação e um assistente de estudos para o ENEM.
    Sua tarefa é analisar o texto fornecido e criar um conjunto de flashcards (pergunta e resposta)
    que ajudem o aluno a memorizar os conceitos mais importantes.

    **Texto para Análise:**
    {{{texto}}}

    **Instruções:**
    1.  **Identifique os Conceitos-Chave:** Analise o texto e extraia os principais conceitos, definições, fórmulas, datas e informações relevantes.
    2.  **Crie Perguntas Claras:** Para cada conceito, formule uma pergunta clara e objetiva para a frente do flashcard ('front').
    3.  **Crie Respostas Concisas:** Forneça uma resposta direta e precisa para a pergunta na parte de trás do flashcard ('back').
    4.  **Determine a Matéria e o Módulo:** Com base no conteúdo, identifique a matéria principal (ex: Matemática, História) e um módulo mais específico (ex: Álgebra, Segunda Guerra Mundial). Se a matéria for fornecida na entrada ({{materia}}), use-a como guia.
    5.  **Defina a Dificuldade:** Classifique cada card como 'easy', 'medium' ou 'hard'.
    6.  **Gere Tags:** Crie de 2 a 3 tags (palavras-chave) relevantes para cada flashcard.

    Gere no mínimo 5 e no máximo 10 flashcards.
    O resultado deve ser um array de objetos, onde cada objeto representa um flashcard.
  `,
});

// Define o flow do Genkit que orquestra a geração de flashcards
const gerarFlashcardsFlow = ai.defineFlow(
  {
    name: 'gerarFlashcardsFlow',
    inputSchema: GerarFlashcardsInputSchema,
    outputSchema: GerarFlashcardsOutputSchema,
  },
  async (input) => {
    const { output } = await gerarFlashcardsPrompt(input);
    if (!output || output.length === 0) {
      throw new Error('A IA não conseguiu gerar flashcards. Tente com um texto diferente ou mais detalhado.');
    }
    return output;
  }
);

/**
 * Wrapper function to call the flashcard generation flow.
 * @param input The text to be converted into flashcards.
 * @returns A promise that resolves to an array of generated flashcards.
 */
export async function gerarFlashcards(
  input: GerarFlashcardsInput
): Promise<GerarFlashcardsOutput> {
  return await gerarFlashcardsFlow(input);
}
