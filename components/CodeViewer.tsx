import React, { useEffect, useRef } from 'react';

interface Props {
  code: string;
  highlightLines: number[];
}

const CodeViewer: React.FC<Props> = ({ code, highlightLines }) => {
  const lines = code.split('\n');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to highlighted line
  useEffect(() => {
    if (scrollRef.current && highlightLines.length > 0) {
        const lineIndex = highlightLines[0] - 1;
        const lineElement = scrollRef.current.children[lineIndex] as HTMLElement;
        if (lineElement) {
            lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  }, [highlightLines]);

  return (
    <div className="font-mono text-xs overflow-auto h-full bg-[#1e1e1e] p-2" ref={scrollRef}>
      {lines.map((line, idx) => {
        const lineNum = idx + 1;
        const isHighlighted = highlightLines.includes(lineNum);
        return (
          <div 
            key={idx} 
            className={`flex px-2 py-0.5 rounded transition-colors duration-200 ${isHighlighted ? 'bg-yellow-900/40 border-l-2 border-yellow-500' : 'text-slate-400'}`}
          >
            <span className="w-8 text-slate-600 text-right mr-4 select-none">{lineNum}</span>
            <span className={`whitespace-pre-wrap break-all ${isHighlighted ? 'text-yellow-100 font-bold' : 'text-slate-300'}`}>
              {line}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default CodeViewer;