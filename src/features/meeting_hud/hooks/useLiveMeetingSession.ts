import { useState, useEffect, useRef, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import { LiveTranscriptMessage, LiveAiSuggestion, LiveMeetingConfig } from "../types";
import { Meeting } from "../../launcher/types";
import { sidecarService } from "@/services";

const INITIAL_CONVERSATION_HISTORY: Record<string, LiveTranscriptMessage[]> = {
  tech: [
    {
      id: "msg-hist-1",
      speaker: "Sarah Lin",
      text: "Good afternoon team. Let's review the sub-350ms streaming pipeline and the 10 million vector index recall metrics.",
      timestamp: 4,
    },
    {
      id: "msg-hist-2",
      speaker: "Dimas Prasetyo",
      text: "We ran benchmarks on Qdrant with HNSW m=16, ef_construction=64 using FP16 quantization. Query p99 latency dropped to 38ms with 99.4% recall.",
      timestamp: 18,
    },
    {
      id: "msg-hist-3",
      speaker: "Erik Larson",
      text: "On the audio streaming side, 16kHz mono audio is chunked into 150ms ArrayBuffers. The WebSocket latency jitter is practically zero.",
      timestamp: 35,
    },
    {
      id: "msg-hist-4",
      speaker: "Reality AI",
      text: "Insight: 150ms chunk interval confirmed optimal. CoreML Whisper fallback pre-warmed on Apple Silicon Neural Engine.",
      timestamp: 52,
    },
    {
      id: "msg-hist-5",
      speaker: "Alex Chen",
      text: "Security audit passed. All raw PCM ring buffers are zeroized in RAM immediately upon inference completion to ensure SOC2 compliance.",
      timestamp: 70,
    },
    {
      id: "msg-hist-6",
      speaker: "Sarah Lin",
      text: "What happens if a user experiences a temporary Wi-Fi disconnect during an active board presentation?",
      timestamp: 95,
    },
    {
      id: "msg-hist-7",
      speaker: "Erik Larson",
      text: "The application instantly falls back to on-device CoreML Whisper with zero audio frames dropped and resumes cloud sync when reconnected.",
      timestamp: 115,
    },
  ],
  sales: [
    {
      id: "msg-sales-1",
      speaker: "David Vance",
      text: "Thanks for setting up this session. We are evaluating Reality for 250 enterprise seats across our London and Frankfurt offices.",
      timestamp: 5,
    },
    {
      id: "msg-sales-2",
      speaker: "Rahmat Hidayat",
      text: "Excited to have you. Reality Enterprise provides single-tenant VPC deployment in Frankfurt with client-managed KMS encryption keys.",
      timestamp: 22,
    },
    {
      id: "msg-sales-3",
      speaker: "Elena Rostova",
      text: "Can our compliance team inspect audit logs and enforce automatic DLP redacting for sensitive credit card numbers?",
      timestamp: 45,
    },
    {
      id: "msg-sales-4",
      speaker: "Reality AI",
      text: "Insight: Real-time DLP regex scrubbing active on client stream. Zero PCI-DSS numbers transmitted across wire.",
      timestamp: 68,
    },
  ],
  executive: [
    {
      id: "msg-exec-1",
      speaker: "Maya Anderson",
      text: "Let's review our Q4 growth trajectory and user retention cohorts across the free tier and Reality Pro.",
      timestamp: 6,
    },
    {
      id: "msg-exec-2",
      speaker: "Kevin Wijaya",
      text: "Day-30 retention reached 68% for paid users who use the live meeting copilot at least twice a week.",
      timestamp: 28,
    },
    {
      id: "msg-exec-3",
      speaker: "Amanda Cole",
      text: "On-device CoreML processing keeps our gross margin above 82% because 70% of audio never touches cloud GPUs.",
      timestamp: 50,
    },
  ],
};

const CONTINUOUS_STREAM_QUEUE: Record<
  string,
  Array<{
    speaker: string;
    text: string;
    suggestion?: {
      title: string;
      summary: string;
      confidence: number;
      codeSnippet?: {
        lang: string;
        code: string;
        technique?: string;
        complexity?: string;
      };
    };
  }>
> = {
  tech: [
    {
      speaker: "Sarah Lin",
      text: "How should we handle vector re-indexing backpressure during heavy batch updates?",
      suggestion: {
        title: "Vector Re-Indexing Backpressure",
        summary: "Implement a rate-limited sliding window buffer with asynchronous background worker queues to prevent CPU spikes.",
        confidence: 98,
        codeSnippet: {
          lang: "typescript",
          technique: "Sliding-Window Worker Queue",
          complexity: "O(1) memory · Rate-limited",
          code: `const workerQueue = new SlidingWorkerQueue({\n  concurrency: 4,\n  batchSize: 500,\n  onBatch: async (items) => vectorIndex.upsert(items)\n});`,
        },
      },
    },
    {
      speaker: "Dimas Prasetyo",
      text: "I've drafted the sliding window queue in TypeScript. It throttles ingestion automatically if CPU load exceeds 75%.",
    },
    {
      speaker: "Alex Chen",
      text: "Can we ensure encryption-at-rest keys rotate every 30 days via AWS KMS without requiring service restarts?",
      suggestion: {
        title: "Zero-Downtime Key Rotation",
        summary: "AWS KMS envelope encryption allows key rotation with automatic cipher re-wrapping without stopping the server.",
        confidence: 99,
        codeSnippet: {
          lang: "rust",
          technique: "AWS KMS Envelope Rotation",
          complexity: "Zero-Downtime · AES-256-GCM",
          code: `pub async fn rotate_envelope_key(client: &KmsClient, key_id: &str) -> Result<(), KmsError> {\n    client.enable_key_rotation().key_id(key_id).send().await?;\n    Ok(())\n}`,
        },
      },
    },
    {
      speaker: "Dimas Prasetyo",
      text: "Envelope encryption handles key alias swaps on the fly. No client disconnection will occur during rotation.",
    },
    {
      speaker: "Sarah Lin",
      text: "What is our deployment timeline for the private beta release to early enterprise design partners?",
      suggestion: {
        title: "Private Beta Rollout Plan",
        summary: "Target Friday 09:00 AM UTC for internal staging verification, followed by phased rollout to 5 pilot enterprises.",
        confidence: 97,
      },
    },
    {
      speaker: "Erik Larson",
      text: "CI build passed all 120 integration tests. Artifacts are notarized and ready for distribution.",
    },
    {
      speaker: "Reality AI",
      text: "Consensus: Private beta build verified. 150ms chunk buffer & CoreML fallback validated.",
    },
    {
      speaker: "Sarah Lin",
      text: "Awesome work everyone. Let's wrap up and publish the release candidate notes.",
    },
  ],
  sales: [
    {
      speaker: "David Vance",
      text: "If we start with 250 seats, can we expand to 1,000 seats mid-contract with the same volume discount tier?",
      suggestion: {
        title: "Volume Expansion Discount",
        summary: "Offer price-lock guarantee: Any additional seats added during the contract term qualify for the $48/seat rate.",
        confidence: 98,
      },
    },
    {
      speaker: "Rahmat Hidayat",
      text: "Yes, we provide an enterprise price-lock guarantee so any seats added during the contract retain the $48/seat rate.",
    },
    {
      speaker: "Elena Rostova",
      text: "Perfect. Please send over the order form along with the SOC2 report and we will get it signed this week.",
    },
  ],
  executive: [
    {
      speaker: "Maya Anderson",
      text: "Let's ensure our ProductHunt launch includes a 60-second interactive demo video showing the <350ms latency in action.",
      suggestion: {
        title: "ProductHunt Launch Strategy",
        summary: "Highlight speed benchmark comparisons against cloud-only assistants and emphasize Apple Silicon on-device privacy.",
        confidence: 99,
      },
    },
    {
      speaker: "Kevin Wijaya",
      text: "The demo video is ready. It shows real-time speech transcription side-by-side with live AI objection handling.",
    },
  ],
};

export function useLiveMeetingSession(config?: LiveMeetingConfig) {
  const [elapsedSeconds, setElapsedSeconds] = useState(128);
  const [isMicActive, setIsMicActive] = useState(true);
  const [isStealth, setIsStealth] = useState(config?.isStealth ?? true);
  const [isOcrScanning, setIsOcrScanning] = useState(false);

  const topicKey = config?.persona === "sales" ? "sales" : config?.persona === "executive" ? "executive" : "tech";
  const initialHistory = INITIAL_CONVERSATION_HISTORY[topicKey] || INITIAL_CONVERSATION_HISTORY.tech;
  const streamQueue = CONTINUOUS_STREAM_QUEUE[topicKey] || CONTINUOUS_STREAM_QUEUE.tech;

  const [messages, setMessages] = useState<LiveTranscriptMessage[]>(initialHistory);

  const [currentSuggestion, setCurrentSuggestion] = useState<LiveAiSuggestion | null>({
    id: "sug-init-active",
    title: "Latency & Memory Optimization Strategy",
    summary: "HNSW index with FP16 scalar quantization keeps p99 query latency under 38ms across 10M embeddings with zero RAM leakage.",
    confidence: 98,
    codeSnippet: {
      lang: "typescript",
      technique: "HNSW Quantized Vector Pipeline",
      complexity: "O(log N) query · 38ms p99",
      code: `const vectorIndex = new HNSWIndex({\n  metric: 'cosine',\n  quantization: 'fp16',\n  efConstruction: 64,\n  m: 16,\n  maxElements: 10_000_000\n});`,
    },
  });

  const streamQueueIndexRef = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const streamInterval = setInterval(() => {
      if (streamQueueIndexRef.current < streamQueue.length) {
        const item = streamQueue[streamQueueIndexRef.current];
        streamQueueIndexRef.current += 1;

        setMessages((prev) => [
          ...prev,
          {
            id: `msg-stream-${Date.now()}-${streamQueueIndexRef.current}`,
            speaker: item.speaker,
            text: item.text,
            timestamp: elapsedSeconds || 135 + streamQueueIndexRef.current * 4,
          },
        ]);

        if (item.suggestion) {
          setCurrentSuggestion({
            id: `sug-${Date.now()}-${streamQueueIndexRef.current}`,
            title: item.suggestion.title,
            summary: item.suggestion.summary,
            confidence: item.suggestion.confidence,
            codeSnippet: item.suggestion.codeSnippet,
          });
        }
      }
    }, 3500);

    return () => clearInterval(streamInterval);
  }, [streamQueue, elapsedSeconds]);

  useEffect(() => {
    let unlistenTranscript: (() => void) | undefined;
    let unlistenSuggestion: (() => void) | undefined;

    listen<{ text: string; speaker?: string }>("transcript.delta", (event) => {
      if (event.payload?.text) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-live-${Date.now()}`,
            speaker: event.payload.speaker || "Speaker",
            text: event.payload.text,
            timestamp: elapsedSeconds,
          },
        ]);
      }
    }).then((unsub) => {
      unlistenTranscript = unsub;
    }).catch(() => {});

    listen<LiveAiSuggestion>("assist.suggestion", (event) => {
      if (event.payload) {
        setCurrentSuggestion({
          ...event.payload,
          id: event.payload.id || `sug-${Date.now()}`,
        });
      }
    }).then((unsub) => {
      unlistenSuggestion = unsub;
    }).catch(() => {});

    return () => {
      unlistenTranscript?.();
      unlistenSuggestion?.();
    };
  }, [elapsedSeconds]);

  const triggerScreenOcr = useCallback(() => {
    setIsOcrScanning(true);
    setTimeout(() => {
      setIsOcrScanning(false);
      setCurrentSuggestion({
        id: `ocr-${Date.now()}`,
        title: "Slide OCR Visual Analysis",
        summary: "Architecture diagram indexed: Multi-tenant vector index -> Ingestion Queue -> Apple Silicon Neural Engine.",
        confidence: 99,
        codeSnippet: {
          lang: "python",
          technique: "Zero-Downtime Pipeline",
          complexity: "Latency <35ms",
          code: `def process_hybrid_query(query_vector, text_filter):\n    return vector_db.search(\n        vector=query_vector,\n        filter=text_filter,\n        limit=10\n    )`,
        },
      });
    }, 900);
  }, []);

  const sendCustomPrompt = useCallback((promptText: string) => {
    const userMsg: LiveTranscriptMessage = {
      id: `usr-${Date.now()}`,
      speaker: "You",
      text: promptText,
      timestamp: elapsedSeconds,
    };
    setMessages((prev) => [...prev, userMsg]);
    void sidecarService.ping(promptText);

    setTimeout(() => {
      let smartTitle = `AI Assist: "${promptText.slice(0, 24)}..."`;
      let smartSummary = "Synthesized response based on active session context and technical architecture review.";
      let smartSnippet = undefined;

      if (/answer|what/i.test(promptText)) {
        smartTitle = "Recommended Answer for Team";
        smartSummary = "Confirm that HNSW with FP16 quantization keeps memory under 18.2GB while maintaining sub-50ms p99 query latency.";
        smartSnippet = {
          lang: "typescript",
          technique: "Quantized Index Configuration",
          complexity: "O(log N) · Memory 18.2GB",
          code: `const config = {\n  quantization: 'fp16',\n  maxMemoryGB: 18.2,\n  targetP99Ms: 38\n};`,
        };
      } else if (/clarify/i.test(promptText)) {
        smartTitle = "Clarification Point";
        smartSummary = "Explain that 150ms audio chunking avoids TCP packet fragmentation, while CoreML handles offline transcription fallback.";
      } else if (/recap/i.test(promptText)) {
        smartTitle = "Meeting Recap So Far";
        smartSummary = "1. HNSW FP16 vector index approved.\n2. 150ms audio chunk buffer locked.\n3. SOC2 zero-retention memory policy validated.\n4. Private beta build scheduled for Friday.";
      } else if (/follow/i.test(promptText)) {
        smartTitle = "Suggested Follow-Up Question";
        smartSummary = "Ask: 'What automated alerting threshold should we configure on Prometheus for WebSocket latency degradation?'";
      }

      setCurrentSuggestion({
        id: `ans-${Date.now()}`,
        title: smartTitle,
        summary: smartSummary,
        confidence: 98,
        codeSnippet: smartSnippet,
      });
    }, 400);
  }, [elapsedSeconds]);

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
    const meetingTitle = config?.title || "Distributed Vector Search & Hybrid RAG Review";

    return {
      id: `meeting-${Date.now()}`,
      title: meetingTitle,
      date: new Date().toISOString(),
      duration: durationFormatted,
      persona: config?.persona || "tech",
      objective: "Evaluate HNSW vector index latency vs IVFFlat for 10M embeddings with sub-50ms p99 query constraint.",
      summary: "Benchmarked Qdrant vs pgvector for multi-tenant hybrid search. Agreed on HNSW m=16, ef_construction=64 with quantized FP16 embeddings. Validated SOC2-compliant encryption at rest with customer-managed keys (BYOK).",
      consensus: "Deploy dedicated Qdrant cluster on AWS eu-central-1 with dual-write fallback. Ship private beta build by Friday.",
      attendees: [
        { name: "Sarah Lin", role: "VP Engineering", talkRatio: 35 },
        { name: "Erik Larson", role: "Staff Audio Engineer", talkRatio: 30 },
        { name: "Alex Chen", role: "Security Architect", talkRatio: 20 },
        { name: "Dimas Prasetyo", role: "Lead Backend", talkRatio: 15 },
      ],
      actionItems: [
        {
          id: `act-${Date.now()}-1`,
          text: "Benchmark vector index recall on 10M test dataset with payload filtering",
          completed: false,
          assignee: "Dimas Prasetyo",
          priority: "high",
          dueDate: "Tomorrow, 5 PM",
          evidenceTimestamp: 18,
        },
        {
          id: `act-${Date.now()}-2`,
          text: "Draft Terraform infra definition for isolated VPC peering",
          completed: false,
          assignee: "Alex Chen",
          priority: "medium",
          dueDate: "Thursday",
          evidenceTimestamp: 70,
        },
        {
          id: `act-${Date.now()}-3`,
          text: "Implement sliding window backpressure queue for batch re-indexing",
          completed: false,
          assignee: "Dimas Prasetyo",
          priority: "high",
          dueDate: "Friday",
        },
      ],
      keyPoints: [
        {
          id: `dec-${Date.now()}-1`,
          decision: "Adopt HNSW index with FP16 scalar quantization for vector search",
          rationale: "Reduces memory footprint by 52% with less than 0.8% recall degradation across 10M vectors.",
          evidenceTimestamp: 18,
        },
        {
          id: `dec-${Date.now()}-2`,
          decision: "Enforce zero-retention memory policy for WebAudio streaming buffers",
          rationale: "Prevents unencrypted customer audio from persisting across session boundaries in RAM.",
          evidenceTimestamp: 70,
        },
      ],
      openQuestions: [
        {
          id: `q-${Date.now()}-1`,
          question: "What is the failover recovery SLA if primary vector node crashes under load?",
          status: "open",
          owner: "Alex Chen",
        },
      ],
      risks: [
        {
          id: `r-${Date.now()}-1`,
          risk: "Memory consumption spikes during large batch embedding re-indexing.",
          severity: "high",
          mitigation: "Implement rate-limited sliding window worker queue with backpressure control.",
        },
      ],
      transcript: messages.map((m) => ({
        speaker: m.speaker,
        text: m.text,
        timestamp: m.timestamp,
      })),
    };
  }, [config, elapsedSeconds, messages]);

  return {
    elapsedSeconds,
    formattedTimer: formatTimer(elapsedSeconds),
    isMicActive,
    toggleMic: () => setIsMicActive(!isMicActive),
    isStealth,
    toggleStealth: () => setIsStealth(!isStealth),
    isOcrScanning,
    triggerScreenOcr,
    messages,
    currentSuggestion,
    sendCustomPrompt,
    finalizeMeeting,
  };
}
