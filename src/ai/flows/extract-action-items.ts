
'use server';
/**
 * @fileOverview An AI agent that extracts action items from meeting transcripts.
 *
 * - extractActionItems - A function that handles the action item extraction process.
 * - ExtractActionItemsInput - The input type for the extractActionItems function.
 * - ExtractActionItemsOutput - The return type for the extractActionItems function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const ExtractActionItemsInputSchema = z.object({
  meetingTranscript: z.string().describe('The transcript of the meeting.'),
  currentDate: z.string().describe('The current date in ISO format, to be used as a reference for deadlines.'),
});
export type ExtractActionItemsInput = z.infer<typeof ExtractActionItemsInputSchema>;

const ExtractActionItemsOutputSchema = z.array(z.object({
  task: z.string().describe('The action item task.'),
  assignee: z.string().describe('The person assigned to the task.'),
  deadline: z.string().describe('The deadline for the task, in ISO format.'),
  importance: z.string().describe('The importance of the task (High, Medium, or Low).'),
}));
export type ExtractActionItemsOutput = z.infer<typeof ExtractActionItemsOutputSchema>;

export async function extractActionItems(input: ExtractActionItemsInput): Promise<ExtractActionItemsOutput> {
  return extractActionItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractActionItemsPrompt',
  input: {schema: ExtractActionItemsInputSchema},
  output: {schema: ExtractActionItemsOutputSchema},
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `You are an AI assistant that extracts action items from meeting transcripts.

  Given the following meeting transcript, extract all action items, the person assigned to the task, the deadline for the task, and the importance of the task.
  The current date is {{currentDate}}. Use this as a reference point for any deadlines you infer. For example, if the transcript says "by next Friday", use the current date to determine the correct date for the upcoming Friday.
  Consider the context of the conversation to accurately determine the assignee, taking into account turn-taking and commitments made during the meeting.
  If a deadline is not explicitly mentioned, infer a reasonable deadline based on the context of the task.
  Determine the importance of the task (High, Medium, or Low) based on the urgency and impact discussed in the transcript.
  Return the output as a JSON array of objects, where each object has the following keys: task, assignee, deadline, importance. The deadline must be in ISO format.

  Meeting Transcript:
  {{meetingTranscript}}`,
});

const extractActionItemsFlow = ai.defineFlow(
  {
    name: 'extractActionItemsFlow',
    inputSchema: ExtractActionItemsInputSchema,
    outputSchema: ExtractActionItemsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
