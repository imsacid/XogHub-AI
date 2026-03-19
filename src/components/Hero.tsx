import React from 'react';
import { motion } from 'motion/react';
import { Upload, Sparkles, Settings2, ArrowRight, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HeroProps {
  t: any;
  preUploadPrompt: string;
  setPreUploadPrompt: (val: string) => void;
  showPromptInput: boolean;
  setShowPromptInput: (val: boolean) => void;
  isDragging: boolean;
  setIsDragging: (val: boolean) => void;
  onDrop: (e: React.DragEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (file: File) => void;
}

export const Hero: React.FC<HeroProps> = ({
  t,
  preUploadPrompt,
  setPreUploadPrompt,
  showPromptInput,
  setShowPromptInput,
  isDragging,
  setIsDragging,
  onDrop,
  fileInputRef,
  handleFileUpload
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="max-w-3xl mx-auto"
    >
      <div className="text-center mb-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-6"
        >
          <Sparkles className="w-4 h-4" />
          {t.professionalAnalyst}
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white leading-[1.1]">
          {t.heroTitle} <span className="text-emerald-600 dark:text-emerald-400">{t.heroHighlight}</span>
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed mb-12">
          {t.heroDesc}
        </p>

        {!preUploadPrompt && !showPromptInput ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-white dark:bg-white/5 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-white/5"
          >
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Settings2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3 dark:text-white">{t.goalTitle}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.goalSubtitle}</p>
            <button 
              onClick={() => setShowPromptInput(true)}
              className="w-full bg-emerald-600 dark:bg-emerald-500 text-white font-bold py-4 rounded-2xl hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200 dark:shadow-emerald-900/20 flex items-center justify-center gap-2"
            >
              {t.setGoal}
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        ) : (
          <div className="bg-white dark:bg-white/5 rounded-[2.5rem] p-4 shadow-2xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-white/5">
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={cn(
                "relative group cursor-pointer border-2 border-dashed rounded-[2rem] p-12 md:p-20 transition-all duration-500",
                isDragging ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10 scale-[1.01]" : "border-gray-100 dark:border-white/5 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-gray-50/50 dark:hover:bg-white/5"
              )}
              onClick={() => !showPromptInput && fileInputRef.current?.click()}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".xlsx, .xls, .csv, .json, .xml, .txt, .log, .sql" 
                className="hidden" 
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
              
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-24 h-24 rounded-3xl flex items-center justify-center mb-8 transition-all duration-500 shadow-xl",
                  isDragging ? "bg-emerald-600 text-white rotate-12" : "bg-white dark:bg-white/10 text-gray-400 dark:text-gray-500 group-hover:text-emerald-500 group-hover:-rotate-6"
                )}>
                  <Upload className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-3 dark:text-white">{t.dropTitle}</h3>
                <p className="text-gray-400 dark:text-gray-500 mb-10">{t.browse}</p>

                <div className="flex flex-col items-center gap-4 w-full max-w-md">
                  {showPromptInput ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full space-y-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <textarea 
                        value={preUploadPrompt}
                        onChange={(e) => setPreUploadPrompt(e.target.value)}
                        placeholder={t.goalPlaceholder}
                        className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all h-24 resize-none dark:text-white"
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 bg-emerald-600 dark:bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {t.uploadAndApply}
                        </button>
                        <button 
                          onClick={() => setShowPromptInput(false)}
                          className="px-4 py-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 font-medium"
                        >
                          {t.cancel}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 px-6 py-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 truncate max-w-[200px]">
                        {preUploadPrompt}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowPromptInput(true); }}
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline ml-2"
                      >
                        {t.changeGoal}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: t.lightningFast, desc: t.lightningFastDesc, icon: Zap },
          { title: t.secure, desc: t.secureDesc, icon: ShieldCheck },
          { title: t.aiPowered, desc: t.aiPoweredDesc, icon: Sparkles },
        ].map((feature, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
              <feature.icon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
