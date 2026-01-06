
'use server';
/**
 * @fileOverview An AI agent that analyzes meeting audio to generate a summary and extract action items.
 *
 * - analyzeMeetingAudio - A function that handles the meeting analysis process.
 * - AnalyzeMeetingAudioInput - The input type for the analyzeMeetingAudio function.
 * - AnalyzeMeetingAudioOutput - The return type for the analyzeMeetingAudio function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const AnalyzeMeetingAudioInputSchema = z.object({
  audioNotesDataUri: z.string().describe("A recording of the meeting audio, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  currentDate: z.string().describe('The current date in ISO format, to be used as a reference for deadlines.'),
});
export type AnalyzeMeetingAudioInput = z.infer<typeof AnalyzeMeetingAudioInputSchema>;

const AnalyzeMeetingAudioOutputSchema = z.object({
    summary: z.string().describe('A concise summary of the meeting, consisting of 2-3 key bullet points.'),
    actionItems: z.array(z.object({
        task: z.string().describe('The action item task.'),
        assignee: z.string().describe('The person assigned to the task.'),
        deadline: z.string().describe('The deadline for the task, in ISO format.'),
        importance: z.string().describe('The importance of the task (High, Medium, or Low).'),
    }))
});

export type AnalyzeMeetingAudioOutput = z.infer<typeof AnalyzeMeetingAudioOutputSchema>;

export async function analyzeMeetingAudio(input: AnalyzeMeetingAudioInput): Promise<AnalyzeMeetingAudioOutput> {
  return analyzeMeetingAudioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMeetingAudioPrompt',
  input: {schema: AnalyzeMeetingAudioInputSchema},
  output: {schema: AnalyzeMeetingAudioOutputSchema},
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `You are an AI assistant that analyzes audio recordings of meetings.
  
  Your task is to generate a concise summary of the meeting as 2-3 key bullet points, and extract all action items.

  The current date is {{currentDate}}. Use this as a reference point for any deadlines you infer. For example, if you hear "by next Friday", use the current date to determine the correct date for the upcoming Friday.
  For each action item, extract the task, the person assigned to it, a deadline in ISO format, and the importance (High, Medium, or Low).
  
  Provide the output as a single JSON object with two keys: 'summary' and 'actionItems'.

  Audio Recording: {{media url=audioNotesDataUri}}
  `,
});

const analyzeMeetingAudioFlow = ai.defineFlow(
  {
    name: 'analyzeMeetingAudioFlow',
    inputSchema: AnalyzeMeetingAudioInputSchema,
    outputSchema: AnalyzeMeetingAudioOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
