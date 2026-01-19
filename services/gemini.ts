
import { GoogleGenAI, GenerateContentResponse, LiveServerMessage, Modality, Blob } from "@google/genai";
import { Role, Message } from "../types";

// Note: API_KEY is handled by the environment
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Sends a streaming chat request to Gemini
 */
export async function* streamChat(history: Message[], userInput: string) {
  const ai = getAIClient();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'You are Gemini Pulse, a helpful and intelligent AI assistant integrated into a high-performance chat application. Be concise, expert-level, and friendly.',
    },
  });

  // Convert history to Gemini format (excluding the very last message which we are sending)
  // Gemini's history expects an array of { role, parts: [{ text }] }
  
  const responseStream = await chat.sendMessageStream({ message: userInput });

  for await (const chunk of responseStream) {
    const c = chunk as GenerateContentResponse;
    yield c.text || '';
  }
}

/**
 * Simple non-streaming chat for quick responses
 */
export async function simpleChat(prompt: string): Promise<string> {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });
  return response.text || "I'm sorry, I couldn't process that.";
}

/**
 * Audio Utility functions for Live API
 */
export function encodeAudio(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeAudio(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
