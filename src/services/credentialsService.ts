import { invoke } from "@tauri-apps/api/core";

export const credentialsService = {
  async hasApiKey(): Promise<boolean> {
    try {
      return await invoke<boolean>("has_openai_key");
    } catch {
      return false;
    }
  },

  async validateAndStoreKey(key: string): Promise<void> {
    return invoke("validate_and_store_openai_key", { key });
  },

  async deleteApiKey(): Promise<void> {
    return invoke("delete_openai_key");
  },
};
