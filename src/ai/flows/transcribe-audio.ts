'use server';

/**
 * @fileOverview This file defines a Genkit flow for transcribing audio.
 *
 * - transcribeAudio - A function that takes audio data and returns the transcribed text.
 */

import {ai} from '@/ai/genkit';
import {TranscribeAudioInput, TranscribeAudioInputSchema, TranscribeAudioOutput, TranscribeAudioOutputSchema} from '@/ai/flows/transcribe-audio.types';
import { googleAI } from '@genkit-ai/googleai';


export async function transcribeAudio(
  input: TranscribeAudioInput
): Promise<TranscribeAudioOutput> {
  return transcribeAudioFlow(input);
}

const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async ({audioDataUri}) => {
    // Use a specific plugin instance if a separate key is provided.
    const customAI = process.env.TRANSCRIPTION_API_KEY ? googleAI({ apiKey: process.env.TRANSCRIPTION_API_KEY }) : ai.registry.getPlugin('googleai');

    if (!customAI) {
      throw new Error("Google AI plugin is not configured.");
    }

    const model = customAI.model('gemini-2.0-flash');

    const {output} = await ai.generate({
      model,
      prompt: [
        {media: {url: audioDataUri}},
        {text: 'Transcribe the audio accurately.'},
      ],
    });

    return {text: output || ''};
  }
);
