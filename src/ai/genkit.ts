
/**
 * @fileoverview This file initializes the Genkit AI instance with the Google GenAI plugin.
 * It exports a singleton `ai` object that can be used throughout the application to
 * interact with the generative AI models.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      // Specify the API version if needed, e.g., 'v1beta'
    }),
  ],
  // Omit a flow menu from the developer UI.
  enableApp: false,
});
