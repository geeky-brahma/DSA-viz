import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_CODE_TEMPLATE } from './constants';
import { UserInputState, AnalysisResult } from './types';
import InputForm from './components/InputForm';
import AnalysisPanel from './components/AnalysisPanel';
import Visualizer from './components/Visualizer';
import { analyzeAlgorithm } from './services/geminiService';
import { Play, Pause, SkipBack, SkipForward, RefreshCw, Volume2, VolumeX } from 'lucide-react';

const App: React.FC = () => {
  const [inputState, setInputState] = useState<UserInputState>({
    selectedTopic: '',
    problemStatement: '',
    code: DEFAULT_CODE_TEMPLATE,
    inputData: '[10, 5, 2, 7, 1]'
  });

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1500); // Only used when voice is OFF
  const [viewTab, setViewTab] = useState<'visualize' | 'analysis'>('visualize');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

  const handleInputChange = (updates: Partial<UserInputState>) => {
    setInputState(prev => ({ ...prev, ...updates }));
  };

  const handleRunAnalysis = async () => {
    if (!process.env.API_KEY) {
      alert("API Key is missing from environment.");
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    setLoading(true);
    try {
      const analysis = await analyzeAlgorithm(
        process.env.API_KEY,
        inputState.selectedTopic,
        inputState.problemStatement,
        inputState.code,
        inputState.inputData
      );
      
      setResult(analysis);
      setCurrentStepIndex(0);
      setIsPlaying(false);
      setViewTab('visualize');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Playback Loop (Timer based - ONLY when Voice is OFF)
  useEffect(() => {
    let interval: any;
    
    // We only use the interval timer if we are playing AND voice is NOT enabled.
    // If voice is enabled, the progression is driven by the 'onend' event of the speech utterance.
    if (isPlaying && !isVoiceEnabled && result && currentStepIndex < result.steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStepIndex(prev => {
           if (prev >= result.steps.length - 1) {
             setIsPlaying(false);
             return prev;
           }
           return prev + 1;
        });
      }, playbackSpeed);
    } else if (currentStepIndex >= (result?.steps.length || 0) - 1) {
        // Ensure we stop playing at the end
        if (isPlaying && !isVoiceEnabled) {
            setIsPlaying(false);
        }
    }
    return () => clearInterval(interval);
  }, [isPlaying, result, currentStepIndex, playbackSpeed, isVoiceEnabled]);

  // Voice Narration Effect & Driver
  useEffect(() => {
    if (!result || !isVoiceEnabled || viewTab !== 'visualize') {
        window.speechSynthesis.cancel();
        return;
    }

    const step = result.steps[currentStepIndex];
    
    // Always cancel previous speech immediately when step changes (or if we just enabled voice)
    window.speechSynthesis.cancel();

    if (step) {
        // Use the AI-generated narration if available.
        // If not, use description but strip common code punctuation for a cleaner read.
        let textToSpeak = step.narration || step.description;

        // SANITIZATION: Remove Markdown characters that TTS reads literally (backticks, asterisks, hashtags)
        textToSpeak = textToSpeak.replace(/[`*#_]/g, "");

        // If falling back to raw description (no AI narration), strip code syntax aggressively
        if (!step.narration) {
             textToSpeak = textToSpeak.replace(/[:;{}[\]()]/g, " ");
        }

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 1.05; // Slightly faster than default for flow, but natural
        utterance.pitch = 1.0; 
        
        // Intelligent Voice Selection
        // We look for known high-quality English voices
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = 
            voices.find(v => v.name.includes("Google US English")) ||
            voices.find(v => v.name.includes("Samantha")) || 
            voices.find(v => v.name.includes("Microsoft Zira")) || 
            voices.find(v => v.name.includes("Natural")) || // 'Microsoft Aria Online (Natural)' etc.
            voices.find(v => v.lang === "en-US") ||
            voices[0];
        
        if (preferredVoice) utterance.voice = preferredVoice;
        
        // CRITICAL: If playing, the NEXT step is triggered only when the current speech ENDS.
        // This ensures the visual never outpaces the voice.
        if (isPlaying) {
             utterance.onend = () => {
                 setCurrentStepIndex(prev => {
                     // Check if we can move forward
                     if (prev < result.steps.length - 1) {
                         return prev + 1;
                     } else {
                         setIsPlaying(false); // End of visualization
                         return prev;
                     }
                 });
             };
        }
        
        window.speechSynthesis.speak(utterance);
    }
  }, [currentStepIndex, result, isVoiceEnabled, viewTab, isPlaying]);

  // Cleanup speech on unmount
  useEffect(() => {
      return () => {
          window.speechSynthesis.cancel();
      };
  }, []);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const stepForward = () => result && setCurrentStepIndex(Math.min(result.steps.length - 1, currentStepIndex + 1));
  const stepBack = () => setCurrentStepIndex(Math.max(0, currentStepIndex - 1));
  const reset = () => { setIsPlaying(false); setCurrentStepIndex(0); window.speechSynthesis.cancel(); };
  const toggleVoice = () => setIsVoiceEnabled(!isVoiceEnabled);

  const currentStep = result ? result.steps[currentStepIndex] : null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-200 font-sans">
      
      {/* Left Panel: Inputs */}
      <div className="w-[350px] flex-shrink-0 h-full border-r border-slate-800">
        <InputForm 
          state={inputState} 
          onChange={handleInputChange} 
          onRun={handleRunAnalysis}
          loading={loading}
        />
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col h-full bg-slate-900">
        
        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-950 h-12">
          <button 
            onClick={() => setViewTab('visualize')}
            className={`px-6 h-full font-medium text-sm transition-colors ${viewTab === 'visualize' ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-900' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Visualization
          </button>
          <button 
            onClick={() => setViewTab('analysis')}
            className={`px-6 h-full font-medium text-sm transition-colors ${viewTab === 'analysis' ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-900' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Correction & Complexity
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-hidden relative">
            {!result && !loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                    <div className="text-6xl mb-4 opacity-20">⚡</div>
                    <p>Enter your algorithm or problem to begin.</p>
                </div>
            )}

            {loading && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-50 backdrop-blur-sm">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-blue-400 animate-pulse font-bold">Analyzing & Generating Trace...</p>
                </div>
            )}

            {result && viewTab === 'visualize' && (
                <div className="h-full flex flex-col">
                    {/* Visualizer Area */}
                    <div className="flex-grow bg-[#0f172a] relative overflow-hidden">
                         <Visualizer 
                            type={result.visualizationType} 
                            step={currentStep} 
                            code={result.correctedCode}
                         />
                    </div>

                    {/* Playback Controls Bar */}
                    <div className="h-16 bg-slate-800 border-t border-slate-700 px-4 flex items-center justify-between shrink-0">
                        <div className="flex flex-col">
                             <div className="text-xs font-bold text-slate-400">STEP {currentStep?.stepId} / {result.steps.length}</div>
                             <div className="text-sm text-white truncate max-w-lg" title={currentStep?.description}>
                                {currentStep?.description}
                             </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Voice Toggle */}
                            <button 
                                onClick={toggleVoice} 
                                className={`p-2 rounded-full transition ${isVoiceEnabled ? 'text-blue-400 bg-blue-900/30' : 'text-slate-400 hover:bg-slate-700'}`}
                                title={isVoiceEnabled ? "Mute Voice" : "Enable Voice Narration"}
                            >
                                {isVoiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                            </button>
                            
                            <div className="h-6 w-px bg-slate-700 mx-1"></div>

                            <button onClick={reset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 transition" title="Reset"><RefreshCw size={18}/></button>
                            <button onClick={stepBack} className="p-2 hover:bg-slate-700 rounded-full text-slate-300 transition" title="Previous Step"><SkipBack size={18}/></button>
                            <button onClick={togglePlay} className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white shadow-lg transition transform hover:scale-105" title={isPlaying ? "Pause" : "Play"}>
                                {isPlaying ? <Pause size={20} fill="white"/> : <Play size={20} fill="white" className="ml-0.5"/>}
                            </button>
                            <button onClick={stepForward} className="p-2 hover:bg-slate-700 rounded-full text-slate-300 transition" title="Next Step"><SkipForward size={18}/></button>
                        </div>
                    </div>
                </div>
            )}

            {result && viewTab === 'analysis' && (
                <AnalysisPanel result={result} userCode={inputState.code} />
            )}
        </div>
      </div>
    </div>
  );
};

export default App;