'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a robotic voice from text.
 *
 * - generateRobotVoice - A function that takes text as input and returns the text converted to a robotic voice.
 * - GenerateRobotVoiceInput - The input type for the generateRobotVoice function.
 * - GenerateRobotVoiceOutput - The return type for the generateRobotVoice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const GenerateRobotVoiceInputSchema = z.string().describe('The text to convert to a robotic voice.');
export type GenerateRobotVoiceInput = z.infer<typeof GenerateRobotVoiceInputSchema>;

const GenerateRobotVoiceOutputSchema = z.object({
  media: z.string().describe('The audio data URI in WAV format.'),
});
export type GenerateRobotVoiceOutput = z.infer<typeof GenerateRobotVoiceOutputSchema>;

export async function generateRobotVoice(input: GenerateRobotVoiceInput): Promise<GenerateRobotVoiceOutput> {
  return generateRobotVoiceFlow(input);
}

const generateRobotVoiceFlow = ai.defineFlow(
  {
    name: 'generateRobotVoiceFlow',
    inputSchema: GenerateRobotVoiceInputSchema,
    outputSchema: GenerateRobotVoiceOutputSchema,
  },
  async (query) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-pro-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: query,
    });
    if (!media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    return {
      media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
