import { invoke } from "@tauri-apps/api/core";

export const foregroundGate = {
  async begin(kind: "manual" | "ai_assist" | "live_stt" = "manual"): Promise<string> {
    try {
      return await invoke<string>("foreground_gate_begin", { kind });
    } catch {
      return `${kind}_${Date.now()}`;
    }
  },

  async end(token: string): Promise<void> {
    try {
      await invoke("foreground_gate_end", { token });
    } catch {}
  },

  async isBusy(): Promise<boolean> {
    try {
      return await invoke<boolean>("foreground_gate_is_busy");
    } catch {
      return false;
    }
  },

  async waitUntilIdle(maxWaitMs = 30_000, pollIntervalMs = 250): Promise<void> {
    const start = Date.now();
    while ((await this.isBusy()) && Date.now() - start < maxWaitMs) {
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }
  },
};
