
'use server';
/**
 * @fileOverview An AI agent that analyzes meeting transcripts to generate a summary and extract action items.
 *
 * - analyzeTranscript - A function that handles the meeting transcript analysis process.
 * - AnalyzeTranscriptInput - The input type for the analyzeTranscript function.
 * - AnalyzeTranscriptOutput - The return type for the analyzeTranscript function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const AnalyzeTranscriptInputSchema = z.object({
  transcript: z.string().describe('The full transcript of the meeting.'),
  currentDate: z.string().describe('The current date in ISO format, to be used as a reference for deadlines.'),
});
export type AnalyzeTranscriptInput = z.infer<typeof AnalyzeTranscriptInputSchema>;

const AnalyzeTranscriptOutputSchema = z.object({
    summary: z.string().describe('A concise summary of the meeting, consisting of 2-3 key bullet points.'),
    actionItems: z.array(z.object({
        task: z.string().describe('The action item task.'),
        assignee: z.string().describe('The person assigned to the task.'),
        deadline: z.string().describe('The deadline for the task, in ISO format.'),
        importance: z.string().describe('The importance of the task (High, Medium, or Low).'),
    }))
});

export type AnalyzeTranscriptOutput = z.infer<typeof AnalyzeTranscriptOutputSchema>;

export async function analyzeTranscript(input: AnalyzeTranscriptInput): Promise<AnalyzeTranscriptOutput> {
  return analyzeTranscriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTranscriptPrompt',
  input: {schema: AnalyzeTranscriptInputSchema},
  output: {schema: AnalyzeTranscriptOutputSchema},
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `You are an AI assistant that analyzes meeting transcripts.
  
  Your task is to generate a concise summary of the meeting as 2-3 key bullet points, and extract all action items from the provided transcript.

  The current date is {{currentDate}}. Use this as a reference point for any deadlines you infer. For example, if you hear "by next Friday", use the current date to determine the correct date for the upcoming Friday.
  For each action item, extract the task, the person assigned to it, a deadline in ISO format, and the importance (High, Medium, or Low).
  
  Provide the output as a single JSON object with two keys: 'summary' and 'actionItems'.

  Transcript:
  {{transcript}}
  `,
});

const analyzeTranscriptFlow = ai.defineFlow(
  {
    name: 'analyzeTranscriptFlow',
    inputSchema: AnalyzeTranscriptInputSchema,
    outputSchema: AnalyzeTranscriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
