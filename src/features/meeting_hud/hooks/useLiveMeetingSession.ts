import { useState, useEffect, useRef, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import { LiveTranscriptMessage, LiveAiSuggestion, LiveMeetingConfig } from "../types";
import { Meeting } from "../../launcher/types";
import { aiIntelligenceService, visionService, audioService, deepgramService } from "@/services";

export function useLiveMeetingSession(config?: LiveMeetingConfig) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isMicActive, setIsMicActive] = useState(true);
  const [isStealth, setIsStealth] = useState(config?.isStealth ?? false);
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [messages, setMessages] = useState<LiveTranscriptMessage[]>([]);
  const [currentSuggestion, setCurrentSuggestion] = useState<LiveAiSuggestion | null>(null);

  const sessionIdRef = useRef(config?.title || `session-${Date.now()}`);
  const elapsedSecondsRef = useRef(0);

  useEffect(() => {
    elapsedSecondsRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  const handleUtteranceUpdate = useCallback(
    (speaker: string, text: string, channel: "mic" | "speaker" = "speaker", isFinal: boolean = true) => {
      const timestamp = elapsedSecondsRef.current;
      setMessages((prev) => {
        if (prev.length > 0) {
          const last = prev[prev.length - 1];
          if (last && last.speaker === speaker && last.isPartial) {
            const updated: LiveTranscriptMessage = { ...last, text, timestamp, isPartial: !isFinal };
            return [...prev.slice(0, -1), updated];
          }
        }
        const newMsg: LiveTranscriptMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          speaker,
          text,
          timestamp,
          isPartial: !isFinal,
        };
        return [...prev, newMsg];
      });

      if (isFinal) {
        aiIntelligenceService
          .processUtterance({
            sessionId: sessionIdRef.current,
            speaker,
            text,
            channel,
          })
          .then((res) => {
            if (res.current_suggestion) {
              setCurrentSuggestion({
                id: res.current_suggestion.id,
                title: res.current_suggestion.title,
                summary: res.current_suggestion.summary,
                confidence: Math.round(
                  res.current_suggestion.confidence > 1
                    ? res.current_suggestion.confidence
                    : res.current_suggestion.confidence * 100
                ),
                codeSnippet: res.current_suggestion.code_snippet
                  ? {
                      lang: res.current_suggestion.code_snippet.lang,
                      technique: res.current_suggestion.code_snippet.technique ?? undefined,
                      complexity: res.current_suggestion.code_snippet.complexity ?? undefined,
                      code: res.current_suggestion.code_snippet.code,
                    }
                  : undefined,
              });
            }
          })
          .catch(() => {});
      }
    },
    []
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isMicActive) {
      void audioService.startSession({ capture_system_audio: true, vad_enabled: true });
      if (deepgramService.isConfigured()) {
        void deepgramService.configure();
      }
    } else {
      void deepgramService.stop();
      void audioService.stopSession();
    }
  }, [isMicActive]);

  useEffect(() => {
    let unlistenTranscript: (() => void) | undefined;
    let unlistenSuggestion: (() => void) | undefined;

    listen<{ text: string; speaker?: string; is_final?: boolean }>("transcript.delta", (event) => {
      if (event.payload?.text) {
        handleUtteranceUpdate(
          event.payload.speaker || "Meeting (Live)",
          event.payload.text,
          "speaker",
          event.payload.is_final ?? true
        );
      }
    })
      .then((unsub) => {
        unlistenTranscript = unsub;
      })
      .catch(() => {});

    listen<LiveAiSuggestion>("assist.suggestion", (event) => {
      if (event.payload) {
        setCurrentSuggestion({
          ...event.payload,
          id: event.payload.id || `sug-${Date.now()}`,
        });
      }
    })
      .then((unsub) => {
        unlistenSuggestion = unsub;
      })
      .catch(() => {});

    return () => {
      unlistenTranscript?.();
      unlistenSuggestion?.();
    };
  }, [handleUtteranceUpdate]);

  const triggerScreenOcr = useCallback(async () => {
    setIsOcrScanning(true);
    try {
      const snapshot = await visionService.captureScreenSlide();
      const ocrSummary = `[Slide OCR (${snapshot.width}x${snapshot.height})] Screen content captured for analysis.`;
      handleUtteranceUpdate("Screen OCR", ocrSummary, "speaker");
    } catch {
      handleUtteranceUpdate("Screen OCR", "[Screen Capture Active Window OCR]", "speaker");
    } finally {
      setIsOcrScanning(false);
    }
  }, [handleUtteranceUpdate]);

  const sendCustomPrompt = useCallback(
    (promptText: string, imageUri?: string) => {
      const userMsg: LiveTranscriptMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        speaker: "You",
        text: promptText,
        timestamp: elapsedSeconds,
        imageUri,
      };
      setMessages((prev) => [...prev, userMsg]);

      aiIntelligenceService
        .processUtterance({
          sessionId: sessionIdRef.current,
          speaker: "You",
          text: promptText,
          channel: "mic",
        })
        .then((res) => {
          if (res.current_suggestion) {
            setCurrentSuggestion({
              id: res.current_suggestion.id,
              title: res.current_suggestion.title,
              summary: res.current_suggestion.summary,
              confidence: Math.round(
                res.current_suggestion.confidence > 1
                  ? res.current_suggestion.confidence
                  : res.current_suggestion.confidence * 100
              ),
              codeSnippet: res.current_suggestion.code_snippet
                ? {
                    lang: res.current_suggestion.code_snippet.lang,
                    technique: res.current_suggestion.code_snippet.technique ?? undefined,
                    complexity: res.current_suggestion.code_snippet.complexity ?? undefined,
                    code: res.current_suggestion.code_snippet.code,
                  }
                : undefined,
            });
          }
        })
        .catch(() => {});
    },
    [elapsedSeconds]
  );

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${(mins % 60).toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const finalizeMeeting = useCallback((): Meeting => {
    const durationFormatted = `${Math.max(1, Math.round(elapsedSeconds / 60))}m`;
    const meetingTitle = config?.title || "Architecture & AI Strategy Review";

    void aiIntelligenceService.finalizeMeeting(sessionIdRef.current);

    return {
      id: `meeting-${Date.now()}`,
      title: meetingTitle,
      date: new Date().toISOString(),
      duration: durationFormatted,
      persona: config?.persona || "tech",
      objective: `Live meeting session with ${messages.length} utterances recorded.`,
      summary: messages.length > 0 
        ? messages.map((m) => `${m.speaker}: ${m.text}`).join("\n")
        : "Live session concluded with real-time neural assistance.",
      consensus: "Meeting concluded with key architecture consensus and action items.",
      attendees: [
        { name: "You", role: "Meeting Participant", talkRatio: 50 },
        { name: "Team Speaker", role: "Presenter", talkRatio: 50 },
      ],
      actionItems: [],
      keyPoints: [],
      openQuestions: [],
      risks: [],
      transcript: messages.map((m) => ({
        speaker: m.speaker,
        text: m.text,
        timestamp: m.timestamp,
      })),
    };
  }, [elapsedSeconds, config?.title, config?.persona, messages]);

  const toggleMic = () => setIsMicActive((prev) => !prev);
  const toggleStealth = () => setIsStealth((prev) => !prev);

  return {
    elapsedSeconds,
    formattedTimer: formatTimer(elapsedSeconds),
    isMicActive,
    isStealth,
    isOcrScanning,
    messages,
    currentSuggestion,
    toggleMic,
    toggleStealth,
    triggerScreenOcr,
    sendCustomPrompt,
    finalizeMeeting,
  };
}
