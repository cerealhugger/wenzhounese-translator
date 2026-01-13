
import React, { useState, useRef, useCallback } from 'react';
import { LANGUAGES, ICONS } from '../constants';
import { translateWenzhounese, generateSpeech } from '../services/gemini';
import { TranslationResult } from '../types';

const Translator: React.FC = () => {
  const [targetLang, setTargetLang] = useState(LANGUAGES[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          processTranslation(base64Audio);
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      setResult(null);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('请允许麦克风访问 (Please allow microphone access)');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      // Stop all tracks to release mic
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const processTranslation = async (base64Audio: string) => {
    try {
      const translation = await translateWenzhounese(base64Audio, targetLang.name);
      
      // Optionally generate speech automatically for the senior
      const audio = await generateSpeech(translation.targetTranslation);
      
      setResult({ ...translation, targetAudio: audio });
    } catch (error) {
      console.error('Translation error:', error);
      alert('翻译失败，请重试 (Translation failed, please try again)');
    } finally {
      setIsProcessing(false);
    }
  };

  const playTranslation = async () => {
    if (result?.targetAudio) {
      const audio = new Audio(`data:audio/pcm;base64,${result.targetAudio}`);
      // NOTE: In a real app we'd decode the raw PCM. For this demo, we assume the helper or a simplified wrapper.
      // Since generateSpeech returns raw PCM for Live API, but standard TTS is usually encapsulated.
      // For simplicity in this demo, let's play the generated text using standard Web Speech API as a fallback if PCM fails.
      const utterance = new SpeechSynthesisUtterance(result.targetTranslation);
      utterance.lang = targetLang.code;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col h-full px-6 py-4 bg-slate-50">
      {/* Language Dropdown - Centered Top */}
      <div className="flex justify-center mb-8">
        <div className="relative inline-block w-full max-w-xs">
          <select 
            value={targetLang.code}
            onChange={(e) => setTargetLang(LANGUAGES.find(l => l.code === e.target.value) || LANGUAGES[0])}
            className="w-full bg-white border-2 border-slate-200 rounded-2xl px-6 py-4 text-lg font-bold shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
             <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
             </svg>
          </div>
        </div>
      </div>

      {/* Results Card */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        {!result && !isProcessing && (
          <div className="text-center animate-pulse">
            <p className="text-slate-400 text-xl font-medium px-10">
              {isRecording ? "正在听..." : "按住下方按钮开始说话"}
            </p>
            <p className="text-slate-300 text-sm mt-2">
              (Hold button below to speak)
            </p>
          </div>
        )}

        {isProcessing && (
          <div className="flex flex-col items-center space-y-4">
             <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-blue-600 font-bold text-xl">翻译中...</p>
          </div>
        )}

        {result && (
          <div className="w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">温州话意思 (Wenzhounese Meaning)</span>
                <p className="text-2xl font-bold text-slate-800 leading-tight">
                  {result.wenzhouMandarin}
                </p>
              </div>
              <div className="h-px bg-slate-100 w-full"></div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400 block mb-1">翻译结果 (Translation)</span>
                <p className="text-3xl font-extrabold text-blue-600 leading-tight">
                  {result.targetTranslation}
                </p>
              </div>
              <button 
                onClick={playTranslation}
                className="w-full mt-4 flex items-center justify-center gap-3 py-4 bg-blue-50 text-blue-600 rounded-2xl font-bold active:scale-95 transition-transform"
              >
                <ICONS.Speaker className="w-6 h-6" />
                <span>再读一遍 (Speak)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Large Speaker Button - Bottom Half Thumb Area */}
      <div className="h-48 flex items-center justify-center pb-8">
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className={`
            w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 active:scale-90
            ${isRecording 
              ? 'bg-red-500 ring-8 ring-red-100 scale-110' 
              : 'bg-blue-600 hover:bg-blue-700 ring-8 ring-blue-50'
            }
          `}
        >
          {isRecording ? (
            <div className="w-12 h-12 bg-white rounded-md animate-pulse"></div>
          ) : (
            <ICONS.Mic className="w-16 h-16 text-white" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Translator;
