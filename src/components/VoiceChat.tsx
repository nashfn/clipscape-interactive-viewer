
import React, { useState, useRef, useEffect } from "react";
import AudioInput from "./AudioInput";
import { processAudioRealtime, chatWithGPT, synthesizeSpeech } from "@/services/openAIService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const VoiceChat: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [isApiKeySet, setIsApiKeySet] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transcription, setTranscription] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check for saved API key in localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem("openai_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsApiKeySet(true);
      setShowApiKeyInput(false);
    }
  }, []);

  const handleApiKeySubmit = () => {
    if (apiKey.trim().startsWith("sk-")) {
      localStorage.setItem("openai_api_key", apiKey);
      setIsApiKeySet(true);
      setShowApiKeyInput(false);
      toast.success("API key saved");
    } else {
      toast.error("Please enter a valid OpenAI API key starting with 'sk-'");
    }
  };

  const handleTranscriptionComplete = async (audioBlob: Blob) => {
    if (!audioBlob || !isApiKeySet) return;
    
    setIsProcessing(true);
    
    try {
      // Step 1: Process the audio using the real-time API
      const text = await processAudioRealtime(audioBlob, apiKey);
      setTranscription(text);
      
      if (!text) {
        setIsProcessing(false);
        return;
      }
      
      // Step 2: Get response from GPT-4o
      const aiResponse = await chatWithGPT(text, apiKey);
      setResponse(aiResponse);
      
      // Step 3: Synthesize speech from response
      const speechAudio = await synthesizeSpeech(aiResponse, apiKey);
      
      if (speechAudio) {
        // Create audio blob and play it
        const audioBlob = new Blob([speechAudio], { type: "audio/mpeg" });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
        }
      }
    } catch (error) {
      console.error("Error in processing voice chat:", error);
      toast.error("An error occurred during processing");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {showApiKeyInput ? (
        <Card className="fixed bottom-6 left-6 z-50 w-72 animate-fade-in">
          <CardContent className="p-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Enter OpenAI API Key</h3>
              <input
                type="password"
                className="w-full p-2 border rounded bg-background"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setShowApiKeyInput(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleApiKeySubmit}>Save Key</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {response && (
            <Card className="fixed bottom-6 left-6 z-50 w-72 max-w-md animate-fade-in">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">You said:</p>
                  <p className="text-sm italic">{transcription}</p>
                  <p className="text-sm font-medium mt-2">Response:</p>
                  <p className="text-sm">{response}</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          <AudioInput 
            onTranscriptionComplete={handleTranscriptionComplete}
            isProcessing={isProcessing} 
          />
          
          {!isApiKeySet && (
            <Button
              className="fixed bottom-6 left-6 z-50 animate-fade-in"
              onClick={() => setShowApiKeyInput(true)}
            >
              Set API Key
            </Button>
          )}
          
          <audio ref={audioRef} className="hidden" />
        </>
      )}
    </>
  );
};

export default VoiceChat;
