
import { toast } from "sonner";

// OpenAI API endpoints
const OPENAI_API_URL = "https://api.openai.com/v1";
const TRANSCRIPTION_ENDPOINT = `${OPENAI_API_URL}/audio/transcriptions`;
const TTS_ENDPOINT = `${OPENAI_API_URL}/audio/speech`;

export const transcribeAudio = async (audioBlob: Blob, apiKey: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");
    formData.append("model", "whisper-1");
    formData.append("language", "en");

    const response = await fetch(TRANSCRIPTION_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    toast.error("Failed to transcribe audio");
    return "";
  }
};

export const synthesizeSpeech = async (
  text: string, 
  apiKey: string,
  voice = "alloy"
): Promise<ArrayBuffer | null> => {
  try {
    const response = await fetch(TTS_ENDPOINT, {
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
