
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Plus, Trash2, RotateCcw, ArrowRight, Minus, Layers, X, Check, Copy, Briefcase, Sparkles, Save, ChevronDown, ChevronUp } from 'lucide-react';
import CircularProgress from './CircularProgress';
import { formatTime } from '../utils/time';
import { playTone } from '../utils/soundEngine';
import { SoundId } from '../types';
import { useWakeLock } from '../hooks/useWakeLock';

interface SequenceStep {
  id: string;
  duration: number; // seconds
  label: string;
}

interface SavedSequence {
    id: string;
    name: string;
    steps: SequenceStep[];
}

interface SequenceViewProps {
  soundId: SoundId;
}

const PRESETS = [60, 180, 300, 600, 1500, 3600];
const STORAGE_KEY = 'chronos_saved_sequences';

const SequenceView: React.FC<SequenceViewProps> = ({ soundId }) => {
  // --- State ---
  const [steps, setSteps] = useState<SequenceStep[]>([
    { id: '1', duration: 1500, label: 'Work' },
    { id: '2', duration: 300, label: 'Rest' },
  ]);

  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(1500);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // --- Saved Sequences State ---
  const [savedSequences, setSavedSequences] = useState<SavedSequence[]>([]);
  const [isSavedListExpanded, setIsSavedListExpanded] = useState(false);

  // --- Bulk Add State ---
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkCount, setBulkCount] = useState(4);
  const [bulkDuration, setBulkDuration] = useState(300); // Default 5m

  const intervalRef = useRef<number | null>(null);

  // --- Wake Lock ---
  useWakeLock(isRunning && !isPaused);

  // --- Initialize ---
  useEffect(() => {
    // Load from local storage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            setSavedSequences(JSON.parse(saved));
        } catch (e) {
            console.error("Failed to parse saved sequences");
        }
    }
  }, []);

  // --- Timer Logic ---
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Step Finished
            playTone(soundId);
            handleNextStep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused, activeStepIndex, steps, soundId]);

  const handleNextStep = () => {
    if (activeStepIndex < steps.length - 1) {
      // Move to next step
      const nextIndex = activeStepIndex + 1;
      setActiveStepIndex(nextIndex);
      setTimeLeft(steps[nextIndex].duration);
    } else {
      // Sequence Complete
      setIsRunning(false);
      setIsPaused(false);
      setActiveStepIndex(0);
      setTimeLeft(steps[0].duration);
    }
  };

  // --- Handlers ---
  const toggleTimer = () => {
    if (!isRunning) {
      // Starting from scratch or reset
      setIsRunning(true);
      setIsPaused(false);
      if (timeLeft === 0 || activeStepIndex === 0) { 
          // Reset time left to the first step's duration on fresh start
          setTimeLeft(steps[0].duration);
      }
    } else {
      setIsPaused(!isPaused);
    }
  };

  const resetSequence = () => {
    setIsRunning(false);
    setIsPaused(false);
    setActiveStepIndex(0);
    setTimeLeft(steps[0].duration);
  };

  const resetEditor = () => {
    if (window.confirm('Reset sequence to default?')) {
        setSteps([
            { id: '1', duration: 1500, label: 'Work' },
            { id: '2', duration: 300, label: 'Rest' },
        ]);
        setActiveStepIndex(0);
        setTimeLeft(1500);
        setIsRunning(false);
        setIsPaused(false);
    }
  };

  // --- Saving Handlers ---
  const saveCurrentSequence = () => {
      const name = window.prompt("Name your flow:", `Flow ${savedSequences.length + 1}`);
      if (!name) return;

      const newSequence: SavedSequence = {
          id: Date.now().toString(),
          name,
          steps: [...steps] // Clone current steps
      };

      const updatedList = [newSequence, ...savedSequences];
      setSavedSequences(updatedList);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  };

  const deleteSavedSequence = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if(window.confirm("Delete this saved flow?")) {
        const updatedList = savedSequences.filter(s => s.id !== id);
        setSavedSequences(updatedList);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      }
  };

  const loadSavedSequence = (saved: SavedSequence) => {
      setSteps(saved.steps);
      setActiveStepIndex(0);
      setTimeLeft(saved.steps[0].duration);
      setIsRunning(false);
      setIsPaused(false);
  };

  // --- Editor Handlers ---
  const addStep = () => {
    const newStep: SequenceStep = {
      id: Date.now().toString(),
      duration: 300,
      label: 'Focus',
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    if (steps.length <= 1) return;
    setSteps(steps.filter(s => s.id !== id));
  };

  const duplicateStep = (id: string) => {
    const index = steps.findIndex(s => s.id === id);
    if (index === -1) return;
    
    const stepToCopy = steps[index];
    const newStep: SequenceStep = {
        ...stepToCopy,
        id: `${Date.now()}-${Math.random()}`,
        label: stepToCopy.label
    };
    
    const newSteps = [...steps];
    newSteps.splice(index + 1, 0, newStep);
    setSteps(newSteps);
  };

  const updateStep = (id: string, updates: Partial<SequenceStep>) => {
    setSteps(steps.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const adjustStepDuration = (id: string, amount: number) => {
    const step = steps.find(s => s.id === id);
    if (step) {
      const newDuration = Math.max(10, step.duration + amount); // Min 10s
      updateStep(id, { duration: newDuration });
      // If we are editing the step currently ready to play (and not running), update preview
      if (!isRunning && steps[activeStepIndex].id === id) {
          setTimeLeft(newDuration);
      }
    }
  };

  // --- Template Handlers ---
  const loadTemplate = (type: 'yoga-3' | 'yoga-5' | 'work') => {
      const now = Date.now();
      let newSteps: SequenceStep[] = [];

      if (type === 'yoga-3') {
          newSteps = Array.from({length: 4}).map((_, i) => ({
              id: `${now}-${i}`,
              duration: 180, // 3 minutes
              label: `Flow ${i + 1}`
          }));
      } else if (type === 'yoga-5') {
          newSteps = Array.from({length: 4}).map((_, i) => ({
              id: `${now}-${i}`,
              duration: 300, // 5 minutes
              label: `Flow ${i + 1}`
          }));
      } else if (type === 'work') {
          newSteps = [
              { id: `${now}-1`, duration: 1500, label: 'Work' }, // 25 min
              { id: `${now}-2`, duration: 300, label: 'Break' } // 5 min
          ];
      }

      setSteps(newSteps);
      setActiveStepIndex(0);
      setTimeLeft(newSteps[0].duration);
      setIsRunning(false);
      setIsPaused(false);
  };

  // --- Bulk Handlers ---
  const handleBulkAdd = () => {
    const startCount = steps.length + 1;
    const newSteps: SequenceStep[] = Array.from({ length: bulkCount }).map((_, i) => ({
        id: `${Date.now()}-${i}`,
        duration: bulkDuration,
        label: `Step ${startCount + i}`,
    }));
    
    // Append steps instead of replacing
    setSteps([...steps, ...newSteps]);
    setIsBulkModalOpen(false);
  };

  // --- Styles ---
  // Shared with TimerView for consistency
  const controlBoxClass = "bg-gray-900/40 backdrop-blur-xl border border-white/10 p-3 sm:p-4 rounded-[1.5rem] shadow-2xl shadow-black/50";
  const glassButton = "relative h-14 w-full rounded-2xl flex items-center justify-center transition-all duration-300 ease-out backdrop-blur-md border border-white/5 overflow-hidden group";
  const startBtn = `${glassButton} bg-white/10 hover:bg-white/15 border-white/10 text-green-400 hover:shadow-[0_0_20px_rgba(74,222,128,0.2)] active:scale-[0.98]`;
  const resetBtn = `${glassButton} bg-white/5 hover:bg-white/10 active:scale-[0.98] text-white/80 hover:text-white hover:border-white/20`;

  // --- Render ---
  
  // 1. RUNNING MODE
  if (isRunning || (activeStepIndex > 0 && isPaused)) {
    const currentStep = steps[activeStepIndex];
    const progress = currentStep.duration > 0 ? timeLeft / currentStep.duration : 0;
    const nextStep = activeStepIndex < steps.length - 1 ? steps[activeStepIndex + 1] : null;

    return (
      <div className="flex flex-col items-center h-full w-full max-w-md mx-auto relative animate-in fade-in zoom-in duration-300">
        
        {/* Header Indicator */}
        <div className="absolute top-0 w-full flex justify-between px-4 py-2 text-xs text-white/40 uppercase tracking-widest font-medium z-10">
            <span>Running</span>
            <span>{activeStepIndex + 1} / {steps.length}</span>
        </div>

        {/* Main Circle */}
        <div className="flex-1 min-h-0 w-full flex flex-col justify-center items-center py-2 relative">
            {/* Glow behind timer matching TimerView */}
            <div className="absolute w-[200px] h-[200px] bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

            <CircularProgress progress={progress} color="text-white/90">
                <div className="text-5xl sm:text-6xl font-mono font-bold tracking-wider text-white drop-shadow-2xl">
                    {formatTime(timeLeft)}
                </div>
                <div className="text-white/50 mt-2 text-sm sm:text-base font-medium tracking-wider">
                    {currentStep.label}
                </div>
            </CircularProgress>

            {/* Next Step Preview */}
            {nextStep && (
                <div className="absolute bottom-4 flex items-center gap-2 text-white/30 text-sm">
                    <span>Next: {nextStep.label}</span>
                    <ArrowRight size={14} />
                    <span>{formatTime(nextStep.duration)}</span>
                </div>
            )}
        </div>

        {/* Controls - Matching TimerView */}
        <div className="w-full px-4 pb-2 shrink-0">
            <div className={controlBoxClass}>
                <div className="flex items-center justify-center gap-4">
                    <button 
                        onClick={resetSequence}
                        className={`${resetBtn} w-16`} // Explicit width for uniformity
                    >
                        <RotateCcw size={20} />
                    </button>

                    <button
                        onClick={toggleTimer}
                        className={`flex-1 ${
                            isPaused 
                            ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20 shadow-[0_0_15px_rgba(74,222,128,0.1)]' 
                            : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                        } ${glassButton}`}
                    >
                        {isPaused ? <Play size={24} className="ml-1 fill-current" /> : <Pause size={24} className="fill-current" />}
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // 2. EDITOR MODE
  
  // Logic for display items (Default to 2 for mobile friendliness)
  const COLLAPSED_COUNT = 2;
  const displaySavedSequences = isSavedListExpanded 
    ? savedSequences 
    : savedSequences.slice(0, COLLAPSED_COUNT);

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto pt-2 animate-in slide-in-from-bottom-4 duration-500 relative">
        
      {/* Editor Header - Simplified */}
      <div className="px-4 pb-4 flex justify-between items-center relative z-10 shrink-0">
          <button 
              onClick={saveCurrentSequence}
              className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 transition-colors border border-white/10"
              title="Save Flow"
          >
             <Save size={14} /> Save Sequence
          </button>

          <div className="flex items-center gap-2">
            <button 
                onClick={() => setIsBulkModalOpen(true)}
                className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 transition-colors border border-white/10"
                title="Batch Add"
            >
               <Layers size={14} /> Batch
            </button>
            <button 
                onClick={addStep}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white/90 transition-colors border border-white/10"
            >
                <Plus size={14} /> Step
            </button>
          </div>
      </div>

      {/* Template Quick Actions */}
      <div className="px-4 pb-4 flex gap-3 overflow-x-auto no-scrollbar z-10 shrink-0">
         <button 
            onClick={() => loadTemplate('yoga-3')}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-200 text-xs font-semibold transition-all active:scale-95"
         >
            <Sparkles size={14} />
            Yoga (3m)
         </button>
         <button 
            onClick={() => loadTemplate('yoga-5')}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-200 text-xs font-semibold transition-all active:scale-95"
         >
            <Sparkles size={14} />
            Yoga (5m)
         </button>
         <button 
            onClick={() => loadTemplate('work')}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-200 text-xs font-semibold transition-all active:scale-95"
         >
            <Briefcase size={14} />
            Work (25/5)
         </button>
      </div>

      {/* Custom Saved Flows (Expandable) */}
      {savedSequences.length > 0 && (
          <div className="px-4 pb-2 z-10 shrink-0">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider text-white/40 font-bold">My Flows</span>
                {savedSequences.length > COLLAPSED_COUNT && (
                    <button 
                        onClick={() => setIsSavedListExpanded(!isSavedListExpanded)}
                        className="text-[10px] text-white/50 hover:text-white flex items-center gap-1 uppercase tracking-wider"
                    >
                        {isSavedListExpanded ? 'Show Less' : 'Show All'}
                        {isSavedListExpanded ? <ChevronUp size={12}/> : <ChevronDown size={12} />}
                    </button>
                )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {displaySavedSequences.map((seq) => (
                    <div 
                        key={seq.id}
                        onClick={() => loadSavedSequence(seq)}
                        className="group relative flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-1 min-w-0 flex-1">
                            <span className="text-xs font-semibold text-white truncate">
                                {seq.name} <span className="text-white/50 font-normal">({seq.steps.length})</span>
                            </span>
                        </div>
                        <button 
                            onClick={(e) => deleteSavedSequence(e, seq.id)}
                            className="shrink-0 p-1 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
            </div>
          </div>
      )}

      {/* Bulk Add Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-white">Batch Add Steps</h3>
                 <button onClick={() => setIsBulkModalOpen(false)} className="p-2 text-white/40 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                    <X size={20} />
                 </button>
              </div>

              <div className="space-y-6">
                {/* Steps Count */}
                <div>
                   <label className="text-xs uppercase tracking-wider text-white/50 font-medium mb-3 block">Number of Steps</label>
                   <div className="flex items-center justify-between bg-white/5 rounded-2xl p-2 border border-white/5">
                      <button onClick={() => setBulkCount(Math.max(1, bulkCount - 1))} className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                          <Minus size={18} />
                      </button>
                      <span className="text-2xl font-mono font-bold text-white">{bulkCount}</span>
                      <button onClick={() => setBulkCount(Math.min(50, bulkCount + 1))} className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                          <Plus size={18} />
                      </button>
                   </div>
                </div>

                {/* Duration */}
                <div>
                   <label className="text-xs uppercase tracking-wider text-white/50 font-medium mb-3 block">Duration per Step</label>
                   <div className="bg-white/5 rounded-2xl p-2 border border-white/5">
                        <div className="flex items-center justify-between mb-4 px-2 pt-2">
                             <button onClick={() => setBulkDuration(Math.max(60, bulkDuration - 60))} className="p-2 text-white/40 hover:text-white"><Minus size={16} /></button>
                             <span className="font-mono text-2xl font-bold text-white tracking-wider">{formatTime(bulkDuration)}</span>
                             <button onClick={() => setBulkDuration(bulkDuration + 60)} className="p-2 text-white/40 hover:text-white"><Plus size={16} /></button>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                            {PRESETS.slice(0, 5).map((preset) => (
                                <button
                                    key={preset}
                                    onClick={() => setBulkDuration(preset)}
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-medium border transition-all ${
                                        bulkDuration === preset
                                        ? 'bg-white/20 text-white border-white/20'
                                        : 'bg-white/5 text-white/30 border-white/5 hover:bg-white/10 hover:text-white/60'
                                    }`}
                                >
                                    {preset < 3600 ? `${preset / 60}m` : `${preset / 3600}h`}
                                </button>
                            ))}
                        </div>
                   </div>
                </div>

                {/* Actions */}
                <button 
                  onClick={handleBulkAdd}
                  className="w-full h-14 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-black/40"
                >
                    <Plus size={18} className="text-green-400" />
                    Add {bulkCount} Steps
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Step List */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 space-y-3 pb-4 relative z-10">
        {steps.map((step, index) => (
            <div 
                key={step.id} 
                className="group relative flex flex-col p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300"
            >
                {/* Top Row: Index, Name, Delete */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-6 h-6 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-xs font-mono text-white/50">
                        {index + 1}
                    </div>
                    <input 
                        type="text" 
                        value={step.label}
                        onChange={(e) => updateStep(step.id, { label: e.target.value })}
                        className="bg-transparent border-none text-white font-medium focus:ring-0 p-0 text-base placeholder-white/20 flex-1 min-w-0"
                        placeholder="Step Name"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                        <button 
                            onClick={() => duplicateStep(step.id)}
                            className="text-white/20 hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-white/5"
                            title="Duplicate Step"
                        >
                            <Copy size={16} />
                        </button>
                        <button 
                            onClick={() => removeStep(step.id)}
                            className={`text-white/20 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/5 ${steps.length <= 1 ? 'opacity-0 pointer-events-none' : ''}`}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                {/* Middle Row: Duration Counter */}
                <div className="flex items-center justify-between bg-black/20 rounded-xl p-1.5 mb-2 border border-white/5">
                    <button 
                        onClick={() => adjustStepDuration(step.id, -15)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                        <Minus size={14} />
                    </button>
                    
                    <span className="font-mono text-lg font-bold text-white/90 tracking-wider">
                        {formatTime(step.duration)}
                    </span>

                    <button 
                        onClick={() => adjustStepDuration(step.id, 15)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                        <Plus size={14} />
                    </button>
                </div>

                {/* Bottom Row: Quick Presets */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset}
                            onClick={() => updateStep(step.id, { duration: preset })}
                            className={`flex-shrink-0 px-2.5 py-1 rounded-md text-[10px] font-medium border transition-all ${
                                step.duration === preset
                                ? 'bg-white/20 text-white border-white/20'
                                : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white/60'
                            }`}
                        >
                            {preset < 3600 ? `${preset / 60}m` : `${preset / 3600}h`}
                        </button>
                    ))}
                </div>
            </div>
        ))}
        {/* Spacer for bottom controls */}
        <div className="h-4"></div>
      </div>

      {/* Editor Controls - Aligned with Timer View */}
      <div className="w-full px-4 pb-2 shrink-0 z-20">
          <div className={controlBoxClass}>
             <div className="flex items-center gap-3">
                 <button 
                    onClick={resetEditor}
                    className={`${resetBtn} w-16`}
                    title="Reset Sequence"
                 >
                    <RotateCcw size={20} />
                 </button>

                 <button
                   onClick={toggleTimer}
                   className={`${startBtn} flex-1 gap-2 font-bold tracking-wide`}
                 >
                   <Play size={20} className="fill-current" />
                   <span>START</span>
                 </button>
             </div>
          </div>
      </div>

    </div>
  );
};

export default SequenceView;
