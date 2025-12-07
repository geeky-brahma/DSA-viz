import React from 'react';
import { motion } from 'framer-motion';

interface TreeNode {
  val: string | number;
  children?: TreeNode[];
}

interface Props {
  data: TreeNode; // Root node
  variables: Record<string, any>;
}

const TreeNodeView: React.FC<{ node: TreeNode; depth: number; variables: Record<string, any> }> = ({ node, depth, variables }) => {
  if (!node) return null;

  // Check if any variable points to this node's value
  // This is a heuristic since we might not have IDs in simple tree JSON
  const activeVars = Object.entries(variables)
    .filter(([_, val]) => val === node.val || (val && typeof val === 'object' && (val as any).val === node.val))
    .map(([key]) => key);

  const isVisited = activeVars.length > 0;

  return (
    <div className="flex flex-col items-center mx-2">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2 shadow-lg z-10 mb-4
            ${isVisited ? 'bg-yellow-500 border-yellow-300 text-black' : 'bg-slate-800 border-blue-500 text-white'}
        `}
      >
        {node.val}
        
        {/* Variable Labels */}
        {activeVars.length > 0 && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap z-20">
                {activeVars.join(', ')}
            </div>
        )}
      </motion.div>

      {/* Children */}
      {node.children && node.children.length > 0 && (
        <div className="flex relative items-start pt-4 border-t border-slate-600">
           {/* Connecting lines via CSS borders on the parent wrapper would be better, but this simple border-t works for visual separation */}
          {node.children.map((child, idx) => (
            <TreeNodeView key={idx} node={child} depth={depth + 1} variables={variables} />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeVisualizer: React.FC<Props> = ({ data, variables }) => {
  const safeVariables = variables || {};

  if (!data || typeof data !== 'object') {
      return <div className="text-slate-500 p-8 text-center">No Valid Tree Data</div>;
  }

  return (
    <div className="h-full w-full overflow-auto flex items-center justify-center p-8 bg-[#0f172a]">
      <div className="min-w-fit">
        <TreeNodeView node={data} depth={0} variables={safeVariables} />
      </div>
    </div>
  );
};

export default TreeVisualizer;