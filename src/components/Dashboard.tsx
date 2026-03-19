import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend
} from 'recharts';
import { 
  LayoutDashboard, 
  Download, 
  Sparkles, 
  RefreshCw, 
  FileText, 
  Database, 
  CheckCircle2, 
  Info, 
  ChevronRight, 
  MessageSquare, 
  BarChart3, 
  PieChart as PieChartIcon, 
  MousePointer2 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DataRow, DataStats, CleaningReport } from '../types';
import { CorrelationHeatmap } from './CorrelationHeatmap';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface DashboardProps {
  t: any;
  stats: DataStats | null;
  report: CleaningReport | null;
  insights: string[] | null;
  cleanedData: DataRow[];
  analysisComplete: boolean;
  isAnalyzing: boolean;
  runFullAnalysis: () => void;
  downloadCleanedData: () => void;
  referenceChart: (columnName: string, type: string) => void;
  darkMode: boolean;
}

export const Dashboard = memo(({ 
  t, 
  stats, 
  report, 
  insights, 
  cleanedData, 
  analysisComplete, 
  isAnalyzing,
  runFullAnalysis,
  downloadCleanedData,
  referenceChart,
  darkMode
}: DashboardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t.totalRows, value: stats?.totalRows || 0, icon: Database, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: t.totalColumns, value: stats?.totalColumns || 0, icon: LayoutDashboard, color: 'text-blue-600 dark:text-blue-400' },
          { label: t.missingValues, value: report?.missingValuesHandled || 0, icon: Info, color: 'text-amber-600 dark:text-amber-400' },
          { label: t.duplicatesRemoved, value: report?.duplicatesRemoved || 0, icon: CheckCircle2, color: 'text-purple-600 dark:text-purple-400' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-2xl bg-gray-50 dark:bg-white/5", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black dark:text-white">{stat.value.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {analysisComplete ? (
          <motion.div 
            key="analysis"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            {/* Insights Panel */}
            <div className="bg-emerald-600 dark:bg-emerald-500 rounded-[3rem] p-10 text-white shadow-2xl shadow-emerald-200 dark:shadow-emerald-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight">{t.aiInsights}</h2>
                  </div>
                  <button 
                    onClick={downloadCleanedData}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    {t.exportData}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {insights?.map((insight, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:bg-white/15 transition-colors cursor-default group"
                    >
                      <div className="flex gap-4">
                        <div className="mt-1">
                          <div className="w-2 h-2 bg-white rounded-full group-hover:scale-150 transition-transform" />
                        </div>
                        <p className="text-lg font-medium leading-relaxed opacity-90">{insight}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Correlation Heatmap */}
              {stats?.correlationMatrix && (
                <div className="lg:col-span-2">
                  <CorrelationHeatmap 
                    data={stats.correlationMatrix} 
                    t={t} 
                    darkMode={darkMode} 
                  />
                </div>
              )}

              {Object.entries(stats?.columnStats || {})
                .filter(([_, s]) => (s as any).type === 'numeric')
                .slice(0, 2)
                .map(([col, s]: [string, any]) => (
                  <div key={col} className="bg-white dark:bg-white/5 p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h3 className="text-xl font-bold capitalize dark:text-white">{col} {t.distribution}</h3>
                        <div className="flex gap-4 mt-1">
                          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{t.mean}: {s.mean?.toFixed(2)}</span>
                          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{t.sum}: {s.sum?.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => referenceChart(col, 'bar')}
                          className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors group/btn"
                          title={t.askChart}
                        >
                          <MessageSquare className="w-5 h-5" />
                        </button>
                        <BarChart3 className="text-gray-300 dark:text-gray-600 w-6 h-6" />
                      </div>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cleanedData.slice(0, 20)}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1F2937" : "#f9fafb"} />
                          <XAxis dataKey={Object.keys(cleanedData[0])[0]} hide />
                          <YAxis stroke={darkMode ? "#4B5563" : "#D1D5DB"} fontSize={11} tickLine={false} axisLine={false} />
                          <Tooltip 
                            cursor={{ fill: darkMode ? "#1F2937" : "#f9fafb" }}
                            contentStyle={{ 
                              borderRadius: '16px', 
                              border: 'none', 
                              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                              padding: '12px 16px',
                              backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                              color: darkMode ? '#FFFFFF' : '#1A1A1A'
                            }} 
                          />
                          <Bar dataKey={col} fill="#10b981" radius={[6, 6, 0, 0]} barSize={32} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}

              {Object.entries(stats?.columnStats || {})
                .filter(([_, s]) => (s as any).type === 'categorical' && (s as any).uniqueValues > 1 && (s as any).uniqueValues < 10)
                .slice(0, 2)
                .map(([col, s]: [string, any]) => (
                  <div key={col} className="bg-white dark:bg-white/5 p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h3 className="text-xl font-bold capitalize dark:text-white">{col} {t.breakdown}</h3>
                        <p className="text-sm text-gray-400 dark:text-gray-500">{s.uniqueValues} {t.uniqueCategories}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => referenceChart(col, 'pie')}
                          className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors group/btn"
                          title={t.askChart}
                        >
                          <MessageSquare className="w-5 h-5" />
                        </button>
                        <PieChartIcon className="text-gray-300 dark:text-gray-600 w-6 h-6" />
                      </div>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={s.topValues}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={8}
                            dataKey="count"
                            nameKey="value"
                            stroke="none"
                          >
                            {s.topValues?.map((_: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '16px', 
                              border: 'none', 
                              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                              backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                              color: darkMode ? '#FFFFFF' : '#1A1A1A'
                            }} 
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            iconType="circle" 
                            wrapperStyle={{ paddingTop: '20px' }} 
                            formatter={(value: string) => <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-white/5 rounded-[3rem] border border-dashed border-gray-200 dark:border-white/10"
          >
            <div className="w-20 h-20 bg-white dark:bg-white/10 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
              <MousePointer2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-bounce" />
            </div>
            <h3 className="text-2xl font-bold mb-2 dark:text-white">{t.readyForAnalysis}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm text-center">
              {t.readyDesc}
            </p>
            <button 
              onClick={runFullAnalysis}
              disabled={isAnalyzing}
              className="bg-emerald-600 dark:bg-emerald-500 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200 dark:shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              {isAnalyzing ? t.analyzing : t.runAnalysis}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Preview Table */}
      <div className="bg-white dark:bg-white/5 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 dark:border-white/5 flex justify-between items-center bg-gray-50/30 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <h3 className="text-xl font-bold dark:text-white">{t.dataPreview}</h3>
          </div>
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-white dark:bg-white/10 px-3 py-1 rounded-full border border-gray-100 dark:border-white/10">
            {t.topRows}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                {Object.keys(cleanedData[0] || {}).map(col => (
                  <th key={col} className="px-8 py-5 text-[0.7rem] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em] border-b border-gray-50 dark:border-white/5 bg-white dark:bg-white/5">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cleanedData.slice(0, 10).map((row, i) => (
                <tr key={i} className="group hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors">
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="px-8 py-5 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-50 dark:border-white/5">
                      {val?.toString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
});

Dashboard.displayName = 'Dashboard';
