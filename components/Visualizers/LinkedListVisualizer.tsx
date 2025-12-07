import React from 'react';
import { ArrowRight } from 'lucide-react';

interface Node {
  id: string | number;
  val: any;
  nextId: string | number | null;
}

interface Props {
  data: Node[];
  variables: Record<string, any>;
}

const LinkedListVisualizer: React.FC<Props> = ({ data, variables }) => {
  const safeData = Array.isArray(data) ? data : [];
  const safeVariables = (variables && typeof variables === 'object') ? variables : {};

  // Map variables to node IDs to highlight them
  const highlights: Record<string | number, string[]> = {};
  
  try {
    Object.entries(safeVariables).forEach(([varName, varValue]) => {
       // Check if the variable value matches a node ID or value
       safeData.forEach(node => {
           if (node.id === varValue || node.val === varValue) {
               if (!highlights[node.id]) highlights[node.id] = [];
               highlights[node.id].push(varName);
           }
       });
    });
  } catch (e) {
    console.warn("Error processing variables in LinkedListVisualizer", e);
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-8 overflow-x-auto">
      <div className="flex items-center gap-2">
        {safeData.map((node, index) => (
          <div key={node.id || index} className="flex items-center">
            {/* Node */}
            <div className="relative">
              {/* Pointers (labels above/below) */}
              {highlights[node.id]?.map((label, i) => (
                 <div key={label} 
                      className="absolute left-1/2 -translate-x-1/2 -top-8 bg-yellow-600 text-white text-xs px-2 py-0.5 rounded shadow-sm whitespace-nowrap"
                      style={{ top: `-${(i + 1) * 28}px` }}>
                   {label} ↓
                 </div>
              ))}

              <div className="w-16 h-16 rounded-full border-4 border-blue-500 bg-slate-800 flex items-center justify-center text-white font-bold text-lg shadow-xl relative z-10">
                {String(node.val)}
              </div>
              
              <div className="absolute -bottom-6 w-full text-center text-[10px] text-gray-500">
                {String(node.id).substring(0,6)}
              </div>
            </div>

            {/* Arrow */}
            {node.nextId !== null && index < safeData.length - 1 && (
              <div className="px-2 text-slate-500">
                <ArrowRight size={24} />
              </div>
            )}
            
            {/* Null terminator */}
            {(node.nextId === null || index === safeData.length - 1) && (
               <div className="ml-2 flex items-center text-slate-600 font-mono text-sm">
                 <ArrowRight size={20} className="mr-1"/> NULL
               </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LinkedListVisualizer;