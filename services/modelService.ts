import { LocalModel } from '../types';

export const loadModelsFromDisk = async (): Promise<LocalModel[]> => {
  // 1. DEPLOYMENT MODE: Try Local Bridge (Electron/Python)
  if (window.electron) {
    console.log("System: Bridge detected. Scanning local /models directory...");
    try {
      const models = await window.electron.listModels();
      console.log(`System: Found ${models.length} local models.`);
      return models;
    } catch (error) {
      console.error("System Error: Failed to access local /models directory.", error);
      return [];
    }
  }

  // 2. STRICT MODE: No Fallback
  console.warn("System: No bridge detected. Cannot scan /models.");
  return [];
};