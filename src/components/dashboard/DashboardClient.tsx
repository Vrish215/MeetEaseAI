
"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { generateFromTranscript } from "@/app/dashboard/actions";
import type { AnalyzeTranscriptOutput } from "@/ai/flows/analyze-transcript-flow";
import type { AnalyzeMeetingAudioOutput } from "@/ai/flows/analyze-meeting-audio-flow";
import { useToast } from "@/hooks/use-toast";
import ActionItemsTable from "./ActionItemsTable";
import { Skeleton } from "../ui/skeleton";
import { Share2, Bot, ListChecks, FileText, Loader2, Video, Mail, Send, RefreshCw, Upload } from "lucide-react";
import MeetingAnalysisModal from "./MeetingAnalysisModal";
import { format, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type DisplayMode = "transcript" | "liveAnalysis";
type AnalysisResult = AnalyzeTranscriptOutput;


export default function DashboardClient() {
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("transcript");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const searchParams = useSearchParams();

  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get('action') === 'analyze') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const handleGenerate = async () => {
    if (!transcript.trim()) {
      toast({ title: "Transcript is empty", description: "Please paste a transcript to analyze.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setDisplayMode("transcript"); 
    
    const formData = new FormData();
    formData.append("transcript", transcript);

    try {
      const result = await generateFromTranscript(formData);
      if (result.error) {
        throw new Error(result.error);
      }
      setAnalysisResult(result.data || null);
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
      toast({ title: "Generation Failed", description: e.message || "An unknown error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalysisComplete = (analysisResult: AnalyzeMeetingAudioOutput) => {
    setAnalysisResult(analysisResult);
    setDisplayMode("liveAnalysis");
  };
  
  const resetDashboard = () => {
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
    setIsModalOpen(true);
  }

  const getSortedItems = (items: AnalysisResult['actionItems']) => {
    const importanceOrder: { [key: string]: number } = {
      "High": 1,
      "Medium": 2,
      "Low": 3
    };

    return [...items].sort((a, b) => {
      const importanceA = importanceOrder[a.importance] || 4;
      const importanceB = importanceOrder[b.importance] || 4;
      if (importanceA !== importanceB) {
        return importanceA - importanceB;
      }
      try {
        const dateA = parseISO(a.deadline).getTime();
        const dateB = parseISO(b.deadline).getTime();
        return dateA - dateB;
      } catch (error) {
          return 0;
      }
    });
  }
  
  const formatItemsForEmail = (result: AnalysisResult) => {
    let text = "";
    if (result.summary) {
        text += `Summary:\n${result.summary}\n\n`;
    }
    text += "Action Items:\n\n";
    const sortedItems = getSortedItems(result.actionItems);
    sortedItems.forEach(item => {
        const deadline = format(parseISO(item.deadline), 'MMM d, yyyy');
        text += `- [${item.importance}] ${item.task} (Assignee: ${item.assignee}, Deadline: ${deadline})\n`;
    });
    return text;
  };
  
  const formatItemsForClipboard = (result: AnalysisResult) => {
    return formatItemsForEmail(result);
  };

  const handleCopyToClipboard = () => {
    if (!analysisResult) return;
    const textToCopy = formatItemsForClipboard(analysisResult);
    navigator.clipboard.writeText(textToCopy).then(() => {
        toast({ title: "Copied to clipboard!"});
    }).catch(err => {
        toast({ title: "Failed to copy", description: "Could not copy text to clipboard.", variant: "destructive"});
    });
  };
  
  const handleOpenEmailClient = (client: 'gmail' | 'outlook') => {
    if (!recipientEmail.trim() || !analysisResult) {
      toast({ title: "Invalid input", description: "Please enter a valid recipient email address.", variant: "destructive" });
      return;
    }
    
    const subject = `Meeting Summary & Action Items`;
    const body = formatItemsForEmail(analysisResult);
    let url = '';

    if (client === 'gmail') {
        url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else {
        url = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(recipientEmail)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    window.open(url, '_blank');
    
    toast({
      title: "Opening Email Client",
      description: `Your email client is opening with the action items ready to send to ${recipientEmail}.`,
    });
    
    setIsEmailModalOpen(false);
    setRecipientEmail("");
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setTranscript(text);
        toast({ title: "File loaded successfully!"});
      };
      reader.onerror = () => {
        toast({ title: "Error reading file", variant: "destructive"});
      };
      reader.readAsText(file);
    }
    // Reset file input to allow uploading the same file again
    if(event.target) {
        event.target.value = '';
    }
  };


  const resultsCard = (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 font-headline">
            <div className="flex items-center gap-2">
              <ListChecks className="h-6 w-6 text-primary" /> Results
            </div>
            {displayMode === 'liveAnalysis' && (
                 <Button variant="outline" size="sm" onClick={resetDashboard}>
                    <RefreshCw className="mr-2 h-4 w-4"/> Start New Session
                 </Button>
            )}
          </CardTitle>
          <CardDescription>View your meeting summary and action items here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Meeting Summary</h3>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[80%]" />
              <h3 className="text-lg font-semibold pt-4">Action Items</h3>
              <Skeleton className="h-24 w-full" />
            </div>
          )}
          
          {!isLoading && error && (
              <div className="text-destructive-foreground bg-destructive/90 p-4 rounded-md text-center">
                  <p className="font-bold">Error generating results</p>
                  <p className="text-sm">{error}</p>
              </div>
          )}

          {!isLoading && !error && analysisResult && (
            <>
              {analysisResult.summary && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Meeting Summary</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{analysisResult.summary}</p>
                </div>
              )}

              {analysisResult.actionItems && (
                <div className="pt-4">
                  <h3 className="text-lg font-semibold mb-2">Action Items</h3>
                  {analysisResult.actionItems.length > 0 ? (
                    <ActionItemsTable items={analysisResult.actionItems} />
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No action items were found.</p>
                  )}
                </div>
              )}
              
              {analysisResult.actionItems && analysisResult.actionItems.length > 0 && (
                <div className="pt-4">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Share2 className="h-5 w-5"/> Export & Share</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => setIsEmailModalOpen(true)}><Mail className="mr-2 h-4 w-4" /> Send to Email</Button>
                    <Button variant="outline" onClick={handleCopyToClipboard}><FileText className="mr-2 h-4 w-4" /> Copy as Text</Button>
                  </div>
                </div>
              )}
            </>
          )}

          {!isLoading && !error && !analysisResult && (
               <div className="text-center py-10 text-muted-foreground">
                  <p>Your results will appear here once you generate them.</p>
               </div>
          )}
        </CardContent>
      </Card>
  );

  return (
    <>
    <MeetingAnalysisModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAnalysisComplete={handleAnalysisComplete} />

    {/* Email Dialog */}
    <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Send Action Items via Email</DialogTitle>
          <DialogDescription>
            Enter the recipient&apos;s email address and choose your preferred email client. A new email will be opened with the action items.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              To:
            </Label>
            <Input
              id="email"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="col-span-3"
              placeholder="name@example.com"
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between gap-2">
           <Button type="button" variant="secondary" onClick={() => setIsEmailModalOpen(false)}>Cancel</Button>
           <div className="flex gap-2">
            <Button type="button" onClick={() => handleOpenEmailClient('gmail')} disabled={!recipientEmail}>
                <Mail className="mr-2 h-4 w-4"/> Open Gmail
            </Button>
            <Button type="button" onClick={() => handleOpenEmailClient('outlook')} disabled={!recipientEmail}>
                <Send className="mr-2 h-4 w-4"/> Open Outlook
            </Button>
           </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>


    {displayMode === 'transcript' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:gap-12">
            <Card className="shadow-lg">
                <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline"><FileText className="h-6 w-6 text-primary"/> Your Transcript</CardTitle>
                <CardDescription>Paste your meeting transcript below or upload a file.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <Textarea
                    placeholder="[00:00:01] Speaker A: Okay, team, let's kick off the weekly sync..."
                    className="min-h-[300px] text-base"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    disabled={isLoading}
                />
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleGenerate} disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                    Generate Summary & Actions
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".txt"
                    />
                    <Button variant="outline" className="w-full sm:w-auto" disabled={isLoading} onClick={handleUploadClick}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload File
                    </Button>
                </div>
                </CardContent>
            </Card>
            <div className="space-y-6">
                {resultsCard}
            </div>
        </div>
    ) : (
        <div className="space-y-6">
            {resultsCard}
        </div>
    )}
    </>
  );
}
