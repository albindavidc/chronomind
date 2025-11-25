import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, Check } from 'lucide-react';
import { getTimerSuggestion } from '../services/geminiService';
import { SmartSuggestion } from '../types';

interface SmartSetupProps {
  onSetTimer: (duration: number) => void;
}

const SmartSetup: React.FC<SmartSetupProps> = ({ onSetTimer }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SmartSuggestion | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSuggestion(null);
    
    const result = await getTimerSuggestion(query);
    setLoading(false);
    if (result) {
      setSuggestion(result);
    }
  };

  return (
    <div className="flex flex-col items-center h-full py-8 w-full max-w-md mx-auto space-y-6 px-4">
      
      <div className="text-center space-y-2 mb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/10 text-purple-400 mb-2">
          <Sparkles size={24} />
        </div>
        <h2 className="text-2xl font-bold text-white">Smart Timer</h2>
        <p className="text-gray-400 text-sm">
          Not sure how long? Ask Gemini.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., Soft boiled egg, Pomodoro..."
          className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl py-4 pl-4 pr-12 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-gray-600"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-purple-600 rounded-lg text-white hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 transition-colors"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
        </button>
      </form>

      {suggestion && (
        <div className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4 animate-fade-in-up">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-white">{suggestion.task}</h3>
              <p className="text-sm text-gray-400 mt-1">{suggestion.reasoning}</p>
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-700 flex items-center justify-between">
            <div className="text-3xl font-mono font-bold text-purple-400">
              {Math.floor(suggestion.durationSeconds / 60)}:{(suggestion.durationSeconds % 60).toString().padStart(2, '0')}
            </div>
            <button
              onClick={() => onSetTimer(suggestion.durationSeconds)}
              className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              <Check size={18} />
              <span>Use Timer</span>
            </button>
          </div>
        </div>
      )}

      {/* Examples */}
      {!suggestion && !loading && (
        <div className="w-full grid grid-cols-2 gap-3 mt-4">
          {['Perfect Pasta', 'Power Nap', 'HIIT Workout', 'Steep Green Tea'].map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setQuery(ex);
              }}
              className="p-3 text-sm text-gray-400 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-purple-500/50 hover:text-purple-400 transition-all text-left"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartSetup;
