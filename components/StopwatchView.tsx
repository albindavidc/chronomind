import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Flag, RotateCcw } from 'lucide-react';
import { formatStopwatch } from '../utils/time';
import { StopwatchState, Lap } from '../types';

const StopwatchView: React.FC = () => {
  const [state, setState] = useState<StopwatchState>({
    isActive: false,
    startTime: 0,
    elapsed: 0,
    laps: [],
  });
  
  const requestRef = useRef<number | null>(null);

  const animate = (time: number) => {
    setState((prev) => {
      if (!prev.isActive) return prev;
      const now = Date.now();
      return {
        ...prev,
        elapsed: now - prev.startTime,
      };
    });
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (state.isActive) {
      setState(prev => ({ ...prev, startTime: Date.now() - prev.elapsed }));
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [state.isActive]);

  const toggleStopwatch = () => {
    setState((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const resetStopwatch = () => {
    setState({
      isActive: false,
      startTime: 0,
      elapsed: 0,
      laps: [],
    });
  };

  const addLap = () => {
    setState((prev) => {
      const lastLapTime = prev.laps.length > 0 ? prev.laps[0].time : 0;
      const currentLapTime = prev.elapsed - lastLapTime;
      const newLap: Lap = {
        id: prev.laps.length + 1,
        time: prev.elapsed,
        lapTime: currentLapTime,
      };
      return {
        ...prev,
        laps: [newLap, ...prev.laps],
      };
    });
  };

  return (
    <div className="flex flex-col items-center justify-between h-full py-2 space-y-4 w-full max-w-md mx-auto">
      
      {/* Main Display (Glass Lens) */}
      <div className="flex-1 min-h-0 flex items-center justify-center w-full aspect-square max-h-[300px]">
        <div className="relative w-full h-full rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-sm shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-wider drop-shadow-md">
            {formatStopwatch(state.elapsed)}
            </div>
            {/* Ticks decoration */}
            <div className="absolute inset-4 rounded-full border border-dashed border-white/10 pointer-events-none"></div>
        </div>
      </div>

      {/* Controls - Glass Buttons */}
      <div className="flex items-center space-x-6 w-full justify-center shrink-0">
        {!state.isActive && state.elapsed === 0 ? (
           // Start State
             <button
            onClick={toggleStopwatch}
            className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.2)] hover:bg-white/20 active:scale-95 transition-all"
          >
            <Play size={28} className="sm:w-8 sm:h-8 fill-current drop-shadow-sm" />
          </button>
        ) : (
            <>
                 {/* Lap / Reset */}
                <button
                onClick={state.isActive ? addLap : resetStopwatch}
                className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-gray-300 hover:bg-white/10 transition-all active:scale-95"
                >
                {state.isActive ? <Flag size={20} /> : <RotateCcw size={20} />}
                </button>

                {/* Start / Stop */}
                <button
                onClick={toggleStopwatch}
                className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full border backdrop-blur-md transition-all active:scale-95 ${
                    state.isActive
                    ? 'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:bg-red-500/20'
                    : 'bg-green-500/10 border-green-500/20 text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.2)] hover:bg-green-500/20'
                }`}
                >
                {state.isActive ? (
                    <Pause size={28} className="sm:w-8 sm:h-8 fill-current" />
                ) : (
                    <Play size={28} className="sm:w-8 sm:h-8 ml-1 fill-current" />
                )}
                </button>
            </>
        )}
      </div>

      {/* Laps List (Glass Pane) */}
      <div className="w-full flex-1 min-h-0 overflow-y-auto no-scrollbar bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-lg">
        {state.laps.length === 0 ? (
          <div className="h-full flex items-center justify-center text-white/20 text-sm font-medium">
            No laps recorded yet
          </div>
        ) : (
          <div className="space-y-2">
            {state.laps.map((lap, index) => (
              <div key={lap.id} className="flex justify-between items-center text-sm p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <span className="text-white/40 font-mono w-8">#{state.laps.length - index}</span>
                <span className="text-white font-mono">{formatStopwatch(lap.lapTime)}</span>
                <span className="text-white/60 font-mono text-xs">{formatStopwatch(lap.time)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StopwatchView;