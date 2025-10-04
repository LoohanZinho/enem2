/**
 * @fileoverview Defines the TypeScript types and Zod schemas for the essay correction flow.
 * This keeps data structures separate from the server-side logic.
 */
import { z } from 'genkit';

// Define the schema for a single competency's evaluation
const CompetenciaSchema = z.object({
  competencia: z.number().describe('O número da competência (1 a 5).'),
  nota: z.number().describe('A nota atribuída para esta competência, de 0 a 200.'),
  justificativa: z.string().describe('Uma explicação detalhada sobre a pontuação atribuída.'),
  pontosFortes: z.array(z.string()).describe('Uma lista de pontos positivos observados nesta competência.'),
  pontosFracos: z.array(z.string()).describe('Uma lista de pontos que precisam de melhoria nesta competência.'),
  sugestoes: z.array(z.string()).describe('Uma lista de sugestões práticas para o aluno melhorar nesta competência.'),
});

// Define the input schema for the essay correction flow
export const CorrecaoRedacaoInputSchema = z.object({
  texto: z.string().min(50, { message: 'O texto da redação precisa ter pelo menos 50 caracteres.' }).describe('O texto completo da redação a ser corrigida.'),
  tema: z.string().min(5, { message: 'O tema da redação é obrigatório.' }).describe('O tema proposto para a redação.'),
});
export type CorrecaoRedacaoInput = z.infer<typeof CorrecaoRedacaoInputSchema>;

// Define the output schema for the essay correction flow
export const CorrecaoRedacaoOutputSchema = z.object({
  competencias: z.array(CompetenciaSchema).length(5).describe('Uma lista contendo a análise detalhada das 5 competências do ENEM.'),
  notaFinal: z.number().describe('A nota final da redação, de 0 a 1000.'),
  feedbackGeral: z.string().describe('Um parágrafo com um feedback geral sobre a redação, destacando os principais pontos fortes e fracos e uma direção para os estudos.'),
  nivel: z.enum(['Insuficiente', 'Regular', 'Bom', 'Muito Bom', 'Excelente']).describe('A classificação geral do nível da redação.'),
});
export type CorrecaoRedacaoOutput = z.infer<typeof CorrecaoRedacaoOutputSchema>;
