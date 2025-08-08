'use server';

/**
 * @fileOverview This file defines a Genkit flow for transcribing audio.
 *
 * - transcribeAudio - A function that takes audio data and returns the transcribed text.
 */

import {ai} from '@/ai/genkit';
import {TranscribeAudioInput, TranscribeAudioInputSchema, TranscribeAudioOutput, TranscribeAudioOutputSchema} from '@/ai/flows/transcribe-audio.types';


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
    const {output} = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: [
        {media: {url: audioDataUri}},
        {text: 'Transcribe the audio.'},
      ],
    });

    return {text: output || ''};
  }
);
