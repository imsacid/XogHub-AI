import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CorrelationMatrix } from '../types';
import { Info } from 'lucide-react';

interface CorrelationHeatmapProps {
  data: CorrelationMatrix;
  darkMode: boolean;
  t: any;
}

export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({ data, darkMode, t }) => {
  const [hoveredCell, setHoveredCell] = useState<{ i: number; j: number } | null>(null);

  const getColor = (value: number) => {
    // value is between -1 and 1
    // 1 -> emerald-600
    // 0 -> gray-100
    // -1 -> rose-600
    
    if (value > 0) {
      return `rgba(16, 185, 129, ${value})`; // emerald-600
    } else if (value < 0) {
      return `rgba(225, 29, 72, ${Math.abs(value)})`; // rose-600
    }
    return darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  };

  return (
    <div className="bg-white dark:bg-white/5 p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
            <Info className="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold dark:text-white">{t.correlationHeatmap || 'Correlation Heatmap'}</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500">{t.correlationDesc || 'Relationships between numeric variables'}</p>
          </div>
        </div>
      </div>

      <div className="relative overflow-x-auto custom-scrollbar pb-4">
        <div className="min-w-[500px]">
          <div className="grid" style={{ gridTemplateColumns: `120px repeat(${data.columns.length}, 1fr)` }}>
            {/* Header row */}
            <div />
            {data.columns.map((col, i) => (
              <div key={i} className="p-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center truncate" title={col}>
                {col}
              </div>
            ))}

            {/* Matrix rows */}
            {data.columns.map((colI, i) => (
              <React.Fragment key={i}>
                <div className="p-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center truncate" title={colI}>
                  {colI}
                </div>
                {data.matrix[i].map((val, j) => (
                  <div
                    key={j}
                    className="aspect-square p-0.5 relative group cursor-crosshair"
                    onMouseEnter={() => setHoveredCell({ i, j })}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <motion.div
                      initial={false}
                      animate={{
                        backgroundColor: getColor(val),
                        scale: hoveredCell?.i === i && hoveredCell?.j === j ? 0.95 : 1
                      }}
                      className="w-full h-full rounded-md transition-colors duration-200"
                    />
                    
                    <AnimatePresence>
                      {hoveredCell?.i === i && hoveredCell?.j === j && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
                        >
                          <div className="bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-xl whitespace-nowrap">
                            {data.columns[i]} vs {data.columns[j]}
                            <div className="text-emerald-400 text-center mt-0.5">
                              {val.toFixed(3)}
                            </div>
                          </div>
                          <div className="w-2 h-2 bg-gray-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-emerald-600" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Positive (1.0)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-white/10" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Neutral (0.0)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-rose-600" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Negative (-1.0)</span>
        </div>
      </div>
    </div>
  );
};
