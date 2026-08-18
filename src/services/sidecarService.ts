import { invoke } from "@tauri-apps/api/core";

export interface SidecarHealthStatus {
  is_alive: boolean;
  pid: number | null;
  uptime_seconds: number;
  engine_type: string;
  orchestrator: string;
}

export const sidecarService = {
  async getStatus(): Promise<SidecarHealthStatus> {
    try {
      return await invoke<SidecarHealthStatus>("get_sidecar_status");
    } catch {
      return {
        is_alive: false,
        pid: null,
        uptime_seconds: 0,
        engine_type: "reality_neural_engine",
        orchestrator: "Reality Intelligent Copilot Engine",
      };
    }
  },

  async ping(message: string = "hello"): Promise<any> {
    try {
      return await invoke("ping_sidecar", { message });
    } catch (err) {
      return { pong: false, error: String(err) };
    }
  },
};
