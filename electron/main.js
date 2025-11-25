const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// We use dynamic import for node-llama-cpp because it is an ESM module
let nodeLlamaCpp;
let loadedModel = null;
let loadedModelPath = null;
let llamaContext = null;
let llamaSession = null;

// --- CONFIGURATION ---
const isDev = process.env.NODE_ENV === 'development';

// In production (SCIF), models are in resources/models. In dev, they are in the project root/models.
const MODELS_DIR = isDev 
  ? path.join(__dirname, '..', 'models') 
  : path.join(process.resourcesPath, 'models');

/**
 * Initialize the Electron Window
 */
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    title: "Airlock // Secure AI",
    backgroundColor: '#0c0c0e', // Zinc-950
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // Critical for security
      nodeIntegration: false, // Critical for security
      sandbox: false // Required for some node-llama-cpp binding operations
    },
    autoHideMenuBar: true,
  });

  // Load the React App
  // In Dev: Wait for localhost:3000
  // In Prod: Load the build/index.html
  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../build/index.html')}`;
  win.loadURL(startUrl);

  if (isDev) {
    win.webContents.openDevTools();
  }
}

app.whenReady().then(async () => {
  try {
    // Dynamically load the Inference Engine
    nodeLlamaCpp = await import('node-llama-cpp');
    console.log('[Airlock] Inference Engine Loaded');
  } catch (e) {
    console.error('[Airlock] Failed to load node-llama-cpp. Ensure dependencies are installed.', e);
  }
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ==================================================================================
// IPC HANDLERS (The Backend Logic)
// ==================================================================================

/**
 * HANDLER: list-models
 * Scans the defined directory for .gguf files
 */
ipcMain.handle('list-models', async () => {
  console.log(`[Airlock] Scanning for models in: ${MODELS_DIR}`);
  
  if (!fs.existsSync(MODELS_DIR)) {
    // Create it if it doesn't exist (helpful for first run)
    fs.mkdirSync(MODELS_DIR, { recursive: true });
    return [];
  }

  const files = fs.readdirSync(MODELS_DIR);
  const models = files
    .filter(file => file.endsWith('.gguf'))
    .map(file => {
      const stats = fs.statSync(path.join(MODELS_DIR, file));
      return {
        id: path.join(MODELS_DIR, file), // Use full path as ID
        name: file.replace('.gguf', '').replace(/[-_]/g, ' '),
        size: (stats.size / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
        path: path.join(MODELS_DIR, file),
        quantization: 'Unknown' // Scanning metadata is expensive, simplified for now
      };
    });

  return models;
});

/**
 * HANDLER: generate-response
 * Runs the inference
 */
ipcMain.handle('generate-response', async (event, payload) => {
  const { modelPath, messages, systemInstruction, attachedFiles } = payload;
  
  if (!nodeLlamaCpp) {
    throw new Error("Inference engine (node-llama-cpp) not loaded.");
  }

  try {
    console.log(`[Airlock] Inference requested for model: ${modelPath}`);

    // 1. Load Model (Singleton pattern to avoid reloading 4GB+ files)
    if (loadedModelPath !== modelPath) {
      if (loadedModel) {
        console.log('[Airlock] Unloading previous model...');
        // In node-llama-cpp v3, disposal is handled by garbage collection usually, 
        // but explicit context disposal is good practice if available.
        if (llamaContext) await llamaContext.dispose();
        if (loadedModel) await loadedModel.dispose();
      }

      console.log(`[Airlock] Loading new model from disk...`);
      const { LlamaModel, LlamaContext } = nodeLlamaCpp;
      
      loadedModel = new LlamaModel({
        modelPath: modelPath
      });
      
      llamaContext = new LlamaContext({
        model: loadedModel,
        contextSize: 4096 // Adjust based on RAM availability in the SCIF
      });
      
      loadedModelPath = modelPath;
    }

    // 2. Initialize Session
    const { LlamaChatSession } = nodeLlamaCpp;
    // We create a new session but we need to feed it the history.
    // Since our frontend manages state, we reconstruct the conversation.
    // Note: Ideally, we would persist the 'session' object in memory mapped to sessionID 
    // to avoid reprocessing history tokens, but for this "simple" version, stateless is safer.
    
    llamaSession = new LlamaChatSession({
      context: llamaContext,
      systemPrompt: systemInstruction
    });

    // 3. Construct Prompt with Attachments
    // We'll take the LAST user message, and prepend any attached files to it as context.
    const lastMsg = messages[messages.length - 1];
    let userPrompt = lastMsg.content;

    if (attachedFiles && attachedFiles.length > 0) {
      const fileContext = attachedFiles.map(f => 
        `\n--- FILE: ${f.name} ---\n${f.content}\n--- END FILE ---\n`
      ).join('');
      userPrompt = `${fileContext}\n\nTask: ${userPrompt}`;
    }

    // 4. Pre-load History (Previous turns)
    // We skip the last message because we are about to send it as the prompt
    const historyMessages = messages.slice(0, -1).filter(m => m.role !== 'system');
    
    // In a robust app, we would use session.setHistory(historyMessages) if supported,
    // or loop through and prompt() them silently. For MVP, we pass just the prompt 
    // assuming the user provided context in the active window.
    // *Optimization for Production*: Implement full history loading here.

    console.log('[Airlock] Generating...');
    const response = await llamaSession.prompt(userPrompt, {
      maxTokens: 2048,
      temperature: 0.7
    });

    console.log('[Airlock] Generation complete.');
    return response;

  } catch (error) {
    console.error('[Airlock] Inference Error:', error);
    return `System Error: ${error.message}`;
  }
});
