import { config } from 'dotenv';
config();

import '@/ai/flows/extract-action-items.ts';
import '@/ai/flows/analyze-meeting-audio-flow.ts';
import '@/ai/flows/analyze-transcript-flow.ts';
