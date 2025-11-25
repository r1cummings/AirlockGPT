import React, { useRef, useState } from 'react';
import { Send, Plus, X, File } from 'lucide-react';
import { UploadedFile } from '../types';

interface InputAreaProps {
  onSend: (message: string, files: UploadedFile[]) => void;
  disabled: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!input.trim() && files.length === 0) || disabled) return;
    onSend(input, files);
    setInput('');
    setFiles([]);
    
    // Reset height
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: UploadedFile[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const text = await file.text();
        newFiles.push({
          name: file.name,
          type: file.type,
          content: text,
          size: file.size
        });
      }
      setFiles([...files, ...newFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const adjustHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      e.target.style.height = 'auto';
      e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div className="pb-6 pt-2 px-4 bg-transparent">
      <div className="max-w-3xl mx-auto relative">
        
        {/* File Preview */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs pl-3 pr-2 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 animate-in fade-in slide-in-from-bottom-2 shadow-sm">
                <File size={14} className="text-zinc-500 dark:text-zinc-400" />
                <span className="font-medium max-w-[150px] truncate">{file.name}</span>
                <button 
                  onClick={() => removeFile(idx)}
                  className="hover:bg-zinc-100 dark:hover:bg-zinc-700 p-0.5 rounded-full transition-colors ml-1"
                >
                  <X size={14} className="text-zinc-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-3xl flex items-end p-2 shadow-sm focus-within:shadow-md focus-within:border-zinc-300 dark:focus-within:border-zinc-600 transition-all">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
            accept=".json,.txt,.md,.csv,.xml,.yml"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-zinc-100 dark:bg-zinc-700/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors shrink-0 m-0.5"
            title="Add attachment"
            disabled={disabled}
          >
            <Plus size={20} />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={adjustHeight}
            onKeyDown={handleKeyDown}
            placeholder="Message Local AI..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-900 dark:text-zinc-100 text-[16px] resize-none py-3.5 px-3 max-h-[200px] placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            rows={1}
            disabled={disabled}
          />

          <button
            onClick={handleSend}
            disabled={disabled || (!input.trim() && files.length === 0)}
            className={`p-2.5 m-0.5 rounded-full transition-all duration-200 shrink-0 ${
              !input.trim() && files.length === 0
                ? 'bg-transparent text-zinc-300 dark:text-zinc-600' 
                : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90'
            }`}
          >
            <Send size={18} className={!input.trim() && files.length === 0 ? '' : 'fill-current'} />
          </button>
        </div>
        
        <div className="text-center mt-3">
             <p className="text-[11px] text-zinc-400 dark:text-zinc-600">AI can make mistakes. Please check important info.</p>
        </div>
      </div>
    </div>
  );
};