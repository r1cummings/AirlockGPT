# Project Folder Structure

This document outlines the directory structure for **Airlock**. Use this as a map to ensure you have placed all files in the correct locations.

## 📂 Source Code (Development)

This is how your project should look while you are writing code.

```text
Airlock/
├── package.json              # Dependencies and build scripts (see DEPLOYMENT.md)
├── tsconfig.json             # TypeScript configuration
├── README.md                 # General documentation
├── DEPLOYMENT.md             # How to build the .exe
├── FOLDER_STRUCTURE.md       # This file
├── index.html                # The entry HTML file (Frontend)
├── index.tsx                 # React Entry point
├── App.tsx                   # Main React Application Component
├── types.ts                  # TypeScript Interfaces (Bridge contract)
├── constants.ts              # Global constants
├── metadata.json             # App metadata
│
├── electron/                 # 🔌 THE BACKEND (Node.js + Electron)
│   ├── main.js               # The Inference Engine & Main Process
│   └── preload.js            # The Secure Bridge (IPC)
│
├── components/               # 🧩 REACT UI COMPONENTS
│   ├── Sidebar.tsx           # Chat history sidebar
│   ├── MessageList.tsx       # The chat area (bubbles + markdown)
│   ├── InputArea.tsx         # Input bar + file uploads
│   └── TopBar.tsx            # Model selector & header
│
├── services/                 # ⚙️ LOGIC LAYERS
│   ├── geminiService.ts      # (Now localService) Sends data to Electron
│   └── modelService.ts       # Asks Electron for list of models
│
└── models/                   # 🧠 LOCAL MODELS (Dev Mode)
    └── PUT_GGUF_FILES_HERE.txt
```

---

## 📦 Built Application (The SCIF Executable)

After you run `npm run dist` (see DEPLOYMENT.md), the tool will generate a `dist/` folder. This is the folder structure inside the final `win-unpacked` directory that you move to the secure environment.

```text
dist/win-unpacked/
├── Airlock.exe               # The Application to Run
├── ... (dlls and dependencies)
│
└── resources/                # 🔒 EXTERNAL RESOURCES
    └── models/               # <--- DROP GGUF FILES HERE IN THE SCIF
        ├── llama-3-8b.gguf
        ├── mistral-7b.gguf
        └── ...
```

### Key Paths Explained

*   **`electron/main.js`**: This is the "Brain". It starts the window and loads the compiled React code. It also runs the `node-llama-cpp` logic to read the `.gguf` files.
*   **`electron/preload.js`**: This is the "Security Guard". It sits between the React window and the Node.js system, only allowing specific functions (`listModels`, `generateResponse`) to pass through.
*   **`models/`**: In development, this is in your root. In production, it lives inside `resources/` so users can add files without recompiling the code.
