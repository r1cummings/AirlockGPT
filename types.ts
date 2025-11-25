export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  type?: 'text' | 'json_artifact';
  language?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  lastModified: number;
  messages: Message[];
}

export interface LocalModel {
  id: string;
  name: string;
  size: string;
  quantization: string;
  path: string;
}

export interface UploadedFile {
  name: string;
  type: string;
  content: string | ArrayBuffer;
  size: number;
}

// ==================================================================================
// DEPLOYMENT INTEGRATION (SCIF BRIDGE)
// These interfaces define the contract between this Frontend and your .exe Backend.
// ==================================================================================

export interface InferencePayload {
  modelPath: string;
  messages: Message[];
  systemInstruction: string;
  temperature: number;
  attachedFiles?: UploadedFile[];
}

export interface ElectronBridge {
  /**
   * Scans the local /models folder and returns .gguf files
   */
  listModels(): Promise<LocalModel[]>;
  
  /**
   * Sends the chat context to the local Python/C++ inference engine
   */
  generateResponse(payload: InferencePayload): Promise<string>;
}

declare global {
  interface Window {
    electron?: ElectronBridge;
  }
}