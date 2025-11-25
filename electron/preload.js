const { contextBridge, ipcRenderer } = require('electron');

/**
 * SECURE BRIDGE
 * This script runs before the web page loads. It acts as a secure gateway
 * between the unsafe UI (Renderer) and the privileged Backend (Main).
 */

contextBridge.exposeInMainWorld('electron', {
  /**
   * Request the backend to scan the /models directory
   * @returns {Promise<Array>} List of model objects
   */
  listModels: () => ipcRenderer.invoke('list-models'),

  /**
   * Send a full inference request to the local LLM
   * @param {Object} payload - { modelPath, messages, systemInstruction, temperature }
   * @returns {Promise<string>} The generated text
   */
  generateResponse: (payload) => ipcRenderer.invoke('generate-response', payload)
});

console.log('Airlock Secure Bridge Initialized');
