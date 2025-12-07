import React from 'react';

interface Props {
  data: any[][];
  variables: Record<string, any>;
}

const GridVisualizer: React.FC<Props> = ({ data, variables }) => {
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    return <div className="text-gray-500">Invalid Grid Data</div>;
  }

  const safeVariables = (variables && typeof variables === 'object') ? variables : {};

  // Highlight active cells based on variables (i, j) or (row, col)
  const activeRow = safeVariables['i'] ?? safeVariables['row'] ?? -1;
  const activeCol = safeVariables['j'] ?? safeVariables['col'] ?? -1;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4 overflow-auto">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${data[0].length}, minmax(40px, 1fr))` }}>
        {data.map((row, rIdx) => (
          row.map((cell: any, cIdx: number) => {
            const isActive = rIdx === activeRow && cIdx === activeCol;
            const isRowActive = rIdx === activeRow;
            
            return (
              <div 
                key={`${rIdx}-${cIdx}`}
                className={`
                  w-12 h-12 flex items-center justify-center border text-sm font-medium transition-colors duration-200
                  ${isActive ? 'bg-yellow-500 border-yellow-300 text-black' : 
                    isRowActive ? 'bg-slate-700 border-slate-600 text-gray-200' : 'bg-slate-800 border-slate-700 text-gray-400'}
                `}
              >
                {String(cell)}
              </div>
            );
          })
        ))}
      </div>
       <div className="mt-4 text-xs text-gray-400">
          Grid Size: {data.length} x {data[0].length}
       </div>
    </div>
  );
};

export default GridVisualizer;