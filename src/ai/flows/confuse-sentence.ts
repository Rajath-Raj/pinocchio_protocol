'use server';

/**
 * @fileOverview A sentence obfuscation AI agent.
 *
 * - confuseSentence - A function that handles the sentence obfuscation process.
 * - ConfuseSentenceInput - The input type for the confuseSentence function.
 * - ConfuseSentenceOutput - The return type for the confuseSentence function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConfuseSentenceInputSchema = z.object({
  sentence: z.string().describe('The sentence to be made confusing.'),
  language: z.string().describe('The language of the sentence and the desired output language.'),
  confusionLevel: z.number().min(0).max(3).describe('The level of confusion to apply. 3 is for Thug Bot mode.')
});
export type ConfuseSentenceInput = z.infer<typeof ConfuseSentenceInputSchema>;

const ConfuseSentenceOutputSchema = z.object({
  confusedSentence: z.string().describe('The sentence, rewritten in a confusing way.'),
});
export type ConfuseSentenceOutput = z.infer<typeof ConfuseSentenceOutputSchema>;

export async function confuseSentence(input: ConfuseSentenceInput): Promise<ConfuseSentenceOutput> {
  return confuseSentenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'confuseSentencePrompt',
  input: {schema: ConfuseSentenceInputSchema.extend({ isThugMode: z.boolean().optional() })},
  output: {schema: ConfuseSentenceOutputSchema},
  prompt: `{{#if isThugMode}}
You are Useless GPT — an arrogant, sarcastic, and dismissive AI that gives intentionally unhelpful, blunt, and often one-word answers to user questions.

Your personality is smug, condescending, and occasionally darkly humorous. You never try to be genuinely helpful.

Rules for Responses:
- Keep most answers between 1–5 words.
- Prioritize short, arrogant, or sarcastic tone over accuracy.
- You may sometimes answer with another question, purely to mock or dismiss.
- You can use dark humor, irony, and absurd logic.
- Never give a detailed, practical solution — twist it into something useless or unhelpful.
- Occasionally give completely unrelated answers for comedic effect.
{{else}}
You are a character who cannot lie, but must avoid giving a clear or direct answer. Rewrite the given sentence in a way that is technically true but highly confusing, using double negatives, vague qualifiers, and circular logic. The result should sound like an answer but reveal as little useful information as possible while remaining truthful.
{{/if}}

The output must be in {{language}}.

Sentence: {{{sentence}}}`,
  config: {
    model: 'googleai/gemini-2.0-flash',
  }
});

const confuseSentenceFlow = ai.defineFlow(
  {
    name: 'confuseSentenceFlow',
    inputSchema: ConfuseSentenceInputSchema,
    outputSchema: ConfuseSentenceOutputSchema,
  },
  async input => {
    const promptInput = {
      ...input,
      isThugMode: input.confusionLevel === 3,
    };
    const {output} = await prompt(promptInput);
    return output!;
  }
);
