
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Trash2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [timer, setTimer] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);


  const startRecording = async () => {
    try {
      // Attempt to disable audio processing to capture system audio via microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      });
      streamRef.current = stream;

      mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
            chunks.current.push(e.data);
        }
      };
      
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        chunks.current = [];
        setAudioBlob(blob);
        onRecordingComplete(blob);
      };
      
      mediaRecorder.current.start();
      setIsRecording(true);
      setAudioBlob(null);
    } catch (err: any) {
      console.error('Error starting recording:', err);
      let description = "Could not start recording. Please check your browser permissions.";
      if (err.name === 'NotAllowedError') {
        description = "You denied permission to record. Please allow access to continue.";
      } else if (err.name === 'NotFoundError') {
        description = "No microphone or audio source found. Please check your hardware."
      }
      toast({
          title: "Recording Error",
          description: description,
          variant: "destructive"
      })
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      streamRef.current?.getTracks().forEach(track => {
        track.stop()
      });
      setIsRecording(false);
    }
  };
  
  const resetRecording = () => {
    setAudioBlob(null);
    setIsRecording(false);
    setTimer(0);
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-4 rounded-lg border bg-card">
      {!audioBlob ? (
        <>
            <div className="text-2xl font-mono text-foreground">{formatTime(timer)}</div>
            {!isRecording ? (
              <Button onClick={startRecording} size="lg" className="rounded-full w-20 h-20 bg-primary hover:bg-primary/90">
                <Mic className="h-8 w-8" />
              </Button>
            ) : (
              <Button onClick={stopRecording} size="lg" variant="destructive" className="rounded-full w-20 h-20">
                <Square className="h-8 w-8" />
              </Button>
            )}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                  {isRecording ? "Click to stop recording" : "Click to start recording"}
              </p>
               <p className="text-xs text-muted-foreground pt-2">
                  To record other speakers, please use your computer's speakers instead of headphones.
              </p>
            </div>
        </>
      ) : (
        <div className="flex flex-col items-center space-y-4">
           <CheckCircle className="h-12 w-12 text-green-500"/>
           <p className="font-semibold">Recording saved!</p>
          <audio src={URL.createObjectURL(audioBlob)} controls className="w-full" />
          <Button onClick={resetRecording} variant="outline" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Record Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
