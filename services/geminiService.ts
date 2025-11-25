import { Message, UploadedFile, InferencePayload } from "../types";

// ==================================================================================
// INFERENCE SERVICE (STRICT OFFLINE MODE)
// Handles the routing of chat requests directly to the local Electron/Python backend.
// ==================================================================================

const SYSTEM_INSTRUCTION = `
You are a helpful, secure AI assistant running in an offline environment.
Your primary capability is helping users modify JSON configuration files safely.

When a user provides a JSON file:
1. Return the valid, modified JSON.
2. Provide a brief explanation of the changes made.
3. Keep the tone professional, concise, and helpful.
`;

export const sendMessage = async (
  history: Message[],
  currentMessage: string,
  modelPath: string,
  attachedFiles: UploadedFile[]
): Promise<string> => {

  // --- DEPLOYMENT MODE (OFFLINE SCIF) ---
  if (window.electron) {
    console.log(`[SecureBridge] Sending request to local backend. Model: ${modelPath}`);
    
    try {
      const payload: InferencePayload = {
        modelPath: modelPath,
        messages: history,
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        attachedFiles: attachedFiles
      };

      // Call the exposed Electron API
      const response = await window.electron.generateResponse(payload);
      return response;

    } catch (error) {
      console.error("[SecureBridge] Inference Failed:", error);
      return "Error: Local inference engine failed to respond. Please check the backend logs.";
    }
  }

  // --- NO BRIDGE DETECTED ---
  // Since we are in strict mode, we do not fall back to cloud APIs.
  console.error("Critical Error: Electron bridge not found. This application must be run within the secure wrapper.");
  return "SYSTEM ERROR: Secure Bridge not detected. This application must be run within the authorized executable environment. No external connections are permitted.";
};