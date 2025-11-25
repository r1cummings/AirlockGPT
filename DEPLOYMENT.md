# Deployment Guide: From React to SCIF Executable

This guide explains how to wrap the current React Frontend into a standalone `.exe` using **Electron**. 

Since this app relies on `window.electron` to function, you must create an Electron "Main Process" that handles the actual file scanning and LLM inference.

## 1. Project Structure Setup

You will need to reorganize your project slightly to support Electron.

```text
/my-secure-chat
  ├── /src                # (The current React code)
  ├── /electron           # (NEW: Electron backend logic)
  │   ├── main.js
  │   └── preload.js
  ├── /models             # (Where .gguf files go)
  ├── package.json
  └── tsconfig.json
```

## 2. Install Dependencies

You need Electron and a library to run GGUF models (like `node-llama-cpp` or a Python sidecar).

```bash
npm install --save-dev electron electron-builder concurrently wait-on
npm install node-llama-cpp fs-extra
```

## 3. Create the Electron Bridge

You need two files to make `window.electron` work.

### A. `electron/preload.js`
This injects the secure bridge into the browser window.

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  listModels: () => ipcRenderer.invoke('list-models'),
  generateResponse: (payload) => ipcRenderer.invoke('generate-response', payload),
});
```

### B. `electron/main.js`
This is the "Backend" that runs on the user's machine.

```javascript
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { LlamaModel, LlamaContext, LlamaChatSession } = require('node-llama-cpp');

// Determine path to /models (handle dev vs prod)
const isDev = process.env.NODE_ENV === 'development';
const modelsPath = isDev 
  ? path.join(__dirname, '../models') 
  : path.join(process.resourcesPath, 'models');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // Security: Keep true isolation
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    backgroundColor: '#0c0c0e'
  });

  // Load React App
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);
}

// --- IPC HANDLERS (The Implementation of your Interface) ---

// 1. List Models
ipcMain.handle('list-models', async () => {
  if (!fs.existsSync(modelsPath)) return [];
  
  const files = fs.readdirSync(modelsPath);
  return files
    .filter(f => f.endsWith('.gguf'))
    .map(f => {
      const stats = fs.statSync(path.join(modelsPath, f));
      return {
        id: f,
        name: f.replace('.gguf', ''),
        size: (stats.size / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
        path: path.join(modelsPath, f),
        quantization: 'User Provided'
      };
    });
});

// 2. Generate Response (Inference)
ipcMain.handle('generate-response', async (event, payload) => {
  const { modelPath, messages, systemInstruction } = payload;
  
  // Initialize the specific model requested
  const model = new LlamaModel({ modelPath: path.join(modelsPath, modelPath) });
  const context = new LlamaContext({ model });
  const session = new LlamaChatSession({ context, systemPrompt: systemInstruction });

  // Convert chat history to simple string or proper format
  // Note: node-llama-cpp handles history internally in session, 
  // but you might need to feed previous context here depending on library version.
  
  const lastUserMessage = messages[messages.length - 1].content;
  const response = await session.prompt(lastUserMessage);
  
  return response;
});

app.whenReady().then(createWindow);
```

## 4. Configure `package.json` for Building

You need to tell `electron-builder` to include the `/models` folder as an "extra resource" so it sits *outside* the packed `.exe` (allowing users to add files).

```json
{
  "main": "electron/main.js",
  "build": {
    "appId": "com.secure.chat",
    "productName": "SecureChat",
    "directories": {
      "output": "dist"
    },
    "files": [
      "build/**/*", 
      "electron/**/*"
    ],
    "extraResources": [
      {
        "from": "models",
        "to": "models",
        "filter": ["**/*"]
      }
    ],
    "win": {
      "target": "nsis"
    }
  },
  "scripts": {
    "react-start": "react-scripts start",
    "react-build": "react-scripts build",
    "electron-start": "wait-on http://localhost:3000 && electron .",
    "dev": "concurrently \"npm run react-start\" \"npm run electron-start\"",
    "dist": "npm run react-build && electron-builder"
  }
}
```

## 5. Build It

Run the following command to generate your `.exe`:

```bash
npm run dist
```

This will create a `dist/` folder containing `SecureChat Setup.exe` (or an unpacked executable). Users can install it, then navigate to the installation folder's `resources/models` directory to drop in their `.gguf` files.
