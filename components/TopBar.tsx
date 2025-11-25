import React, { useState } from 'react';
import { ChevronDown, ShieldCheck, RefreshCw } from 'lucide-react';
import { LocalModel } from '../types';

interface TopBarProps {
  models: LocalModel[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  isLoading?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ models, selectedModel, onModelChange, isLoading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentModel = models.find(m => m.id === selectedModel);

  return (
    <div className="h-16 flex items-center justify-between px-6 shrink-0 z-20 transition-colors duration-200">
      
      {/* Left Spacer / Security Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900/50 rounded-full border border-zinc-200 dark:border-zinc-800/50 transition-colors">
        <ShieldCheck size={14} className="text-emerald-500" />
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Secure Environment</span>
      </div>

      {/* Prominent Model Selector Dropdown */}
      <div className="relative">
        <button 
          onClick={() => !isLoading && setIsOpen(!isOpen)}
          disabled={isLoading}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 transition-all group font-medium border border-zinc-200 dark:border-zinc-700 ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <RefreshCw size={14} className="animate-spin text-zinc-500" />
              <span className="text-sm md:text-base text-zinc-500">Scanning models...</span>
            </div>
          ) : (
            <>
              <span className="text-sm md:text-base">{currentModel?.name || 'Select Model'}</span>
              <ChevronDown size={16} className={`text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>

        {isOpen && !isLoading && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-20 overflow-hidden py-1 transition-colors">
              <div className="px-3 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center">
                <span>Available Local Models</span>
                <span className="text-[10px] bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">/models</span>
              </div>
              
              {models.length === 0 ? (
                <div className="p-4 text-center text-sm text-zinc-500">
                  No .gguf files found in /models
                </div>
              ) : (
                models.map(model => (
                  <button
                    key={model.id}
                    onClick={() => {
                      onModelChange(model.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between group transition-colors ${
                      selectedModel === model.id ? 'bg-zinc-50 dark:bg-zinc-800/50' : ''
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className={`text-sm font-medium ${selectedModel === model.id ? 'text-blue-600 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>
                        {model.name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-zinc-500 font-mono">
                          {model.size}
                        </span>
                        {model.quantization && (
                          <span className="text-[10px] px-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                            {model.quantization}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedModel === model.id && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm"></div>
                    )}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Right Spacer to keep center alignment */}
      <div className="w-[140px] hidden md:block"></div> 
    </div>
  );
};
