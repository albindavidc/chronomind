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
  
  const requestRef = useRef<number>();

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
      // If we are starting/resuming, we need to adjust startTime so elapsed is correct
      // effectively: startTime = now - elapsed
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
    <div className="flex flex-col items-center justify-between h-full py-6 space-y-6 w-full max-w-md mx-auto">
      
      {/* Main Display */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-72 h-72 rounded-full border-4 border-gray-800 flex items-center justify-center bg-gray-900 shadow-inner shadow-black">
            <div className="text-5xl font-mono font-bold text-blue-400 tracking-wider">
            {formatStopwatch(state.elapsed)}
            </div>
            {/* Ticks decoration */}
            <div className="absolute inset-0 rounded-full border border-gray-800 opacity-20 pointer-events-none" style={{ margin: -10 }}></div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-8 w-full justify-center">
        {!state.isActive && state.elapsed === 0 ? (
           // Start State
             <button
            onClick={toggleStopwatch}
            className="w-20 h-20 flex items-center justify-center rounded-full bg-green-500 text-black shadow-lg shadow-green-500/20 active:scale-95 transition-all"
          >
            <Play size={32} fill="currentColor" className="ml-1" />
          </button>
        ) : (
            <>
                 {/* Lap / Reset */}
                <button
                onClick={state.isActive ? addLap : resetStopwatch}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all active:scale-95"
                >
                {state.isActive ? <Flag size={20} /> : <RotateCcw size={20} />}
                </button>

                {/* Start / Stop */}
                <button
                onClick={toggleStopwatch}
                className={`w-20 h-20 flex items-center justify-center rounded-full transition-all active:scale-95 shadow-lg ${
                    state.isActive
                    ? 'bg-red-500 text-white shadow-red-500/20'
                    : 'bg-green-500 text-black shadow-green-500/20'
                }`}
                >
                {state.isActive ? (
                    <Pause size={32} fill="currentColor" />
                ) : (
                    <Play size={32} fill="currentColor" className="ml-1" />
                )}
                </button>
            </>
        )}
      </div>

      {/* Laps List */}
      <div className="w-full flex-1 min-h-[150px] max-h-[250px] overflow-y-auto no-scrollbar bg-gray-900/50 rounded-xl border border-gray-800 p-4">
        {state.laps.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-600 text-sm italic">
            No laps recorded yet
          </div>
        ) : (
          <div className="space-y-2">
            {state.laps.map((lap, index) => (
              <div key={lap.id} className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-800 transition-colors">
                <span className="text-gray-500 font-mono w-10">#{state.laps.length - index}</span>
                <span className="text-white font-mono">{formatStopwatch(lap.lapTime)}</span>
                <span className="text-gray-400 font-mono text-xs">{formatStopwatch(lap.time)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StopwatchView;
