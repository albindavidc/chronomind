
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';
import CircularProgress from './CircularProgress';
import { formatTime } from '../utils/time';
import { playTone } from '../utils/soundEngine';
import { TimerState, SoundId } from '../types';
import { useWakeLock } from '../hooks/useWakeLock';

const PRESETS = [60, 180, 300, 600, 1500, 3600];

interface TimerViewProps {
  startDuration?: number;
  soundId: SoundId;
}

const TimerView: React.FC<TimerViewProps> = ({ startDuration = 300, soundId }) => {
  const [state, setState] = useState<TimerState>({
    isActive: false,
    isPaused: false,
    duration: startDuration,
    timeLeft: startDuration,
    initialDuration: startDuration,
  });

  const intervalRef = useRef<number | null>(null);

  // Keep screen on while timer is running
  useWakeLock(state.isActive && !state.isPaused);

  useEffect(() => {
    if (state.isActive && !state.isPaused) {
      intervalRef.current = window.setInterval(() => {
        setState((prev) => {
          if (prev.timeLeft <= 1) {
            // Timer Finished
            if (intervalRef.current) clearInterval(intervalRef.current);
            playTone(soundId); 
            
            // Auto-Reset: Set isActive to false and reset timeLeft to initialDuration
            return { 
              ...prev, 
              isActive: false, 
              isPaused: false, 
              timeLeft: prev.initialDuration 
            };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isActive, state.isPaused, soundId]);

  const toggleTimer = () => {
    setState((prev) => ({ ...prev, isActive: true, isPaused: !prev.isPaused }));
  };

  const startTimer = () => {
     setState((prev) => ({ ...prev, isActive: true, isPaused: false }));
  }

  const resetTimer = () => {
    setState((prev) => ({
      ...prev,
      isActive: false,
      isPaused: false,
      timeLeft: prev.initialDuration,
      duration: prev.initialDuration,
    }));
  };

  const setDuration = (seconds: number) => {
    setState({
      isActive: false,
      isPaused: false,
      duration: seconds,
      timeLeft: seconds,
      initialDuration: seconds,
    });
  };

  const adjustTime = (amount: number) => {
    if (state.isActive) return;
    
    setState((prev) => {
      const newDuration = Math.max(0, prev.duration + amount);
      return {
        ...prev,
        duration: newDuration,
        timeLeft: newDuration,
        initialDuration: newDuration,
      };
    });
  };

  const progress = state.duration > 0 ? state.timeLeft / state.duration : 0;

  // Glassmorphism Button Base
  const glassButton = "relative h-12 sm:h-14 w-full rounded-2xl flex items-center justify-center transition-all duration-300 ease-out backdrop-blur-md border border-white/5 overflow-hidden group";
  
  // Specific Styles
  const controlBtn = `${glassButton} bg-white/5 hover:bg-white/10 active:scale-[0.98] text-white/80 hover:text-white hover:border-white/20`;
  const playBtnIdle = `${glassButton} bg-white/10 hover:bg-white/15 border-white/10 text-green-400 hover:shadow-[0_0_20px_rgba(74,222,128,0.2)] active:scale-[0.98]`;
  const playBtnRunning = `${glassButton} bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:bg-red-500/20 active:scale-[0.98]`;
  const playBtnPaused = `${glassButton} bg-green-500/10 border-green-500/20 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.1)] hover:bg-green-500/20 active:scale-[0.98]`;

  return (
    <div className="flex flex-col items-center h-full w-full max-w-md mx-auto">
      
      {/* 1. Circle Timer (Flexible Space) */}
      <div className="flex-1 min-h-0 w-full flex flex-col justify-center items-center py-2 relative">
        {/* Glow behind timer */}
        <div className="absolute w-[200px] h-[200px] bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <CircularProgress progress={progress} color="text-white/90">
          <div className="text-5xl sm:text-6xl font-mono font-bold tracking-wider text-white drop-shadow-2xl">
            {formatTime(state.timeLeft)}
          </div>
          <div className="text-white/40 mt-2 text-xs sm:text-sm uppercase tracking-[0.2em] font-medium">
            {state.isActive ? (state.isPaused ? 'Paused' : 'Focus') : 'Ready'}
          </div>
        </CircularProgress>
      </div>

      {/* 2. Presets - Glass Bubbles */}
      <div className="w-full shrink-0">
        <div className="flex justify-center space-x-3 overflow-x-auto no-scrollbar px-4 py-4">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => setDuration(preset)}
              className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all duration-300 backdrop-blur-sm border ${
                state.duration === preset
                  ? 'bg-orange-500/80 border-orange-400/50 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] scale-110'
                  : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              {preset < 3600 ? `${preset / 60}m` : `${preset / 3600}h`}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Glass Control Box */}
      <div className="w-full px-4 pb-2 shrink-0">
        <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 p-3 sm:p-4 rounded-[1.5rem] shadow-2xl shadow-black/50">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            
            {/* Row 1: Adjusters */}
            <button 
              onClick={() => adjustTime(-60)} 
              disabled={state.isActive}
              className={`${controlBtn} ${state.isActive ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
               <Minus size={20} className="sm:w-6 sm:h-6" />
            </button>

            <button 
              onClick={() => adjustTime(60)} 
              disabled={state.isActive}
              className={`${controlBtn} ${state.isActive ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
               <Plus size={20} className="sm:w-6 sm:h-6" />
            </button>

            {/* Row 2: Actions */}
            <button 
              onClick={resetTimer}
              className={`${controlBtn} hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/20 transition-colors`}
            >
              <RotateCcw size={20} className="sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={state.isActive ? toggleTimer : startTimer}
              className={state.isActive 
                ? (state.isPaused ? playBtnPaused : playBtnRunning)
                : playBtnIdle
              }
            >
              {state.isActive && !state.isPaused ? (
                <Pause size={24} className="sm:w-7 sm:h-7 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" fill="currentColor" />
              ) : (
                <Play size={24} className="sm:w-7 sm:h-7 ml-1 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" fill="currentColor" />
              )}
            </button>

          </div>
        </div>
      </div>

    </div>
  );
};

export default TimerView;
