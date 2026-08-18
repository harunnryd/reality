import { describe, it, expect, vi, beforeEach } from "vitest";
import { SpeechRecognitionService } from "../speechRecognitionService";

describe("SpeechRecognitionService", () => {
  let mockRecognition: any;

  beforeEach(() => {
    mockRecognition = {
      continuous: false,
      interimResults: false,
      lang: "en-US",
      start: vi.fn(),
      stop: vi.fn(),
      onresult: null,
      onerror: null,
      onend: null,
    };

    function MockSpeechRecognition(this: any) {
      Object.assign(this, mockRecognition);
      return this;
    }

    (globalThis as any).window = {
      webkitSpeechRecognition: MockSpeechRecognition,
    };
  });

  it("detects support correctly", () => {
    const service = new SpeechRecognitionService();
    expect(service.isSupported()).toBe(true);
  });

  it("starts listening and triggers final transcript callback", () => {
    const service = new SpeechRecognitionService();
    const transcriptSpy = vi.fn();

    const started = service.start(transcriptSpy, "en-US");
    expect(started).toBe(true);
    expect(service.getIsListening()).toBe(true);

    const recognitionInstance = (service as any).recognition;
    if (recognitionInstance?.onresult) {
      recognitionInstance.onresult({
        resultIndex: 0,
        results: [
          Object.assign(
            [
              {
                transcript: "We need to optimize the database query latency",
              },
            ],
            { isFinal: true }
          ),
        ],
      });
    }

    expect(transcriptSpy).toHaveBeenCalledWith("We need to optimize the database query latency", true);
  });

  it("stops listening cleanly", () => {
    const service = new SpeechRecognitionService();
    service.start(vi.fn());
    service.stop();
    expect(service.getIsListening()).toBe(false);
  });
});
