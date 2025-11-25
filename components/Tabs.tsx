import React from 'react';
import { Timer, Watch } from 'lucide-react';
import { Tab } from '../types';

interface TabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex items-center justify-around w-full max-w-md mx-auto bg-gray-900/90 backdrop-blur-md border-t border-gray-800 p-2 pb-6 md:pb-2 md:rounded-full md:mb-4 md:border">
      <button
        onClick={() => onTabChange('timer')}
        className={`flex flex-col items-center space-y-1 p-2 rounded-xl w-20 transition-all ${
          activeTab === 'timer' ? 'text-orange-500' : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        <Timer size={24} strokeWidth={activeTab === 'timer' ? 2.5 : 2} />
        <span className="text-[10px] font-medium tracking-wide">Timer</span>
      </button>
      
      <button
        onClick={() => onTabChange('stopwatch')}
        className={`flex flex-col items-center space-y-1 p-2 rounded-xl w-20 transition-all ${
          activeTab === 'stopwatch' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        <Watch size={24} strokeWidth={activeTab === 'stopwatch' ? 2.5 : 2} />
        <span className="text-[10px] font-medium tracking-wide">Stopwatch</span>
      </button>
    </div>
  );
};

export default Tabs;