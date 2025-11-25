# Deployment Guide: SCIF Executable

This repository now includes the full **Electron Backend** in the `electron/` folder. You do not need to write code. You only need to install dependencies and build.

## 1. Prerequisites
You need **Node.js** (v18 or higher) and **Python** (for building the llama.cpp bindings).

## 2. Setup

Add the following to your `package.json` (create one if missing):

```json
{
  "name": "airlock-ui",
  "version": "1.0.0",
  "main": "electron/main.js",
  "scripts": {
    "start": "concurrently \"react-scripts start\" \"wait-on http://localhost:3000 && electron .\"",
    "build": "react-scripts build",
    "pack": "npm run build && electron-builder --dir",
    "dist": "npm run build && electron-builder"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "lucide-react": "^0.263.1",
    "react-markdown": "^8.0.7",
    "react-syntax-highlighter": "^15.5.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "electron": "^26.0.0",
    "electron-builder": "^24.6.3",
    "node-llama-cpp": "^2.6.0", 
    "concurrently": "^8.2.0",
    "wait-on": "^7.0.1"
  },
  "build": {
    "appId": "com.secure.airlock",
    "files": ["build/**/*", "electron/**/*"],
    "extraResources": [
      {
        "from": "models",
        "to": "models",
        "filter": ["**/*"]
      }
    ]
  }
}
```

> **Note on node-llama-cpp**: This library compiles `llama.cpp` locally. The first time you run `npm install`, it may take a few minutes to compile the binaries.

## 3. Installation

```bash
npm install
```

## 4. Building the Executable

```bash
npm run dist
```

This will produce an executable in the `dist/` folder.

## 5. Post-Build Setup (The SCIF Step)

1.  Take the generated folder (e.g., `dist/win-unpacked`).
2.  Go to `resources/models`.
3.  Drop your `.gguf` files (e.g., Llama-3-8B.gguf) into this folder.
4.  Zip the folder and move it to your secure environment.
5.  Run `Airlock UI.exe`.

## Troubleshooting

*   **"Inference engine not loaded"**: Ensure you ran `npm install` successfully and that `node-llama-cpp` compiled without errors.
*   **"Scanning models..." forever**: Ensure the `models` folder exists in `resources/models` relative to the executable.
