import { invoke } from "@tauri-apps/api/core";

export const stealthService = {
  async applyStealthMode(): Promise<boolean> {
    try {
      await invoke("apply_stealth_mode");
      return true;
    } catch {
      return false;
    }
  },
};
