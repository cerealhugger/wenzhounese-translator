
import React, { useState } from 'react';
import { AppTab } from './types';
import Translator from './components/Translator';
import Flashcards from './components/Flashcards';
import { ICONS } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.TRANSLATE);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-xl relative overflow-hidden">
      {/* Header */}
      <header className="pt-12 pb-4 px-6 bg-white border-b border-slate-100 flex justify-between items-center z-10">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">温州话翻译器</h1>
        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
          Wenzhou Translator
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === AppTab.TRANSLATE ? <Translator /> : <Flashcards />}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="bg-white border-t border-slate-100 px-8 py-4 flex justify-around items-center safe-area-bottom">
        <button 
          onClick={() => setActiveTab(AppTab.TRANSLATE)}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === AppTab.TRANSLATE ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <ICONS.Mic className="w-7 h-7" />
          <span className="text-xs font-bold">翻译 (Translate)</span>
        </button>
        <button 
          onClick={() => setActiveTab(AppTab.LEARN)}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === AppTab.LEARN ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <ICONS.Book className="w-7 h-7" />
          <span className="text-xs font-bold">学习 (Learn)</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
