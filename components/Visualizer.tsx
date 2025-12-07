import React from 'react';
import { VisualizationType, VisualizationStep } from '../types';
import ArrayVisualizer from './Visualizers/ArrayVisualizer';
import LinkedListVisualizer from './Visualizers/LinkedListVisualizer';
import GridVisualizer from './Visualizers/GridVisualizer';
import TreeVisualizer from './Visualizers/TreeVisualizer';
import CodeViewer from './CodeViewer';

interface Props {
  type: VisualizationType;
  step: VisualizationStep | null;
  code: string;
}

const Visualizer: React.FC<Props> = ({ type, step, code }) => {
  if (!step) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-500">
        Run analysis to see visualization
      </div>
    );
  }

  const { dataState, variables, highlightLines } = step;
  const safeVariables = variables || {};

  const renderVisualizer = () => {
      switch (type) {
        case VisualizationType.ARRAY:
          return <ArrayVisualizer data={dataState} variables={safeVariables} />;
        case VisualizationType.LINKED_LIST:
          return <LinkedListVisualizer data={dataState} variables={safeVariables} />;
        case VisualizationType.GRID:
          return <GridVisualizer data={dataState} variables={safeVariables} />;
        case VisualizationType.TREE:
          return <TreeVisualizer data={dataState} variables={safeVariables} />;
        default:
          return (
            <div className="p-4 font-mono text-sm overflow-auto h-full w-full">
                <pre className="text-slate-300">{JSON.stringify(dataState, null, 2)}</pre>
            </div>
          );
      }
  };

  return (
    <div className="flex h-full w-full">
        {/* Left/Top: The Visual Graphic (60%) */}
        <div className="flex-grow h-full bg-[#0f172a] overflow-hidden border-r border-slate-800 relative">
            {renderVisualizer()}
        </div>

        {/* Right/Bottom: The Code Trace (40%) */}
        <div className="w-[400px] flex-shrink-0 h-full bg-[#1e1e1e] flex flex-col border-l border-slate-700 shadow-xl z-10">
            <div className="px-4 py-2 bg-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-700">
                Code Trace
            </div>
            <div className="flex-grow overflow-hidden relative">
                <CodeViewer code={code} highlightLines={highlightLines || []} />
            </div>
            
            {/* Variable Watcher (Compact) */}
            <div className="h-1/3 min-h-[150px] bg-slate-900 border-t border-slate-700 p-4 overflow-y-auto">
                 <h4 className="text-slate-500 text-xs font-bold uppercase mb-2">Current Variables</h4>
                 <div className="grid grid-cols-2 gap-2">
                     {Object.entries(safeVariables).map(([k, v]) => (
                         <div key={k} className="flex justify-between text-xs border-b border-slate-800 pb-1">
                             <span className="text-blue-400 font-mono">{k}</span>
                             <span className="text-green-300 font-mono truncate pl-2">{JSON.stringify(v)}</span>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
    </div>
  );
};

export default Visualizer;