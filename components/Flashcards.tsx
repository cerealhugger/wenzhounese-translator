
import React, { useState } from 'react';
import { FLASHCARDS, ICONS } from '../constants';

const Flashcards: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const card = FLASHCARDS[currentIndex];

  const handleRecord = () => {
    setIsRecording(true);
    // Simulate recording duration
    setTimeout(() => {
      setIsRecording(false);
      // Logic would be to upload audio blob to backend for model training
      alert("录音已保存！谢谢您的帮助。\nRecording saved! Thank you for your help.");
      if (currentIndex < FLASHCARDS.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setCompletedCount(completedCount + 1);
      } else {
        setCompletedCount(completedCount + 1);
      }
    }, 2000);
  };

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
                <p className="text-lg font-bold text-slate-800">{completedCount} / {FLASHCARDS.length}</p>
             </div>
          </div>
          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
                className="h-full bg-green-500 transition-all duration-500" 
                style={{ width: `${(completedCount / FLASHCARDS.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex-1 flex flex-col items-center justify-center pb-24">
        {completedCount < FLASHCARDS.length ? (
          <div className="w-full bg-white rounded-[2.5rem] p-1 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <img 
              src={card.image} 
              alt={card.mandarin} 
              className="w-full h-48 object-cover rounded-t-[2.5rem]" 
            />
            <div className="p-8 text-center space-y-6">
              <div>
                <span className="text-sm font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full">{card.category}</span>
                <h3 className="text-4xl font-black text-slate-900 mt-4 tracking-tight">{card.mandarin}</h3>
                <p className="text-slate-400 mt-2 text-lg">请问这个词温州话怎么说？</p>
                <p className="text-slate-300 text-sm">(How do you say this in Wenzhounese?)</p>
              </div>

              {/* Huge Record Button */}
              <button
                onClick={handleRecord}
                disabled={isRecording}
                className={`
                  w-full py-8 rounded-3xl flex flex-col items-center gap-2 transition-all shadow-xl active:scale-95
                  ${isRecording 
                    ? 'bg-red-500 animate-pulse text-white' 
                    : 'bg-blue-600 text-white'
                  }
                `}
              >
                <ICONS.Mic className="w-12 h-12" />
                <span className="text-xl font-black">
                  {isRecording ? '录音中...' : '点击并录音'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center p-12 bg-white rounded-3xl shadow-xl border border-slate-100">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ICONS.Check className="w-12 h-12" />
            </div>
            <h3 className="text-3xl font-black text-slate-800">全部完成！</h3>
            <p className="text-slate-500 mt-4 text-xl">您太棒了！这些数据将帮助我们改进翻译系统。</p>
            <button 
                onClick={() => {
                    setCurrentIndex(0);
                    setCompletedCount(0);
                }}
                className="mt-8 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg"
            >
                再次参与 (Do again)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcards;
