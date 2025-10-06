
'use server';
/**
 * @fileoverview Defines the AI flow for correcting ENEM essays.
 * This flow takes an essay text and a theme, and returns a detailed correction
 * based on the 5 official ENEM competencies.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { 
  CorrecaoRedacaoInputSchema, 
  CorrecaoRedacaoOutputSchema,
  type CorrecaoRedacaoInput,
  type CorrecaoRedacaoOutput
} from './redacao-types';

// Define the Genkit prompt for the essay correction
const correcaoRedacaoPrompt = ai.definePrompt({
  name: 'correcaoRedacaoPrompt',
  input: { schema: CorrecaoRedacaoInputSchema },
  output: { schema: CorrecaoRedacaoOutputSchema },
  model: googleAI('gemini-pro'),
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
