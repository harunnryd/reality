import { describe, it, expect, vi } from "vitest";

const mockInvoke = vi.fn();
vi.mock("@tauri-apps/api/core", () => ({
  invoke: (...args: any[]) => mockInvoke(...args),
}));

import { audioService } from "../audioService";
import { stealthService } from "../stealthService";
import { visionService } from "../visionService";
import { sidecarService } from "../sidecarService";
import { systemService } from "../systemService";
import { shortcutsService } from "../shortcutsService";
import { foregroundGate } from "../foregroundGate";
import { documentService } from "../documentService";

describe("Native Services - Table-Driven Unit Tests", () => {
  it("fetches audio input devices list via Tauri invoke", async () => {
    mockInvoke.mockResolvedValueOnce([
      { id: "default", name: "Default System Microphone", is_default: true },
      { id: "airpods", name: "AirPods Pro", is_default: false },
    ]);

    const devices = await audioService.listInputDevices();
    expect(devices.length).toBe(2);
    expect(devices[0]?.name).toBe("Default System Microphone");
  });

  it("fetches audio output devices list via Tauri invoke", async () => {
    mockInvoke.mockResolvedValueOnce([
      { id: "default_speaker", name: "MacBook Pro Speakers", is_default: true },
    ]);

    const devices = await audioService.listOutputDevices();
    expect(devices.length).toBe(1);
    expect(devices[0]?.id).toBe("default_speaker");
  });

  it("handles audio session lifecycle via Tauri invoke", async () => {
    mockInvoke.mockResolvedValueOnce({
      is_running: true,
      current_device: "airpods-pro",
      frames_captured: 0,
      is_speech_active: false,
    });

    const startState = await audioService.startSession({
      mic_device_id: "airpods-pro",
      capture_system_audio: true,
      vad_enabled: true,
    });
    expect(startState.is_running).toBe(true);
    expect(startState.current_device).toBe("airpods-pro");

    mockInvoke.mockResolvedValueOnce({
      is_running: false,
      current_device: "none",
      frames_captured: 120,
      is_speech_active: false,
    });

    const stopState = await audioService.stopSession();
    expect(stopState.is_running).toBe(false);
  });

  it("detects active meeting apps via Tauri invoke", async () => {
    mockInvoke.mockResolvedValueOnce([
      {
        name: "Zoom Workplace",
        platform: "zoom",
        bundle_id: "us.zoom.xos",
        is_meeting_active: true,
      },
    ]);

    const apps = await systemService.detectActiveMeetingApps();
    expect(apps.length).toBe(1);
    expect(apps[0]?.platform).toBe("zoom");
  });

  it("sets process disguise via Tauri invoke", async () => {
    mockInvoke.mockResolvedValueOnce(true);
    const success = await systemService.setProcessDisguise("System Settings");
    expect(success).toBe(true);
  });

  it("checks IME composition active state via Tauri invoke", async () => {
    mockInvoke.mockResolvedValueOnce(false);
    const isIme = await systemService.isCompositionImeActive();
    expect(isIme).toBe(false);
  });

  it("handles foreground priority gate lifecycle via Tauri invoke", async () => {
    mockInvoke.mockResolvedValueOnce("ai_assist_123_456");
    const token = await foregroundGate.begin("ai_assist");
    expect(token).toBe("ai_assist_123_456");

    mockInvoke.mockResolvedValueOnce(true);
    const isBusy = await foregroundGate.isBusy();
    expect(isBusy).toBe(true);

    mockInvoke.mockResolvedValueOnce(undefined);
    await foregroundGate.end(token);
  });

  it("extracts safe document text via Tauri invoke", async () => {
    mockInvoke.mockResolvedValueOnce({
      file_name: "architecture_spec.md",
      extension: "md",
      size_bytes: 1024,
      text_content: "# Reality Architecture Spec",
      is_truncated: false,
    });

    const result = await documentService.extractDocumentText("/path/architecture_spec.md");
    expect(result.file_name).toBe("architecture_spec.md");
    expect(result.text_content).toContain("Reality Architecture");
  });

  it("retrieves available disguises via Tauri invoke", async () => {
    mockInvoke.mockResolvedValueOnce(["Reality", "System Settings", "Terminal"]);
    const list = await systemService.getAvailableDisguises();
    expect(list.length).toBe(3);
    expect(list).toContain("Terminal");
  });

  it("retrieves global shortcuts via Tauri invoke", async () => {
    mockInvoke.mockResolvedValueOnce([
      {
        id: "toggle_hud",
        name: "Toggle Meeting HUD Overlay",
        key_combination: "CommandOrControl+Backslash",
        is_enabled: true,
      },
    ]);

    const shortcuts = await shortcutsService.getGlobalShortcuts();
    expect(shortcuts.length).toBe(1);
    expect(shortcuts[0]?.id).toBe("toggle_hud");
  });

  it("handles audio device fallback on error", async () => {
    mockInvoke.mockRejectedValueOnce(new Error("bridge error"));
    const devices = await audioService.listInputDevices();
    expect(devices.length).toBe(1);
    expect(devices[0]?.id).toBe("default");
  });

  it("applies stealth mode via Tauri invoke", async () => {
    mockInvoke.mockResolvedValueOnce(undefined);
    const success = await stealthService.applyStealthMode();
    expect(success).toBe(true);
  });

  it("captures screen slide snapshot via Tauri invoke", async () => {
    mockInvoke.mockResolvedValueOnce({
      timestamp_ms: 12345678,
      width: 1920,
      height: 1080,
      image_base64: "data:image/png;base64,sample",
      format: "png",
    });

    const snapshot = await visionService.captureScreenSlide();
    expect(snapshot.width).toBe(1920);
    expect(snapshot.format).toBe("png");
  });

  it("retrieves sidecar health status via Tauri invoke", async () => {
    mockInvoke.mockResolvedValueOnce({
      is_alive: true,
      pid: 12345,
      uptime_seconds: 42,
      engine_type: "reality_neural_engine",
      orchestrator: "Reality Intelligent Copilot Engine",
    });

    const status = await sidecarService.getStatus();
    expect(status.is_alive).toBe(true);
    expect(status.engine_type).toBe("reality_neural_engine");
  });
});
