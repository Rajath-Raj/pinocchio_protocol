'use server';

import { confuseSentence } from '@/ai/flows/confuse-sentence';
import { generateRobotVoice } from '@/ai/flows/generate-robot-voice';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import type { TranscribeAudioInput } from '@/ai/flows/transcribe-audio.types';

export async function getRobotVoice(text: string): Promise<{ audioDataUri: string | null; error?: string }> {
  try {
    if (!text) {
      return { audioDataUri: null, error: 'No text provided for voice generation.' };
    }
    const result = await generateRobotVoice(text);
    return { audioDataUri: result.media };
  } catch (error) {
    console.error('Error generating robot voice:', error);
    return { audioDataUri: null, error: 'Failed to generate robot voice.' };
  }
}

export async function getTranscription(input: TranscribeAudioInput): Promise<{ text: string | null; error?: string }> {
  try {
    if (!input.audioDataUri) {
      return { text: null, error: 'No audio provided for transcription.' };
    }
    const result = await transcribeAudio(input);
    if (!result || typeof result.text !== 'string') {
        throw new Error('Invalid transcription response from AI.');
    }
    return { text: result.text };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during transcription.';
    console.error('Error in getTranscription action:', errorMessage);
    return { text: null, error: `Transcription failed: ${errorMessage}` };
  }
}

export { confuseSentence };
