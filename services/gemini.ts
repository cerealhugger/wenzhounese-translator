
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { TranslationResult } from "../types";

const API_KEY = process.env.API_KEY || "";

/**
 * Maps Wenzhounese Audio to Mandarin Text, then Target Language.
 * We use 'gemini-3-flash-preview' as it is a multimodal model supporting audio input via generateContent.
 */
export async function translateWenzhounese(
  audioBase64: string,
  targetLang: string
): Promise<TranslationResult> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: "audio/webm",
              data: audioBase64
            }
          },
          {
            text: `This is audio in Wenzhounese (Ou Chinese). 
            1. Transcribe the meaning of this Wenzhounese audio into standard Mandarin Chinese.
            2. Translate that Mandarin meaning into the target language: ${targetLang}.
            Return the output as a JSON object with properties 'wenzhouMandarin' and 'targetTranslation'.`
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          wenzhouMandarin: { 
            type: Type.STRING,
            description: "The transcription of the Wenzhounese audio into Mandarin Chinese"
          },
          targetTranslation: { 
            type: Type.STRING,
            description: "The translation from Mandarin into the target language"
          }
        },
        required: ["wenzhouMandarin", "targetTranslation"]
      }
    }
  });

  const result = JSON.parse(response.text || "{}");
  return result as TranslationResult;
}

/**
 * Text-to-Speech service using Gemini's native TTS capability.
 */
export async function generateSpeech(text: string, voice: string = 'Kore'): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio || "";
}
