import React from 'react';
import { Database, Sun, Moon, RefreshCw } from 'lucide-react';
import { cn } from '../utils/cn';

interface NavbarProps {
  appName: string;
  resetLabel: string;
  toggleThemeLabel: string;
  lang: 'so' | 'en';
  setLang: (lang: 'so' | 'en') => void;
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  dataLength: number;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  appName,
  resetLabel,
  toggleThemeLabel,
  lang,
  setLang,
  darkMode,
  setDarkMode,
  dataLength,
  onReset
}) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 px-6 py-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/20">
            <Database className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">{appName}</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all group"
            title={toggleThemeLabel}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-500 fill-amber-500/10 transition-transform group-hover:rotate-45" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700 fill-slate-700/10 transition-transform group-hover:-rotate-12" />
            )}
          </button>
          <div className="flex items-center bg-gray-50 dark:bg-white/5 rounded-lg p-1 border border-gray-100 dark:border-white/10">
            <button 
              onClick={() => setLang('so')}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-md transition-all",
                lang === 'so' ? "bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              )}
            >
              SO
            </button>
            <button 
              onClick={() => setLang('en')}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-md transition-all",
                lang === 'en' ? "bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              )}
            >
              EN
            </button>
          </div>
          {dataLength > 0 && (
            <button 
              onClick={onReset}
              className="text-sm font-medium text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">{resetLabel}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
