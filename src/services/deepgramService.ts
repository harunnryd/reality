import { invoke } from "@tauri-apps/api/core";

export class DeepgramService {
  private apiKey: string = "";

  public setApiKey(key: string): void {
    this.apiKey = key.trim();
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("reality_deepgram_api_key", this.apiKey);
      } catch {}
    }
  }

  public getApiKey(): string {
    if (this.apiKey) return this.apiKey;
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("reality_deepgram_api_key") || "";
      } catch {}
    }
    return "";
  }

  public isConfigured(): boolean {
    return !!this.getApiKey();
  }

  public async configure(customKey?: string): Promise<boolean> {
    const key = customKey?.trim() || this.getApiKey();
    if (!key) return false;

    this.setApiKey(key);

    try {
      await invoke("configure_stt", { apiKey: key });
      return true;
    } catch {
      return false;
    }
  }

  public async stop(): Promise<void> {
    try {
      await invoke("stop_stt");
    } catch {}
  }
}

export const deepgramService = new DeepgramService();
