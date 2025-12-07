import React, { useMemo, useState } from 'react';
import { AnalysisResult } from '../types';
import { CheckCircle, AlertTriangle, Cpu, Database, Zap, Code, GitCompare } from 'lucide-react';

interface Props {
  result: AnalysisResult;
  userCode: string;
}

const AnalysisPanel: React.FC<Props> = ({ result, userCode }) => {
  const [showDiff, setShowDiff] = useState(true);

  // Naive line-by-line comparison
  const diffLines = useMemo(() => {
    const originalLines = userCode.split('\n');
    const correctedLines = result.correctedCode.split('\n');
    const maxLines = Math.max(originalLines.length, correctedLines.length);
    
    const lines = [];
    for (let i = 0; i < maxLines; i++) {
        const oldL = originalLines[i] || '';
        const newL = correctedLines[i] || '';
        const isDiff = oldL.trim() !== newL.trim();
        lines.push({
            idx: i,
            oldLine: oldL,
            newLine: newL,
            isDiff
        });
    }
    return lines;
  }, [userCode, result.correctedCode]);

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
        
        {/* Diagnostic / Topic Detection */}
        <div className={`p-4 rounded-lg border ${result.isTopicMismatch ? 'bg-red-900/20 border-red-700' : 'bg-green-900/20 border-green-700'}`}>
            <div className="flex items-center gap-2 mb-2">
                {result.isTopicMismatch ? <AlertTriangle className="text-red-500" /> : <CheckCircle className="text-green-500" />}
                <h3 className={`font-bold ${result.isTopicMismatch ? 'text-red-400' : 'text-green-400'}`}>
                    {result.isTopicMismatch ? 'Topic Mismatch Detected' : 'Topic Confirmed'}
                </h3>
            </div>
            <p className="text-slate-300 text-sm">{result.diagnosticMessage}</p>
            <div className="mt-2 text-xs text-slate-400">
                Detected: <span className="text-white font-mono">{result.detectedTopic}</span>
            </div>
        </div>

        {/* Complexity Grid */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 p-4 rounded border border-slate-700">
                <div className="flex items-center gap-2 text-blue-400 mb-1">
                    <Cpu size={16} /> <span className="text-sm font-bold">Time Complexity</span>
                </div>
                <div className="text-lg text-white font-mono">{result.complexity.time}</div>
            </div>
            <div className="bg-slate-800 p-4 rounded border border-slate-700">
                <div className="flex items-center gap-2 text-purple-400 mb-1">
                    <Database size={16} /> <span className="text-sm font-bold">Space Complexity</span>
                </div>
                <div className="text-lg text-white font-mono">{result.complexity.space}</div>
            </div>
        </div>
        
        {/* Complexity Explanation */}
        <div className="bg-slate-800/50 p-3 rounded border border-slate-700/50 text-sm text-slate-400 italic">
            {result.complexity.explanation}
        </div>

        {/* Optimizations */}
        {result.optimizations && result.optimizations.length > 0 && (
            <div className="bg-slate-800 p-4 rounded border border-slate-700">
                <div className="flex items-center gap-2 text-yellow-400 mb-3">
                    <Zap size={16} /> <span className="font-bold">Suggested Optimizations</span>
                </div>
                <ul className="list-disc list-inside space-y-1">
                    {result.optimizations.map((opt, i) => (
                        <li key={i} className="text-sm text-slate-300">{opt}</li>
                    ))}
                </ul>
            </div>
        )}

        {/* Code Comparison / Diff View */}
        <div>
             <div className="flex items-center justify-between mb-2">
                 <h3 className="text-slate-400 font-bold text-sm flex items-center gap-2">
                    {showDiff ? <GitCompare size={16} /> : <Code size={16} />}
                    {showDiff ? 'Code Corrections (Diff View)' : 'Corrected Code'}
                 </h3>
                 <button 
                    onClick={() => setShowDiff(!showDiff)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-blue-400 border border-slate-700"
                 >
                    {showDiff ? 'View Final Only' : 'Compare Changes'}
                 </button>
             </div>

             <div className="bg-[#1e1e1e] rounded text-xs font-mono text-gray-300 overflow-x-auto border border-slate-700 max-h-[500px] overflow-y-auto">
                 {showDiff ? (
                     <table className="w-full border-collapse">
                         <thead>
                             <tr className="bg-slate-800 text-left">
                                 <th className="p-2 w-1/2 border-r border-slate-700 text-slate-500">Your Code</th>
                                 <th className="p-2 w-1/2 text-slate-500">Corrected Code</th>
                             </tr>
                         </thead>
                         <tbody>
                            {diffLines.map((line, idx) => (
                                <tr key={idx} className="border-b border-slate-800/50">
                                    <td className={`p-1 align-top border-r border-slate-700 ${line.isDiff && line.oldLine ? 'bg-red-900/20 text-red-200' : 'text-gray-400'}`}>
                                        <pre className="whitespace-pre-wrap break-all">{line.oldLine}</pre>
                                    </td>
                                    <td className={`p-1 align-top ${line.isDiff ? 'bg-green-900/20 text-green-200' : 'text-gray-300'}`}>
                                        <pre className="whitespace-pre-wrap break-all">{line.newLine}</pre>
                                    </td>
                                </tr>
                            ))}
                         </tbody>
                     </table>
                 ) : (
                     <pre className="p-4">{result.correctedCode}</pre>
                 )}
             </div>
        </div>
    </div>
  );
};

export default AnalysisPanel;