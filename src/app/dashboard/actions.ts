
"use server";

import { analyzeTranscript } from "@/ai/flows/analyze-transcript-flow";
import { analyzeMeetingAudio } from "@/ai/flows/analyze-meeting-audio-flow";
import { z } from "zod";

const transcriptSchema = z.object({
  transcript: z.string(),
});

export async function generateFromTranscript(formData: FormData) {
  const parsed = transcriptSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success || !parsed.data.transcript) {
    return { error: "Meeting transcript cannot be empty." };
  }

  try {
    const currentDate = new Date().toISOString();
    const result = await analyzeTranscript({ transcript: parsed.data.transcript, currentDate });
    return { data: result };
  } catch (error: any) {
    console.error("Error analyzing transcript:", error);
    return { error: error.message || "Failed to analyze the transcript." };
  }
}

const analysisSchema = z.object({
  audioNotesDataUri: z.string(),
});

export async function startMeetingAnalysis(formData: FormData) {
  const parsed = analysisSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: "Invalid audio input." };
  }
  
  try {
    const currentDate = new Date().toISOString();
    const result = await analyzeMeetingAudio({ 
      audioNotesDataUri: parsed.data.audioNotesDataUri, 
      currentDate 
    });
    
    return { 
      data: result,
    };
  } catch (error: any) {
    console.error("Error starting meeting analysis:", error);
    return { error: error.message || "Failed to start analysis." };
  }
}
