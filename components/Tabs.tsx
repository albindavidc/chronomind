import React from 'react';
import { Timer, Watch } from 'lucide-react';
import { Tab } from '../types';

interface TabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex items-center justify-center gap-1.5 p-1.5 mx-auto bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
      <button
        onClick={() => onTabChange('timer')}
        className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 border ${
          activeTab === 'timer' 
            ? 'bg-white/10 border-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
            : 'bg-transparent border-transparent text-white/40 hover:text-white/80 hover:bg-white/5'
        }`}
      >
        <Timer size={18} strokeWidth={activeTab === 'timer' ? 2.5 : 2} />
        <span className="text-xs font-semibold tracking-wider uppercase">Timer</span>
      </button>
      
      <button
        onClick={() => onTabChange('stopwatch')}
        className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 border ${
          activeTab === 'stopwatch' 
            ? 'bg-white/10 border-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
            : 'bg-transparent border-transparent text-white/40 hover:text-white/80 hover:bg-white/5'
        }`}
      >
        <Watch size={18} strokeWidth={activeTab === 'stopwatch' ? 2.5 : 2} />
        <span className="text-xs font-semibold tracking-wider uppercase">Watch</span>
      </button>
    </div>
  );
};

export default Tabs;