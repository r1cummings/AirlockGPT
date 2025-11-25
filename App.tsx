import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { MessageList } from './components/MessageList';
import { InputArea } from './components/InputArea';
import { TopBar } from './components/TopBar';
import { ChatSession, Message, UploadedFile, LocalModel } from './types';
import { INITIAL_GREETING } from './constants';
import { sendMessage } from './services/geminiService';
import { loadModelsFromDisk } from './services/modelService';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // Model State
  const [models, setModels] = useState<LocalModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isLoadingModels, setIsLoadingModels] = useState(true);

  const [isTyping, setIsTyping] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Handle Theme Change
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Load Models on Mount
  useEffect(() => {
    const initModels = async () => {
      setIsLoadingModels(true);
      const availableModels = await loadModelsFromDisk();
      setModels(availableModels);
      
      // Select the first available model by default
      if (availableModels.length > 0) {
        setSelectedModel(availableModels[0].id);
      }
      setIsLoadingModels(false);
    };
    initModels();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Initialize first session
  useEffect(() => {
    if (sessions.length === 0) {
      createNewSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'New Chat',
      lastModified: Date.now(),
      messages: [
        {
          id: uuidv4(),
          role: 'model',
          content: INITIAL_GREETING,
          timestamp: Date.now()
        }
      ]
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  }, []);

  const handleSendMessage = async (content: string, files: UploadedFile[]) => {
    if (!currentSessionId) return;

    // 1. Add User Message
    const userMsgId = uuidv4();
    const newMessage: Message = {
      id: userMsgId,
      role: 'user',
      content: content + (files.length > 0 ? `\n[Attached: ${files.map(f => f.name).join(', ')}]` : ''),
      timestamp: Date.now()
    };

    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        // Update title if it's currently generic "New Chat"
        const isNewChat = session.messages.length <= 1 || session.title === 'New Chat';
        const newTitle = isNewChat 
          ? (content.slice(0, 30) + (content.length > 30 ? '...' : '')) 
          : session.title;

        return {
          ...session,
          title: newTitle,
          messages: [...session.messages, newMessage],
          lastModified: Date.now()
        };
      }
      return session;
    }));

    setIsTyping(true);

    try {
      // 2. Get Response
      const currentSession = sessions.find(s => s.id === currentSessionId);
      const history = currentSession ? [...currentSession.messages, newMessage] : [newMessage];
      
      // Pass selectedModel (which is the file path) to the service
      const responseText = await sendMessage(history, content, selectedModel, files);

      // 3. Add AI Message
      const aiMsgId = uuidv4();
      const aiMessage: Message = {
        id: aiMsgId,
        role: 'model',
        content: responseText,
        timestamp: Date.now()
      };

      setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            messages: [...session.messages, aiMessage],
            lastModified: Date.now()
          };
        }
        return session;
      }));

    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  return (
    <div className="flex h-screen w-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200 overflow-hidden font-sans transition-colors duration-200">
      <Sidebar 
        sessions={sessions} 
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewSession={createNewSession}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-950 relative transition-colors duration-200">
        <TopBar 
          models={models} 
          selectedModel={selectedModel} 
          onModelChange={setSelectedModel}
          isLoading={isLoadingModels}
        />
        
        <div className="flex-1 overflow-hidden relative z-10 flex flex-col">
          {currentSession && (
            <MessageList 
              messages={currentSession.messages} 
              isTyping={isTyping} 
            />
          )}
        </div>

        <InputArea onSend={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
};

export default App;