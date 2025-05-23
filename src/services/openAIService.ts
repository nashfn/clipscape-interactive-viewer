
import { toast } from "sonner";

// OpenAI API endpoints
const OPENAI_API_URL = "https://api.openai.com/v1";
const AUDIO_ENDPOINT = `${OPENAI_API_URL}/audio`;

// Real-time API for audio processing
export const processAudioRealtime = async (audioBlob: Blob, apiKey: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.wav");
    formData.append("model", "whisper-1");
    formData.append("language", "en");
    formData.append("response_format", "text");

    const response = await fetch(`${AUDIO_ENDPOINT}/transcriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Real-time audio processing failed: ${response.statusText}`);
    }

    // Extract text directly from the response
    return await response.text();
  } catch (error) {
    console.error("Error processing audio:", error);
    toast.error("Failed to process audio");
    return "";
  }
};

// Stream audio to OpenAI in real-time
export const streamAudioToOpenAI = () => {
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];
  let isRecording = false;

  const startStreaming = async (apiKey: string, onTranscriptionReceived: (text: string) => void) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Use a supported audio format by OpenAI (wav)
      mediaRecorder = new MediaRecorder(stream, { 
        mimeType: 'audio/wav' 
      });
      
      // If the browser doesn't support wav, try webm
      if (!MediaRecorder.isTypeSupported('audio/wav')) {
        mediaRecorder = new MediaRecorder(stream, { 
          mimeType: 'audio/webm' 
        });
      }
      
      audioChunks = [];
      isRecording = true;

      // Collect audio in chunks and send at short intervals
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
          
          // Send the audio chunks every second
          if (audioChunks.length > 0 && isRecording) {
            try {
              // Convert to a supported format before sending
              const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
              
              // Create an audio element to convert the format if needed
              const audioElement = new Audio();
              audioElement.src = URL.createObjectURL(audioBlob);
              
              // Wait for the audio to load
              await new Promise(resolve => {
                audioElement.oncanplaythrough = resolve;
                audioElement.load();
              });
              
              // Get audio data in a format OpenAI accepts
              const audioContext = new AudioContext();
              const audioSource = audioContext.createMediaElementSource(audioElement);
              const destination = audioContext.createMediaStreamDestination();
              audioSource.connect(destination);
              
              const mediaRecorderWav = new MediaRecorder(destination.stream, {
                mimeType: 'audio/wav'
              });
              
              const wavChunks: Blob[] = [];
              
              mediaRecorderWav.ondataavailable = e => {
                if (e.data.size > 0) wavChunks.push(e.data);
              };
              
              mediaRecorderWav.onstop = async () => {
                const wavBlob = new Blob(wavChunks, { type: "audio/wav" });
                const text = await processAudioRealtime(wavBlob, apiKey);
                if (text.trim()) {
                  onTranscriptionReceived(text);
                }
              };
              
              // Start recording the properly formatted audio
              mediaRecorderWav.start();
              audioElement.play();
              
              // Stop after a short duration
              setTimeout(() => {
                mediaRecorderWav.stop();
              }, 500);
              
              // Clear the chunks after processing
              audioChunks = [];
            } catch (error) {
              console.error("Error processing audio chunk:", error);
            }
          }
        }
      };

      // Set a shorter timeslice to get audio chunks more frequently
      mediaRecorder.start(1000); // Get data every 1 second
      toast.success("Started listening...");
      
      return stream;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone");
      return null;
    }
  };

  const stopStreaming = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      isRecording = false;
      
      // Stop all audio tracks
      if (mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
      
      // Process any remaining audio chunks
      return new Blob(audioChunks, { type: "audio/wav" });
    }
    return null;
  };

  return {
    startStreaming,
    stopStreaming,
    isStreaming: () => isRecording
  };
};

// Keep transcribeAudio for backward compatibility
export const transcribeAudio = processAudioRealtime;

export const synthesizeSpeech = async (
  text: string, 
  apiKey: string,
  voice = "alloy"
): Promise<ArrayBuffer | null> => {
  try {
    const response = await fetch(`${AUDIO_ENDPOINT}/speech`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        voice,
        input: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Speech synthesis failed: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error("Error synthesizing speech:", error);
    toast.error("Failed to generate speech");
    return null;
  }
};

export const chatWithGPT = async (
  message: string,
  apiKey: string
): Promise<string> => {
  try {
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant for The Entity, a movie database application. Provide concise, informative responses about movies, actors, directors, and film history. Keep responses under 150 words."
          },
          { role: "user", content: message }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat completion failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error getting chat completion:", error);
    toast.error("Failed to get response");
    return "I'm sorry, I couldn't process your request at this time.";
  }
};
