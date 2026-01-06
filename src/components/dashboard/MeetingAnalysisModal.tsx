
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, Send } from "lucide-react";
import { startMeetingAnalysis } from "@/app/dashboard/actions";
import { useToast } from "@/hooks/use-toast";
import AudioRecorder from "./AudioRecorder";
import { useRouter } from "next/navigation";
import type { AnalyzeMeetingAudioOutput } from "@/ai/flows/analyze-meeting-audio-flow";


interface MeetingAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (result: AnalyzeMeetingAudioOutput) => void;
}

export default function MeetingAnalysisModal({ isOpen, onClose, onAnalysisComplete }: MeetingAnalysisModalProps) {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setAudioBlob(null);
      setAudioDataUri(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);


  const handleFinalSubmit = async () => {
    if (!audioDataUri) {
        toast({
            title: "No Recording",
            description: "Please record your meeting audio before submitting.",
            variant: "destructive"
        });
        return;
    };

    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("audioNotesDataUri", audioDataUri);

    const result = await startMeetingAnalysis(formData);
    
    if (result.error || !result.data) {
        toast({
            title: "Analysis Failed",
            description: result.error || "An unknown error occurred.",
            variant: "destructive"
        });
    } else {
        toast({
            title: "Analysis Complete",
            description: "Your meeting summary and action items are ready.",
        });
        onAnalysisComplete(result.data);
        // Remove the query param and go back to the clean dashboard state
        router.push('/dashboard', { scroll: false });
        onClose();
    }
    setIsSubmitting(false);
  };
  
  const handleAudioRecording = (blob: Blob) => {
    setAudioBlob(blob);
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      setAudioDataUri(reader.result as string);
    };
  };

  const handleClose = () => {
    // If the user closes the modal, we should clean up the URL but not do a full page nav
    // to avoid resetting the dashboard view unnecessarily.
    router.push('/dashboard', { scroll: false });
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2"><Mic /> Record Meeting</DialogTitle>
           <DialogDescription>
            Click the microphone to start recording your meeting. Click stop when you're done. The audio will be sent for analysis.
           </DialogDescription>
         </DialogHeader>
          <div className="py-4">
             <AudioRecorder onRecordingComplete={handleAudioRecording} />
          </div>
         <DialogFooter>
           <Button variant="ghost" onClick={handleClose}>
              Cancel
           </Button>
           <Button onClick={handleFinalSubmit} disabled={isSubmitting || !audioDataUri}>
             {isSubmitting ? <Loader2 className="animate-spin" /> : <Send/>}
             Submit for Analysis
           </Button>
         </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
