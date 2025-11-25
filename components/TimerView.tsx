import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';
import CircularProgress from './CircularProgress';
import { formatTime, playAlarm } from '../utils/time';
import { TimerState } from '../types';

const PRESETS = [60, 180, 300, 600, 1500, 3600];

interface TimerViewProps {
  startDuration?: number;
}

const TimerView: React.FC<TimerViewProps> = ({ startDuration = 300 }) => {
  const [state, setState] = useState<TimerState>({
    isActive: false,
    isPaused: false,
    duration: startDuration,
    timeLeft: startDuration,
    initialDuration: startDuration,
  });

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (state.isActive && !state.isPaused) {
      intervalRef.current = window.setInterval(() => {
        setState((prev) => {
          if (prev.timeLeft <= 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            playAlarm();
            return { ...prev, isActive: false, isPaused: false, timeLeft: 0 };
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
  }, [state.isActive, state.isPaused]);

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

  return (
    <div className="flex flex-col items-center justify-between h-full py-6 space-y-8 w-full max-w-md mx-auto">
      
      {/* Circle & Display */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <CircularProgress progress={progress} color="text-orange-500">
          <div className="text-6xl font-mono font-bold tracking-wider text-white">
            {formatTime(state.timeLeft)}
          </div>
          <div className="text-gray-400 mt-2 text-sm uppercase tracking-widest">
            {state.isActive ? (state.isPaused ? 'Paused' : 'Running') : 'Ready'}
          </div>
        </CircularProgress>
      </div>

      {/* Adjusters (Only when stopped) */}
      {!state.isActive && (
        <div className="flex space-x-6 items-center">
             <button onClick={() => adjustTime(-60)} className="p-4 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 active:scale-95 transition-all">
                <Minus size={24} />
             </button>
             <div className="text-sm font-medium text-gray-500">ADJUST</div>
             <button onClick={() => adjustTime(60)} className="p-4 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 active:scale-95 transition-all">
                <Plus size={24} />
             </button>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center space-x-8">
        <button
          onClick={resetTimer}
          className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all active:scale-95"
        >
          <RotateCcw size={24} />
        </button>

        <button
          onClick={state.isActive ? toggleTimer : startTimer}
          className={`w-24 h-24 flex items-center justify-center rounded-full transition-all active:scale-95 shadow-lg ${
            state.isActive && !state.isPaused
              ? 'bg-red-500/20 text-red-500 border-2 border-red-500'
              : 'bg-green-500 text-black shadow-green-500/50'
          }`}
        >
          {state.isActive && !state.isPaused ? (
            <Pause size={36} fill="currentColor" />
          ) : (
            <Play size={36} fill="currentColor" className="ml-1" />
          )}
        </button>
      </div>

      {/* Presets */}
      <div className="w-full overflow-x-auto no-scrollbar pb-2">
        <div className="flex space-x-3 px-4">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => setDuration(preset)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                state.duration === preset
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {preset < 3600 ? `${preset / 60}m` : `${preset / 3600}h`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimerView;
