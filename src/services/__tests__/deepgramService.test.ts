import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeepgramService } from "../deepgramService";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn().mockResolvedValue({ status: "ok" }),
}));

describe("DeepgramService", () => {
  let service: DeepgramService;

  beforeEach(() => {
    service = new DeepgramService();
  });

  it("stores and retrieves API key correctly", () => {
    service.setApiKey("test-deepgram-key-12345");
    expect(service.getApiKey()).toBe("test-deepgram-key-12345");
    expect(service.isConfigured()).toBe(true);
  });

  it("configure sends IPC to Rust sidecar bridge", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    service.setApiKey("test-deepgram-key-12345");

    const result = await service.configure();
    expect(result).toBe(true);
    expect(invoke).toHaveBeenCalledWith("configure_stt", {
      apiKey: "test-deepgram-key-12345",
    });
  });

  it("stop sends IPC to Rust sidecar bridge", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    await service.stop();
    expect(invoke).toHaveBeenCalledWith("stop_stt");
  });
});
