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
  input: {schema: ConfuseSentenceInputSchema},
  output: {schema: ConfuseSentenceOutputSchema},
  prompt: `You are a character who cannot lie, but must avoid giving a clear or direct answer. Rewrite the given sentence in a way that is technically true but highly confusing, using double negatives, vague qualifiers, and circular logic. The result should sound like an answer but reveal as little useful information as possible while remaining truthful.

Sentence: {{{sentence}}}`,
});

const confuseSentenceFlow = ai.defineFlow(
  {
    name: 'confuseSentenceFlow',
    inputSchema: ConfuseSentenceInputSchema,
    outputSchema: ConfuseSentenceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
