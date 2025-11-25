# Airlock UI 🔒

**Secure. Offline. Local.**

Airlock is a modern, clean interface designed for air-gapped (SCIF) environments. It enables non-technical users to interact with Local Large Language Models (LLMs) and modify JSON configuration files without needing command-line knowledge or internet access.

> **Note for Developers:** This is the Frontend layer. It is designed to run inside a secure wrapper (like Electron) that provides a `window.electron` bridge to a Python/C++ backend (llama.cpp).

## Features
*   **Zero Network:** Designed to run without any outbound connections.
*   **Local Inference:** Connects to local GGUF models via IPC.
*   **JSON Assistant:** Specialized formatting for viewing and editing configuration artifacts.
*   **File System Mode:** Simulates a local file environment.

## Quick Start (End User)

1.  **Launch**: Open `Airlock.exe`.
2.  **Select Model**: Choose a model from the top dropdown (populated from the `/models` folder).
3.  **Chat**: Interact naturally.
4.  **Edit Configs**: Use the **+** button to upload JSON files for analysis.

## 🛠️ Developer Guide

### 1. Architecture
The app follows a "Zero Trust" frontend architecture:
*   **Frontend**: React + Tailwind (UI).
*   **Bridge**: `window.electron` (IPC layer).
*   **Backend**: Electron + node-llama-cpp (Inference).

### 2. True Offline Build (CRITICAL)
This repository uses **CDNs** in `index.html` for easy web previewing. **For a SCIF deployment, you must bundle these dependencies.**

When building the final Electron app:
1.  Run `npm install react react-dom react-markdown lucide-react ...`
2.  Remove the `<script src="...">` CDN tags in `index.html`.
3.  Remove the `importmap` in `index.html`.
4.  Use a bundler (Vite/Webpack/Parcel) to compile the React code into a single `bundle.js`.

### 3. Folder Structure
The final executable expects this structure:
```text
Airlock/
├── Airlock.exe
├── resources/
└── models/             # <--- Users drop .gguf files here
    ├── llama-3.gguf
    └── README.txt
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
