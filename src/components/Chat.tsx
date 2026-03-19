import React from 'react';
import { Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChatMessage } from '../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatProps {
  t: any;
  chatHistory: ChatMessage[];
  isAskingAI: boolean;
  userPrompt: string;
  setUserPrompt: (val: string) => void;
  handleAskAI: (e?: React.FormEvent) => void;
}

export const Chat: React.FC<ChatProps> = ({
  t,
  chatHistory,
  isAskingAI,
  userPrompt,
  setUserPrompt,
  handleAskAI
}) => {
  return (
    <div id="ai-chat-section" className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-100/50 dark:shadow-black/20">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-emerald-600 dark:bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20">
          <Sparkles className="text-white w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl font-bold dark:text-white">{t.deepDive}</h3>
          <p className="text-gray-400 dark:text-gray-500">{t.deepDiveDesc}</p>
        </div>
      </div>

      {/* Chat History */}
      <div className="space-y-6 mb-8 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
        {chatHistory.map((msg, i) => (
          <div 
            key={i} 
            className={cn(
              "flex flex-col gap-2 max-w-[85%]",
              msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <div className={cn(
              "px-6 py-4 rounded-3xl text-[0.95rem] leading-relaxed shadow-sm",
              msg.role === 'user' 
                ? "bg-emerald-600 dark:bg-emerald-500 text-white rounded-tr-none" 
                : "bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-white/5 rounded-tl-none"
            )}>
              <div className="space-y-2">
                {msg.content.map((insight, j) => (
                  <div key={j} className="flex gap-3">
                    {msg.role === 'ai' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 mt-2 shrink-0" />}
                    {insight}
                  </div>
                ))}
              </div>
            </div>
            <span className="text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest px-2">
              {msg.role === 'user' ? t.user : t.ai} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isAskingAI && (
          <div className="flex flex-col gap-2 max-w-[85%] mr-auto items-start">
            <div className="bg-gray-50 dark:bg-white/5 px-6 py-4 rounded-3xl rounded-tl-none border border-gray-100 dark:border-white/5">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleAskAI} className="relative group">
        <input 
          type="text"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder={t.askPlaceholder}
          className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[1.5rem] px-8 py-5 pr-20 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white dark:focus:bg-white/10 focus:border-emerald-500 transition-all text-lg dark:text-white"
          disabled={isAskingAI}
        />
        <button 
          type="submit"
          disabled={isAskingAI || !userPrompt.trim()}
          className={cn(
            "absolute right-3 top-3 bottom-3 px-6 rounded-2xl flex items-center justify-center transition-all",
            isAskingAI || !userPrompt.trim() ? "bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-gray-600" : "bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20"
          )}
        >
          {isAskingAI ? <RefreshCw className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
        </button>
      </form>
    </div>
  );
};
