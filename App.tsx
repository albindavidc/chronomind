import React, { useState } from 'react';
import Tabs from './components/Tabs';
import TimerView from './components/TimerView';
import StopwatchView from './components/StopwatchView';
import { Tab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('timer');

  return (
    <div className="h-[100dvh] bg-black text-white flex flex-col font-sans selection:bg-gray-800 overflow-hidden relative animate-in fade-in duration-700">
      
      {/* Ambient Background Orbs for Glass Effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-orange-900/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Header */}
      <header className="px-6 py-4 shrink-0 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
            <h1 className="text-lg font-bold tracking-wider text-white/90 font-mono">
            CHRONO<span className="text-white/50">MIND</span>
            </h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-lg mx-auto p-4 pb-24 relative flex flex-col min-h-0 z-10">
        {activeTab === 'timer' && (
           <TimerView />
        )}
        
        {activeTab === 'stopwatch' && (
           <StopwatchView />
        )}
      </main>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center z-50 pointer-events-none bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="pointer-events-auto">
          <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
    </div>
  );
};

export default App;