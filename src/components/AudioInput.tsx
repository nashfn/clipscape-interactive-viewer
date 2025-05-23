
import React, { useState, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

interface AudioInputProps {
  onTranscriptionComplete: (audioBlob: Blob) => void;
  isProcessing: boolean;
}

const AudioInput: React.FC<AudioInputProps> = ({ onTranscriptionComplete, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        onTranscriptionComplete(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
      
      toast.info("Processing your audio...");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        size="lg"
        variant={isRecording ? "destructive" : "default"}
        className={`rounded-full p-4 h-14 w-14 shadow-lg ${
          isRecording ? "animate-pulse" : "hover:scale-105"
        } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
      >
        {isRecording ? (
          <MicOff className="h-6 w-6" />
        ) : (
          <Mic className={`h-6 w-6 ${isProcessing ? "" : "mic-animation"}`} />
        )}
      </Button>
      
      {audioBlob && !isRecording && !isProcessing && (
        <Card className="mt-4 p-2 animate-fade-in">
          <audio className="w-full" controls src={URL.createObjectURL(audioBlob)} />
        </Card>
      )}
    </div>
  );
};

export default AudioInput;
