import { describe, it, expect } from "vitest";

function validateApiKeyInput(key: string): { isValid: boolean; provider?: "openai" | "anthropic" | "custom" } {
  const trimmed = key.trim();
  if (!trimmed) return { isValid: false };
  if (trimmed.startsWith("sk-ant-")) return { isValid: true, provider: "anthropic" };
  if (trimmed.startsWith("sk-")) return { isValid: true, provider: "openai" };
  if (trimmed.length >= 16) return { isValid: true, provider: "custom" };
  return { isValid: false };
}

function resolveSpeechEngineConfig(): { provider: string; model: string; isStreaming: boolean } {
  return {
    provider: "deepgram",
    model: "nova-2",
    isStreaming: true,
  };
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

  describe("Speech Engine Configuration", () => {
    it("resolves active deepgram streaming pipeline", () => {
      const config = resolveSpeechEngineConfig();
      expect(config.provider).toBe("deepgram");
      expect(config.model).toBe("nova-2");
      expect(config.isStreaming).toBe(true);
    });
  });
});
