import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

interface Props {
  data: number[];
  variables: Record<string, any>;
}

const ArrayVisualizer: React.FC<Props> = ({ data, variables }) => {
  const safeData = Array.isArray(data) ? data : [];
  const safeVariables = (variables && typeof variables === 'object') ? variables : {};
  
  // Identify variables that are likely indices
  const pointers: { name: string, index: number, color: string }[] = [];
  const colors = ['text-red-500', 'text-green-500', 'text-yellow-500', 'text-purple-500', 'text-pink-500'];
  
  let colorIdx = 0;
  Object.entries(safeVariables).forEach(([key, val]) => {
    if (typeof val === 'number' && val >= 0 && val < safeData.length) {
       // Filter out common non-index vars if they are huge or float
       if (Number.isInteger(val)) {
         pointers.push({
             name: key,
             index: val,
             color: colors[colorIdx % colors.length]
         });
         colorIdx++;
       }
    }
  });

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4 overflow-x-auto relative">
      
      {/* Array Bars */}
      <div className="flex items-end gap-2 h-48 mb-12">
        {safeData.map((val, idx) => {
          const isPointerTarget = pointers.some(p => p.index === idx);
          const height = Math.max(24, Math.min(Number(val) * 8, 180)); 
          
          return (
            <div key={idx} className="flex flex-col items-center relative group">
                <motion.div
                layout
                initial={{ height: 0 }}
                animate={{ 
                    height: `${height}px`, 
                    backgroundColor: isPointerTarget ? '#60a5fa' : '#334155'
                }}
                className={`w-10 rounded-t-md flex items-end justify-center pb-1 text-xs font-bold text-white shadow-lg transition-colors border border-slate-600`}
                >
                <span className="text-white drop-shadow-md z-10">{String(val)}</span>
                </motion.div>
                
                {/* Index Label */}
                <span className="text-[10px] text-slate-500 mt-1 font-mono">{idx}</span>

                {/* Pointers (Arrows) */}
                <div className="absolute top-full mt-4 flex flex-col items-center gap-1 w-full">
                    {pointers.filter(p => p.index === idx).map(p => (
                        <motion.div 
                            key={p.name}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex flex-col items-center ${p.color}`}
                        >
                            <ArrowUp size={16} strokeWidth={3} />
                            <span className="text-xs font-bold font-mono bg-slate-800 px-1 rounded -mt-1 border border-slate-700">{p.name}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
          );
        })}
      </div>
      
      {/* Variable Dump (for non-index variables) */}
      <div className="absolute bottom-4 left-4 right-4 flex gap-4 flex-wrap justify-center border-t border-slate-800 pt-4">
        {Object.entries(safeVariables).map(([key, val]) => {
           // Don't show index pointers again in the generic list to reduce clutter, unless needed
           const isIndex = pointers.some(p => p.name === key);
           return (
            <div key={key} className={`px-3 py-1 rounded border text-xs font-mono flex items-center gap-2 ${isIndex ? 'bg-slate-800 border-slate-600 opacity-60' : 'bg-slate-700 border-blue-500/30'}`}>
                <span className="text-blue-300">{key}:</span> 
                <span className="text-white font-bold">{String(val)}</span>
            </div>
           );
        })}
      </div>
    </div>
  );
};

export default ArrayVisualizer;