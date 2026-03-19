import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Database,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { DataRow, DataStats, CleaningReport, ChatMessage } from './types';
import { cleanData, calculateStats } from './utils/dataCleaner';
import { getAIInsights } from './services/gemini';
import { translations } from './translations';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';
import { Chat } from './components/Chat';

export default function App() {
  const [data, setData] = useState<DataRow[]>([]);
  const [cleanedData, setCleanedData] = useState<DataRow[]>([]);
  const [stats, setStats] = useState<DataStats | null>(null);
  const [report, setReport] = useState<CleaningReport | null>(null);
  const [insights, setInsights] = useState<string[] | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lang, setLang] = useState<'so' | 'en'>('so');
  const t = translations[lang];
  
  // Analysis flow states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  
  // Pre-upload & Chat state
  const [preUploadPrompt, setPreUploadPrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Update AI content when language changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      // Update welcome message if it's the first message
      setChatHistory(prev => {
        return prev.map(msg => {
          if (msg.type === 'welcome') {
            return { ...msg, content: [translations[lang].welcomeAnalyst] };
          }
          return msg;
        });
      });
    }

    // Re-fetch insights if analysis was already complete
    if (analysisComplete && stats) {
      const updateInsights = async () => {
        try {
          const aiInsights = await getAIInsights(stats, preUploadPrompt || t.generalAnalysis, lang);
          setInsights(aiInsights);
          // Also update the analysis message in chat history if it exists
          setChatHistory(prev => {
            return prev.map(msg => {
              if (msg.type === 'analysis') {
                return { ...msg, content: aiInsights };
              }
              return msg;
            });
          });
        } catch (error) {
          console.error('Language update analysis error:', error);
        }
      };
      updateInsights();
    }
  }, [lang]);

  const handleFileUpload = async (file: File) => {
    const fileName = file.name.toLowerCase();
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    const isCSV = fileName.endsWith('.csv');
    const isJSON = fileName.endsWith('.json');
    const isXML = fileName.endsWith('.xml');
    const isText = fileName.endsWith('.txt') || fileName.endsWith('.log') || fileName.endsWith('.sql');

    if (!isExcel && !isCSV && !isJSON && !isText && !isXML) {
      alert(t.unsupportedFile);
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result;
        let rawData: DataRow[] = [];

        if (isExcel) {
          const XLSX = await import('xlsx');
          const wb = XLSX.read(content, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          rawData = XLSX.utils.sheet_to_json(ws) as DataRow[];
        } else if (isCSV) {
          const Papa = (await import('papaparse')).default;
          const text = content as string;
          const result = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true });
          rawData = result.data as DataRow[];
        } else if (isXML) {
          const text = content as string;
          // Very basic XML to JSON-like array conversion for simple structures
          const rows: DataRow[] = [];
          const matches = text.match(/<row>([\s\S]*?)<\/row>/g) || text.match(/<item>([\s\S]*?)<\/item>/g);
          if (matches) {
            matches.forEach(match => {
              const row: DataRow = {};
              const fields = match.match(/<(\w+)>([\s\S]*?)<\/\1>/g);
              fields?.forEach(field => {
                const tagName = field.match(/<(\w+)>/)?.[1];
                const value = field.match(/>([\s\S]*?)</)?.[1];
                if (tagName && value) row[tagName] = value;
              });
              rows.push(row);
            });
          }
          rawData = rows;
        } else if (isText) {
          const lines = (content as string).split('\n').filter(l => l.trim());
          rawData = lines.map((line, index) => ({ line_number: index + 1, content: line }));
        }
        
        if (rawData.length === 0) {
          throw new Error(t.noDataFound);
        }

        setData(rawData);
        
        const { cleanedData: cleaned, report: cleanReport } = cleanData(rawData);
        setCleanedData(cleaned);
        setReport(cleanReport);
        
        const dataStats = calculateStats(cleaned);
        setStats(dataStats);
        
        // Initial welcome message from AI
        setChatHistory([{
          role: 'ai',
          content: [translations[lang].welcomeAnalyst],
          timestamp: Date.now(),
          type: 'welcome'
        }]);
      } catch (error) {
        console.error('File parsing error:', error);
        alert(t.parsingError + (error instanceof Error ? error.message : t.unknownError));
      } finally {
        setLoading(false);
      }
    };

    if (isExcel) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, []);

  const runFullAnalysis = async () => {
    if (!stats) return;
    setIsAnalyzing(true);
    try {
      const aiInsights = await getAIInsights(stats, preUploadPrompt || t.generalAnalysis, lang);
      setInsights(aiInsights);
      setChatHistory(prev => [...prev, {
        role: 'ai',
        content: aiInsights,
        timestamp: Date.now(),
        type: 'analysis'
      }]);
      setAnalysisComplete(true);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAskAI = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToUse = customPrompt || userPrompt;
    if (!promptToUse.trim() || !stats) return;

    const newUserMessage: ChatMessage = {
      role: 'user',
      content: [promptToUse],
      timestamp: Date.now(),
      type: 'chat'
    };

    setChatHistory(prev => [...prev, newUserMessage]);
    setIsAskingAI(true);
    setUserPrompt('');

    try {
      const promptForAI = preUploadPrompt 
        ? `${t.userQuestion}${promptToUse}${t.previousGoal}${preUploadPrompt}`
        : promptToUse;

      const chatResponse = await getAIInsights(
        stats, 
        preUploadPrompt || t.generalAnalysis, 
        lang,
        promptForAI, 
        [...chatHistory, newUserMessage]
      );
      setChatHistory(prev => [...prev, {
        role: 'ai',
        content: chatResponse,
        timestamp: Date.now(),
        type: 'chat'
      }]);
    } catch (error) {
      console.error('AI Chat Error:', error);
    } finally {
      setIsAskingAI(false);
    }
  };

  const referenceChart = (columnName: string, type: string) => {
    const prompt = t.chartExplanationPrompt
      .replace('{column}', columnName)
      .replace('{type}', type);
    handleAskAI(undefined, prompt);
    
    // Scroll to chat
    const chatElement = document.getElementById('ai-chat-section');
    if (chatElement) {
      chatElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const downloadCleanedData = async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(cleanedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cleaned Data");
    XLSX.writeFile(wb, "cleaned_data.xlsx");
  };

  const reset = () => {
    setData([]);
    setCleanedData([]);
    setStats(null);
    setReport(null);
    setInsights(null);
    setChatHistory([]);
    setUserPrompt('');
    setPreUploadPrompt('');
    setShowPromptInput(false);
    setAnalysisComplete(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#0A0A0A] text-[#1A1A1A] dark:text-[#F5F5F5] font-sans selection:bg-emerald-100 dark:selection:bg-emerald-900/30 transition-colors duration-300">
      <Navbar 
        appName={t.appName}
        resetLabel={t.reset}
        toggleThemeLabel={t.toggleTheme}
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        lang={lang} 
        setLang={setLang} 
        dataLength={data.length} 
        onReset={reset} 
      />

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <AnimatePresence mode="wait">
          {data.length === 0 ? (
            <Hero 
              t={t}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              onDrop={onDrop}
              fileInputRef={fileInputRef}
              handleFileUpload={handleFileUpload}
              preUploadPrompt={preUploadPrompt}
              setPreUploadPrompt={setPreUploadPrompt}
              showPromptInput={showPromptInput}
              setShowPromptInput={setShowPromptInput}
            />
          ) : loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32"
            >
              <div className="relative">
                <div className="w-20 h-20 border-4 border-emerald-100 dark:border-emerald-900/30 border-t-emerald-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Database className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mt-8 mb-2 dark:text-white">{t.loading}</h2>
              <p className="text-gray-500 dark:text-gray-400">{t.loadingDesc}</p>
            </motion.div>
          ) : (
            <div className="space-y-10">
              <Dashboard 
                t={t}
                stats={stats}
                report={report}
                insights={insights}
                cleanedData={cleanedData}
                analysisComplete={analysisComplete}
                isAnalyzing={isAnalyzing}
                runFullAnalysis={runFullAnalysis}
                downloadCleanedData={downloadCleanedData}
                referenceChart={referenceChart}
                darkMode={darkMode}
              />
              
              <Chat 
                t={t}
                chatHistory={chatHistory}
                isAskingAI={isAskingAI}
                userPrompt={userPrompt}
                setUserPrompt={setUserPrompt}
                handleAskAI={handleAskAI}
              />
            </div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-16 border-t border-gray-50 dark:border-white/5 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-30 dark:opacity-20 dark:text-white">
            <Database className="w-6 h-6" />
            <span className="text-xl font-bold tracking-tighter">{t.appName}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm font-medium text-gray-400 dark:text-gray-500">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t.product}</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t.security}</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t.privacy}</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t.support}</a>
          </div>
          <p className="text-sm text-gray-300 dark:text-gray-600">
            &copy; 2026 {t.appName} {t.intelligence}.
          </p>
        </div>
      </footer>
    </div>
  );
}
