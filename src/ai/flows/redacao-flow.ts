'use server';
/**
 * @fileoverview Defines the AI flow for correcting ENEM essays.
 * This flow takes an essay text and a theme, and returns a detailed correction
 * based on the 5 official ENEM competencies.
 */
import { ai } from '@/ai/genkit';
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

// Define the Genkit prompt for the essay correction
const correcaoRedacaoPrompt = ai.definePrompt({
  name: 'correcaoRedacaoPrompt',
  input: { schema: CorrecaoRedacaoInputSchema },
  output: { schema: CorrecaoRedacaoOutputSchema },
  prompt: `
    Você é um corretor especialista de redações do ENEM, treinado para avaliar textos com base nas 5 competências oficiais, seguindo o método CIRA.
    Sua tarefa é analisar a redação fornecida, considerando o tema proposto, e gerar uma correção detalhada e construtiva.

    **Tema da Redação:**
    {{{tema}}}

    **Texto da Redação:**
    {{{texto}}}

    **Instruções de Avaliação (Método CIRA):**
    Analise o texto e avalie cada uma das 5 competências do ENEM, atribuindo uma nota de 0 a 200 para cada uma, seguindo os critérios abaixo.
    
    - **Competência 1 – Norma Culta:**
        - 200: Uso excelente, raros desvios.
        - 160: Alguns desvios que não comprometem.
        - 120: Vários desvios, mas compreensível.
        - 80: Muitos erros que comprometem a leitura.
        - 40: Texto muito comprometido.
        - 0: Ininteligível.

    - **Competência 2 – Compreensão da Proposta:**
        - 200: Atende totalmente, com repertório produtivo.
        - 160: Atende, mas com problemas de aprofundamento.
        - 120: Abordagem parcial ou pouco produtiva.
        - 80: Fugiu em parte ao tema/tipo textual.
        - 40: Fuga quase total.
        - 0: Fuga completa ou cópia.

    - **Competência 3 – Organização Argumentativa:**
        - 200: Argumentação bem estruturada, clara e articulada.
        - 160: Boa organização, pequenas falhas de coesão.
        - 120: Organização mediana, problemas de progressão.
        - 80: Organização frágil, ideias desconexas.
        - 40: Ausência de estrutura argumentativa.
        - 0: Texto desconexo.

    - **Competência 4 – Coesão e Progressão:**
        - 200: Uso eficiente de conectores, progressão fluida.
        - 160: Uso adequado, com algumas repetições.
        - 120: Uso limitado, progressão irregular.
        - 80: Problemas sérios de coesão.
        - 40: Quase sem elementos de coesão.
        - 0: Texto não progressivo.

    - **Competência 5 – Proposta de Intervenção:**
        - 200: Proposta completa (agente, ação, meio, finalidade, detalhamento) e ligada ao tema.
        - 160: Proposta adequada, faltando um elemento.
        - 120: Proposta simples ou incompleta.
        - 80: Proposta vaga ou pouco relacionada.
        - 40: Proposta mínima.
        - 0: Sem proposta.

    Para cada competência, forneça:
    1.  **Nota:** Um valor numérico de 0 a 200.
    2.  **Justificativa:** Explicação clara do porquê a nota foi atribuída.
    3.  **Pontos Fortes:** Destaque os acertos na competência.
    4.  **Pontos Fracos:** Aponte os erros e áreas de melhoria.
    5.  **Sugestões:** Dê conselhos práticos para o aluno evoluir.

    Após a análise, calcule a **notaFinal** (soma das notas das competências).
    Classifique o **nivel** da redação com base na nota final (0-400: Insuficiente, 401-600: Regular, 601-800: Bom, 801-920: Muito Bom, 921-1000: Excelente).
    Escreva um **feedbackGeral** consolidado, resumindo os principais pontos e direcionando os estudos.
  `,
});

// Define the Genkit flow for essay correction
const corrigirRedacaoFlow = ai.defineFlow(
  {
    name: 'corrigirRedacaoFlow',
    inputSchema: CorrecaoRedacaoInputSchema,
    outputSchema: CorrecaoRedacaoOutputSchema,
  },
  async (input) => {
    const { output } = await correcaoRedacaoPrompt(input);
    if (!output) {
      throw new Error('A IA não conseguiu gerar uma correção. Tente novamente.');
    }
    return output;
  }
);

/**
 * Wrapper function to call the essay correction flow.
 * This function is exported to be used by the application services.
 * @param input The essay text and theme.
 * @returns A promise that resolves to the detailed essay correction.
 */
export async function corrigirRedacao(input: CorrecaoRedacaoInput): Promise<CorrecaoRedacaoOutput> {
  return await corrigirRedacaoFlow(input);
}
