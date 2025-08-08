'use server';

import { generateRobotVoice } from '@/ai/flows/generate-robot-voice';

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
