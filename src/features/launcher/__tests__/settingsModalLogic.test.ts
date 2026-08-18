import { describe, it, expect } from "vitest";

type SettingsTab = "general" | "audio" | "models" | "shortcuts" | "about";

function validateApiKeyInput(key: string): { isValid: boolean; provider?: "openai" | "anthropic" | "custom" } {
  const trimmed = key.trim();
  if (!trimmed) return { isValid: false };
  if (trimmed.startsWith("sk-ant-")) return { isValid: true, provider: "anthropic" };
  if (trimmed.startsWith("sk-")) return { isValid: true, provider: "openai" };
  if (trimmed.length >= 16) return { isValid: true, provider: "custom" };
  return { isValid: false };
}

function resolveStagingModelConfig(engineId: string): { isLocal: boolean; latencyP99Ms: number } {
  switch (engineId) {
    case "coreml_local":
      return { isLocal: true, latencyP99Ms: 240 };
    case "whisper_sub350":
    default:
      return { isLocal: false, latencyP99Ms: 320 };
  }
}

describe("Launcher - Settings Modal Logic Unit Tests", () => {
  describe("API Key Format Validation", () => {
    const keyCases = [
      { key: "sk-ant-api03-abcdef1234567890", expectedValid: true, expectedProvider: "anthropic" },
      { key: "sk-proj-openai-1234567890abcdef", expectedValid: true, expectedProvider: "openai" },
      { key: "custom-ollama-bridge-token-xyz", expectedValid: true, expectedProvider: "custom" },
      { key: "too-short", expectedValid: false, expectedProvider: undefined },
      { key: "", expectedValid: false, expectedProvider: undefined },
    ];

    it.each(keyCases)("validates key '$key'", ({ key, expectedValid, expectedProvider }) => {
      const result = validateApiKeyInput(key);
      expect(result.isValid).toBe(expectedValid);
      expect(result.provider).toBe(expectedProvider);
    });
  });

  describe("Speech Engine Configuration Resolution", () => {
    it("resolves cloud sub-350ms pipeline", () => {
      const config = resolveStagingModelConfig("whisper_sub350");
      expect(config.isLocal).toBe(false);
      expect(config.latencyP99Ms).toBe(320);
    });

    it("resolves on-device CoreML Apple Silicon pipeline", () => {
      const config = resolveStagingModelConfig("coreml_local");
      expect(config.isLocal).toBe(true);
      expect(config.latencyP99Ms).toBe(240);
    });
  });
});
