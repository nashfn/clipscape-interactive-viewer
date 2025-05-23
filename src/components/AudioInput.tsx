
import React, { useState, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { streamAudioToOpenAI } from "@/services/openAIService";

interface AudioInputProps {
  onTranscriptionComplete: (audioBlob: Blob) => void;
  onTranscriptionReceived?: (text: string) => void;
  isProcessing: boolean;
  apiKey: string;
}

const AudioInput: React.FC<AudioInputProps> = ({ 
  onTranscriptionComplete, 
  onTranscriptionReceived,
  isProcessing, 
  apiKey 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioStreamingRef = useRef(streamAudioToOpenAI());

  const startRecording = async () => {
    try {
      if (!apiKey) {
        toast.error("API key is required");
        return;
      }
      
      // Start streaming audio to OpenAI
      const stream = await audioStreamingRef.current.startStreaming(
        apiKey, 
        (text) => {
          // This callback is called when we get transcription from streaming
          if (onTranscriptionReceived) {
            onTranscriptionReceived(text);
          }
        }
      );
      
      if (stream) {
        streamRef.current = stream;
        setIsRecording(true);
      }
    } catch (error) {
      console.error("Error starting audio streaming:", error);
      toast.error("Could not start audio recording");
    }
  };

  const stopRecording = () => {
    if (isRecording) {
      // Stop streaming and get any final audio blob
      const finalBlob = audioStreamingRef.current.stopStreaming();
      
      if (finalBlob) {
        setAudioBlob(finalBlob);
        // Send the final blob for processing
        onTranscriptionComplete(finalBlob);
      }
      
      setIsRecording(false);
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
