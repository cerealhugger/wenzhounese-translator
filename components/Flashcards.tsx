import React, { useMemo, useRef, useState } from "react";
import { FLASHCARDS, ICONS } from "../constants";

type RecordPhase = "idle" | "recording" | "review" | "submitting";

const Flashcards: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const [phase, setPhase] = useState<RecordPhase>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const card = FLASHCARDS[currentIndex];

  const progressPct = useMemo(() => {
    if (FLASHCARDS.length === 0) return 0;
    return (completedCount / FLASHCARDS.length) * 100;
  }, [completedCount]);

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const resetRecordingState = () => {
    audioChunksRef.current = [];
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setErrorMsg(null);
    setPhase("idle");
  };

  const startRecording = async () => {
    try {
      setErrorMsg(null);

      // If user recorded before but didn’t submit, reset for a new take
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setAudioBlob(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setPhase("review");
        cleanupStream();
      };

      mediaRecorder.start();
      setPhase("recording");
    } catch (err) {
      console.error("startRecording error:", err);
      setErrorMsg("请允许麦克风访问 (Please allow microphone access)");
      cleanupStream();
      setPhase("idle");
    }
  };

  const stopRecording = () => {
    if (phase !== "recording") return;
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      // onstop will transition to review + cleanup stream
    }
  };

  /**
   * Upload placeholder:
   * - If you have a backend: point this to your real endpoint.
   * - If not yet: you can keep this stub and just "simulate" success.
   */
  const uploadAudio = async (blob: Blob, meta: { mandarin: string; category: string; index: number }) => {
    // Example: POST multipart form-data
    const form = new FormData();
    form.append("audio", blob, `flashcard_${meta.index}.webm`);
    form.append("mandarin", meta.mandarin);
    form.append("category", meta.category);
    form.append("index", String(meta.index));

    // TODO: replace with your real endpoint
    // If you don't have backend yet, you can comment this out and just return.
    const res = await fetch("/api/learn/upload", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || "Upload failed");
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob || phase !== "review") return;

    setPhase("submitting");
    setErrorMsg(null);

    try {
      await uploadAudio(audioBlob, {
        mandarin: card.mandarin,
        category: card.category,
        index: currentIndex,
      });

      alert("已提交！谢谢您的帮助。\nSubmitted! Thank you for your help.");

      // Advance + progress
      setCompletedCount((c) => c + 1);

      // Move to next card (or finish)
      if (currentIndex < FLASHCARDS.length - 1) {
        setCurrentIndex((i) => i + 1);
        // Reset for next card
        resetRecordingState();
      } else {
        // Finished
        setPhase("idle");
      }
    } catch (err) {
      console.error("submit error:", err);
      setErrorMsg("提交失败，请重试 (Submit failed, please try again)");
      setPhase("review");
    }
  };

  const handleRedo = () => {
    // allow re-record for current card
    resetRecordingState();
  };

  const handleDoAgainAll = () => {
    // restart the entire set
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);

    setCurrentIndex(0);
    setCompletedCount(0);
    setErrorMsg(null);
    setPhase("idle");
  };

  const isDone = completedCount >= FLASHCARDS.length;

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">温州话收集计画</h2>
        <p className="text-slate-500 text-sm">帮助我们让机器学会说温州话</p>

        <div className="mt-4 bg-white rounded-2xl p-4 flex items-center justify-between border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <ICONS.Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">已贡献词汇</p>
              <p className="text-lg font-bold text-slate-800">
                {completedCount} / {FLASHCARDS.length}
              </p>
            </div>
          </div>

          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center pb-24">
        {!isDone ? (
          <div className="w-full bg-white rounded-[2.5rem] p-1 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <img src={card.image} alt={card.mandarin} className="w-full h-48 object-cover rounded-t-[2.5rem]" />

            <div className="p-8 text-center space-y-6">
              <div>
                <span className="text-sm font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full">{card.category}</span>
                <h3 className="text-4xl font-black text-slate-900 mt-4 tracking-tight">{card.mandarin}</h3>
                <p className="text-slate-400 mt-2 text-lg">请问这个词温州话怎么说？</p>
                <p className="text-slate-300 text-sm">(How do you say this in Wenzhounese?)</p>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm">
                  {errorMsg}
                </div>
              )}

              {/* Recording / Review controls */}
              {phase === "idle" && (
                <button
                  onClick={startRecording}
                  className="w-full py-8 rounded-3xl flex flex-col items-center gap-2 transition-all shadow-xl active:scale-95 bg-blue-600 text-white"
                >
                  <ICONS.Mic className="w-12 h-12" />
                  <span className="text-xl font-black">点击并录音</span>
                  <span className="text-sm opacity-90">(Tap to start recording)</span>
                </button>
              )}

              {phase === "recording" && (
                <button
                  onClick={stopRecording}
                  className="w-full py-8 rounded-3xl flex flex-col items-center gap-2 transition-all shadow-xl active:scale-95 bg-red-500 text-white animate-pulse"
                >
                  <ICONS.Mic className="w-12 h-12" />
                  <span className="text-xl font-black">录音中... 点击停止</span>
                  <span className="text-sm opacity-90">(Recording… Tap to stop)</span>
                </button>
              )}

              {phase === "review" && (
                <div className="space-y-4">
                  {/* Playback */}
                  {audioUrl && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                      <p className="text-slate-600 font-bold mb-2">回放 (Playback)</p>
                      <audio controls src={audioUrl} className="w-full" />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleRedo}
                      className="py-4 rounded-2xl font-bold bg-slate-100 text-slate-700 active:scale-95 transition-transform"
                    >
                      重录 (Redo)
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="py-4 rounded-2xl font-bold bg-blue-600 text-white shadow-lg active:scale-95 transition-transform"
                    >
                      确认并提交 (Submit)
                    </button>
                  </div>

                  <p className="text-xs text-slate-400">
                    提交前请先回放确认录音清晰～ (Please playback to confirm before submitting.)
                  </p>
                </div>
              )}

              {phase === "submitting" && (
                <div className="flex flex-col items-center space-y-3 py-6">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-blue-600 font-bold">提交中...</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center p-12 bg-white rounded-3xl shadow-xl border border-slate-100">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ICONS.Check className="w-12 h-12" />
            </div>
            <h3 className="text-3xl font-black text-slate-800">全部完成！</h3>
            <p className="text-slate-500 mt-4 text-xl">您太棒了！这些数据将帮助我们改进翻译系统。</p>
            <button onClick={handleDoAgainAll} className="mt-8 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg">
              再次参与 (Do again)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcards;
