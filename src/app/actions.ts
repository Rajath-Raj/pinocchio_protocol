'use server';

import { generateRobotVoice } from '@/ai/flows/generate-robot-voice';
import { transcribeAudio, TranscribeAudioInput } from '@/ai/flows/transcribe-audio';

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
    return { text: result.text };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return { text: null, error: 'Failed to transcribe audio.' };
  }
}
