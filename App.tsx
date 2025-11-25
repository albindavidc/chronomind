import React, { useState } from 'react';
import Tabs from './components/Tabs';
import TimerView from './components/TimerView';
import StopwatchView from './components/StopwatchView';
import { Tab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('timer');

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-gray-800">
      
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-900 sticky top-0 bg-black/80 backdrop-blur-sm z-10">
        <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-gray-100 to-gray-500 bg-clip-text text-transparent">
          ChronoMind
        </h1>
        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-lg mx-auto p-4 relative overflow-hidden flex flex-col">
        {activeTab === 'timer' && (
           <TimerView />
        )}
        
        {activeTab === 'stopwatch' && (
           <StopwatchView />
        )}
      </main>

      {/* Navigation */}
      <div className="sticky bottom-0 w-full bg-gradient-to-t from-black via-black to-transparent pt-4">
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
};

export default App;