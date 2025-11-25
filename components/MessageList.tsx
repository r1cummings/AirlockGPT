import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Bot, User, Copy, Check, FileJson } from 'lucide-react';
import { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isTyping }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-0">
      <div className="max-w-3xl mx-auto py-8 space-y-8">
        {messages.map((msg, index) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* Avatar for Model */}
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                <Bot size={16} className="text-zinc-600 dark:text-zinc-300" />
              </div>
            )}

            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
              <div className={`text-xs text-zinc-400 dark:text-zinc-500 mb-1 px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.role === 'user' ? 'You' : 'Assistant'}
              </div>

              <div 
                className={`text-[15px] leading-7 rounded-2xl px-5 py-3 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-br-none' 
                    : 'text-zinc-800 dark:text-zinc-100 pl-0 pt-0 shadow-none'
                }`}
              >
                <ReactMarkdown
                  components={{
                    // Custom Code Block Renderer
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeText = String(children).replace(/\n$/, '');
                      const isJson = match && match[1] === 'json';
                      
                      return !inline && match ? (
                        <div className="my-4 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-[#1e1e1e]">
                          <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
                            <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                              {isJson && <FileJson size={14} className="text-blue-400" />}
                              <span>{match[1]}</span>
                            </div>
                            <button 
                              onClick={() => copyToClipboard(codeText, msg.id + match[1])}
                              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                            >
                              {copiedId === (msg.id + match[1]) ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                              <span>{copiedId === (msg.id + match[1]) ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <SyntaxHighlighter
                            style={vscDarkPlus as any}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent', fontSize: '13px' }}
                            {...props}
                          >
                            {codeText}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code className="bg-zinc-200 dark:bg-zinc-700/50 text-zinc-800 dark:text-zinc-200 px-1.5 py-0.5 rounded text-[13px] font-mono" {...props}>
                          {children}
                        </code>
                      );
                    },
                    p: ({children}) => <p className="mb-4 last:mb-0">{children}</p>,
                    ul: ({children}) => <ul className="list-disc pl-4 mb-4 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal pl-4 mb-4 space-y-1">{children}</ol>,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-sm">
               <Bot size={16} className="text-zinc-600 dark:text-zinc-300" />
            </div>
            <div className="flex items-center gap-1.5 h-8 pl-1">
              <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-bounce"></span>
            </div>
          </div>
        )}
        
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
};