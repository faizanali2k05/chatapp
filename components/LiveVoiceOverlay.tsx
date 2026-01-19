
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { encodeAudio, decodeAudio, decodeAudioData } from '../services/gemini';

interface LiveVoiceOverlayProps {
  onClose: () => void;
}

const LiveVoiceOverlay: React.FC<LiveVoiceOverlayProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopConversation = () => {
    if (sessionRef.current) {
      // In a real implementation we would call session.close()
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
    setIsActive(false);
  };

  const startConversation = async () => {
    try {
      setIsConnecting(true);
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('Gemini Live session opened');
            setIsActive(true);
            setIsConnecting(false);

            // Audio Input streaming
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              
              const pcmBlob = {
                data: encodeAudio(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };

              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Transcription
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscript(prev => [...prev.slice(-4), `AI: ${text}`]);
            } else if (message.serverContent?.inputTranscription) {
               const text = message.serverContent.inputTranscription.text;
               setTranscript(prev => [...prev.slice(-4), `You: ${text}`]);
            }

            // Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const audioBuffer = await decodeAudioData(
                decodeAudio(base64Audio),
                outputCtx,
                24000,
                1,
              );
              
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              
              const startTime = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              source.start(startTime);
              nextStartTimeRef.current = startTime + audioBuffer.duration;
              
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Gemini Live Error', e);
            stopConversation();
          },
          onclose: () => {
            console.log('Gemini Live session closed');
            stopConversation();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: 'You are Gemini Live, an expert conversational AI. Keep responses naturally short as this is a voice conversation.',
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start Live API', err);
      setIsConnecting(false);
      alert('Could not access microphone or connect to Gemini API.');
    }
  };

  useEffect(() => {
    return () => stopConversation();
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl">
      <div className="w-full max-w-lg p-12 text-center flex flex-col items-center">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <div className="relative mb-12">
          {/* Animated rings */}
          <div className={`absolute inset-0 rounded-full bg-indigo-500/20 animate-ping duration-[3s] ${isActive ? 'scale-150' : 'scale-0'}`}></div>
          <div className={`absolute inset-0 rounded-full bg-indigo-500/10 animate-ping duration-[4s] ${isActive ? 'scale-125' : 'scale-0'}`}></div>
          
          <div className={`w-40 h-40 rounded-full flex items-center justify-center relative z-10 shadow-2xl transition-all duration-700 ${
            isActive ? 'bg-indigo-600 scale-110 shadow-indigo-600/50' : 'bg-slate-800 scale-100'
          }`}>
            <svg className={`w-16 h-16 text-white transition-all ${isActive ? 'scale-110' : 'scale-90 opacity-50'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
            </svg>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">
          {isConnecting ? 'Connecting...' : isActive ? 'Gemini is Listening' : 'Gemini Live'}
        </h2>
        <p className="text-slate-400 max-w-xs mb-8">
          {isActive ? 'Speak naturally. Gemini will respond instantly.' : 'Experience real-time, low-latency voice conversation with Gemini Pulse.'}
        </p>

        {transcript.length > 0 && (
          <div className="w-full bg-slate-900/50 rounded-2xl p-4 border border-slate-800 mb-8 min-h-[120px] text-left">
            <div className="text-[10px] uppercase text-slate-500 mb-2 font-bold tracking-widest">Live Transcript</div>
            <div className="space-y-1">
              {transcript.map((line, idx) => (
                <div key={idx} className={`text-sm ${line.startsWith('AI') ? 'text-indigo-400' : 'text-slate-300'}`}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          {!isActive ? (
            <button 
              onClick={startConversation}
              disabled={isConnecting}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-2"
            >
              {isConnecting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              Start Session
            </button>
          ) : (
            <button 
              onClick={stopConversation}
              className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold shadow-xl shadow-rose-600/30 transition-all active:scale-95"
            >
              End Conversation
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveVoiceOverlay;
