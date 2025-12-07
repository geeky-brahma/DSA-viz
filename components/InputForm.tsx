import React from 'react';
import { TOPICS } from '../constants';
import { UserInputState } from '../types';

interface Props {
  state: UserInputState;
  onChange: (updates: Partial<UserInputState>) => void;
  onRun: () => void;
  loading: boolean;
}

const InputForm: React.FC<Props> = ({ state, onChange, onRun, loading }) => {
  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700 p-4 overflow-y-auto">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="bg-gradient-to-r from-blue-500 to-purple-500 w-8 h-8 rounded flex items-center justify-center">A</span>
        AlgoMinds
      </h2>

      {/* Topic Selection */}
      <div className="mb-4">
        <label className="block text-slate-400 text-sm font-bold mb-2">Algorithm Topic</label>
        <select 
          value={state.selectedTopic}
          onChange={(e) => onChange({ selectedTopic: e.target.value })}
          className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2 focus:outline-none focus:border-blue-500"
        >
            <option value="">-- Detect Automatically --</option>
            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Problem Statement */}
      <div className="mb-4">
        <label className="block text-slate-400 text-sm font-bold mb-2">Problem Statement</label>
        <textarea 
          value={state.problemStatement}
          onChange={(e) => onChange({ problemStatement: e.target.value })}
          placeholder="Paste problem from LeetCode, GFG, or describe it here..."
          className="w-full h-24 bg-slate-800 border border-slate-700 text-white rounded p-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      {/* Code Editor */}
      <div className="mb-4 flex-grow flex flex-col">
        <label className="block text-slate-400 text-sm font-bold mb-2">Your Code (JS/TS)</label>
        <textarea 
          value={state.code}
          onChange={(e) => onChange({ code: e.target.value })}
          className="flex-grow w-full bg-[#1e1e1e] border border-slate-700 text-gray-300 font-mono text-sm rounded p-2 focus:outline-none focus:border-blue-500 leading-relaxed"
          spellCheck={false}
        />
      </div>

      {/* Input Data */}
      <div className="mb-4">
        <label className="block text-slate-400 text-sm font-bold mb-2">Test Input</label>
        <input 
          type="text"
          value={state.inputData}
          onChange={(e) => onChange({ inputData: e.target.value })}
          className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2 font-mono text-sm focus:outline-none focus:border-blue-500"
          placeholder="e.g. [1, 5, 2] or 10"
        />
      </div>

      <button
        onClick={onRun}
        disabled={loading}
        className={`w-full py-3 rounded font-bold text-white transition-all ${
            loading ? 'bg-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20'
        }`}
      >
        {loading ? 'Analyzing...' : 'Analyze, Correct & Visualize'}
      </button>
    </div>
  );
};

export default InputForm;