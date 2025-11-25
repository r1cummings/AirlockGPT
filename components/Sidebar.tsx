import React from 'react';
import { 
  MessageSquare, 
  Plus, 
  Settings,
  MoreHorizontal,
  Sun,
  Moon
} from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewSession,
  theme,
  toggleTheme
}) => {
  return (
    <div className="w-[260px] bg-zinc-50 dark:bg-black flex flex-col h-full shrink-0 border-r border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
      
      {/* New Chat Button */}
      <div className="p-3">
        <button 
          onClick={onNewSession}
          className="w-full flex items-center justify-between px-3 py-3 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors text-sm font-medium border border-zinc-200 dark:border-zinc-800/50 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Plus size={16} />
            <span>New chat</span>
          </div>
          <div className="text-zinc-400">
            <MessageSquare size={14} />
          </div>
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="text-xs font-medium text-zinc-500 mb-3 px-2">History</div>
        
        <div className="space-y-1">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`group w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-3 transition-colors relative ${
                currentSessionId === session.id 
                  ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <span className="truncate flex-1">{session.title}</span>
              
              {/* Hover Menu Mockup */}
              <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${currentSessionId === session.id ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-600'}`}>
                <MoreHorizontal size={14} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* User / Footer */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 mt-auto space-y-1">
        
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-900 transition-colors text-zinc-600 dark:text-zinc-400"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span className="text-sm">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>

        <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-900 transition-colors text-zinc-600 dark:text-zinc-300">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            AL
          </div>
          <div className="flex-1 text-left text-sm">
            <div className="font-medium text-zinc-900 dark:text-white">Airlock User</div>
            <div className="text-xs text-zinc-500">Secure Mode</div>
          </div>
          <Settings size={16} className="text-zinc-400" />
        </button>
      </div>
    </div>
  );
};