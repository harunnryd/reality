import * as React from "react";
import {
  CheckCircle2,
  Circle,
  MessageSquare,
  Sparkles,
  Trash2,
  Copy,
  Check,
  Download,
  ListTodo,
  FileText,
  Search,
  MoreHorizontal,
  Users,
  Plus,
  Mail,
  Share2,
  AlertTriangle,
  ChevronDown,
  HelpCircle,
  ShieldAlert,
  ExternalLink,
  Edit2,
  Code2,
  History,
  Send,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Meeting, ActionItemDetail, PersonaConfig } from "../types";
import { PERSONA_CONFIGS } from "../services/meetingsService";
import { springEase } from "@/styles/theme";

export interface MeetingDetailsViewProps {
  meeting: Meeting;
  onBack: () => void;
  onDelete: (id: string) => void;
}

type DetailTab = "summary" | "actions" | "keypoints" | "transcript" | "usage";
type FollowUpTone = "professional" | "concise" | "action-oriented" | "warm" | "friendly";

export interface MeetingUsageItem {
  id: string;
  timestamp: number;
  question: string;
  answer: string;
  codeSnippet?: {
    lang: string;
    code: string;
    technique?: string;
    complexity?: string;
  };
}

export const MeetingDetailsView: React.FC<MeetingDetailsViewProps> = ({
  meeting,
  onBack,
  onDelete,
}) => {
  const persona = PERSONA_CONFIGS[meeting.persona] || (PERSONA_CONFIGS["general"] as PersonaConfig);
  const [activeTab, setActiveTab] = React.useState<DetailTab>("summary");
  const [copiedSummary, setCopiedSummary] = React.useState(false);
  const [copiedTranscript, setCopiedTranscript] = React.useState(false);
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);

  const [showAllAttendees, setShowAllAttendees] = React.useState(false);

  const [speakerLabels, setSpeakerLabels] = React.useState<Record<string, string>>({});
  const [editingSpeaker, setEditingSpeaker] = React.useState<string | null>(null);
  const [newSpeakerDraft, setNewSpeakerDraft] = React.useState("");

  const [actionItems, setActionItems] = React.useState<ActionItemDetail[]>(() => {
    return meeting.actionItems.map((item, idx) => {
      if (typeof item === "string") {
        return {
          id: `item-${idx}`,
          text: item,
          completed: false,
        };
      }
      return item;
    });
  });
  const [newTaskText, setNewTaskText] = React.useState("");
  const [isAddingTask, setIsAddingTask] = React.useState(false);

  const [transcriptSearch, setTranscriptSearch] = React.useState("");
  const [selectedSpeakerFilter, setSelectedSpeakerFilter] = React.useState<string>("all");
  const [highlightedTimestamp, setHighlightedTimestamp] = React.useState<number | null>(null);

  const [isChatOverlayOpen, setIsChatOverlayOpen] = React.useState(false);
  const [followUpTone, setFollowUpTone] = React.useState<FollowUpTone>("professional");
  const [isToneDropdownOpen, setIsToneDropdownOpen] = React.useState(false);
  const [bottomChatQuery, setBottomChatQuery] = React.useState("");
  const [chatMessages, setChatMessages] = React.useState<Array<{ id: string; sender: "user" | "ai"; text: string; time: string }>>([
    {
      id: "msg-init",
      sender: "ai",
      text: `Hello! I have indexed the full transcript and notes of "${meeting.title}". You can ask me to draft emails, summarize specific segments, or query unresolved questions.`,
      time: "Just now",
    },
  ]);
  const [isChatResponding, setIsChatResponding] = React.useState(false);

  const [usageHistory] = React.useState<MeetingUsageItem[]>([
    {
      id: "u-1",
      timestamp: 45,
      question: "How to configure on-device audio streaming with sub-350ms latency?",
      answer: "Configure the 16kHz audio stream buffer at 150ms intervals using chunked ArrayBuffer transmission to avoid TLS packet fragmentation.",
      codeSnippet: {
        lang: "typescript",
        code: `const streamBuffer = new AudioStreamBuffer({\n  sampleRate: 16000,\n  chunkIntervalMs: 150,\n  onChunk: (pcm16) => socket.send(pcm16)\n});`,
        technique: "Chunked Ring-Buffer Pipeline",
        complexity: "O(1) time · O(1) space",
      },
    },
    {
      id: "u-2",
      timestamp: 120,
      question: "What is the failover mechanism if local Wi-Fi disconnects?",
      answer: "The pipeline triggers an instantaneous fallback to on-device CoreML Whisper on Apple Silicon without losing any buffered audio frames.",
    },
  ]);

  const transcriptLines = React.useMemo(() => {
    if (meeting.transcript && meeting.transcript.length > 0) {
      return meeting.transcript;
    }
    return [
      { speaker: "Sarah Lin", text: "Let's review the sub-350ms streaming pipeline and WebSocket buffer latency across all clients.", timestamp: 12 },
      { speaker: "Erik Larson", text: "We tested the 16kHz audio chunk buffer at 150ms intervals. Transcription arrives before the speaker finishes their thought.", timestamp: 45 },
      { speaker: "Alex Chen", text: "Security audit passed. All raw PCM buffers are wiped from RAM immediately after local inference.", timestamp: 88 },
      { speaker: "Sarah Lin", text: "What happens if the user loses internet connection during the middle of a board meeting?", timestamp: 120 },
      { speaker: "Erik Larson", text: "The app seamlessly falls back to on-device CoreML Whisper with zero audio dropped.", timestamp: 154 },
      { speaker: "Reality AI", text: "Executive Note: Consensus reached on 150ms chunk interval. CoreML fallback build queued.", timestamp: 180 },
    ];
  }, [meeting.transcript]);

  const allSpeakers = React.useMemo(() => {
    const speakers = new Set<string>();
    for (const t of transcriptLines) {
      const resolved = speakerLabels[t.speaker] || t.speaker;
      speakers.add(resolved);
    }
    return Array.from(speakers);
  }, [transcriptLines, speakerLabels]);

  const toggleTask = (id: string) => {
    setActionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setActionItems((prev) => [
      ...prev,
      {
        id: `custom-task-${Date.now()}`,
        text: newTaskText.trim(),
        completed: false,
        assignee: "You",
      },
    ]);
    setNewTaskText("");
    setIsAddingTask(false);
  };

  const handleJumpToEvidence = (timestamp?: number) => {
    if (timestamp === undefined) return;
    setActiveTab("transcript");
    setHighlightedTimestamp(timestamp);
    setTimeout(() => {
      const el = document.getElementById(`transcript-ts-${timestamp}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);
  };

  const handleRunAiQuickPrompt = (actionType: "email" | "slack" | "risks", customTone?: FollowUpTone) => {
    const activeTone = customTone || followUpTone;
    setIsChatOverlayOpen(true);

    let promptQuery = "Draft a formal follow-up email.";
    if (actionType === "email") {
      promptQuery = `Draft a ${activeTone} follow-up email to all participants.`;
    } else if (actionType === "slack") {
      promptQuery = "Format a concise summary recap for Slack/Teams.";
    } else if (actionType === "risks") {
      promptQuery = "Analyze and summarize all unresolved risks and mitigation paths.";
    }

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: "user" as const,
      text: promptQuery,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatResponding(true);

    setTimeout(() => {
      setIsChatResponding(false);
      let reply = "";
      if (actionType === "email") {
        if (activeTone === "concise") {
          reply = `Team,\n- Focus: ${meeting.title}\n- Decision: ${typeof meeting.keyPoints[0] === "string" ? meeting.keyPoints[0] : meeting.keyPoints[0]?.decision}\n- Actions: ${actionItems.map((a) => a.text).join("; ")}`;
        } else if (activeTone === "warm" || activeTone === "friendly") {
          reply = `Hey everyone! 😊\n\nThanks so much for the great discussion on "${meeting.title}". Here are our next steps:\n\n- ${actionItems.map((a) => `${a.text} (@${a.assignee || "Team"})`).join("\n- ")}\n\nExcited to see this shipped! Let me know if you need anything.`;
        } else {
          reply = `Hi Team,\n\nHere is a formal summary of our discussion on "${meeting.title}":\n\n- Key Decision: ${
            typeof meeting.keyPoints[0] === "string"
              ? meeting.keyPoints[0]
              : meeting.keyPoints[0]?.decision || "Consensus established"
          }\n- Action Items: ${actionItems.map((a) => a.text).join(", ")}\n\nPlease review and let me know if anything requires adjustment.`;
        }
      } else if (actionType === "slack") {
        reply = `🚀 *Recap: ${meeting.title}*\n> ${meeting.summary}\n\n*Action Items:*\n${actionItems
          .map((a) => `• ${a.completed ? "~" + a.text + "~" : a.text} ${a.assignee ? `(@${a.assignee})` : ""}`)
          .join("\n")}`;
      } else {
        reply = `⚠️ *Identified Risks & Mitigation:*\n1. VAD Silence latency jitter on older hardware -> Mitigated by CoreML local fallbacks.\n2. Key rotation compliance -> Mitigated by strict BYOK zero-retention storage.`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-ai-${Date.now()}`,
          sender: "ai" as const,
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 550);
  };

  const handleSendBottomChat = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!bottomChatQuery.trim()) return;

    const userText = bottomChatQuery.trim();
    setBottomChatQuery("");
    setIsChatOverlayOpen(true);

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: "user" as const,
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setIsChatResponding(true);

    setTimeout(() => {
      setIsChatResponding(false);
      let reply = `Based on the session records: "${meeting.summary}"`;
      if (/email|draft|follow/i.test(userText)) {
        reply = `I have drafted a follow-up outline covering ${actionItems.length} action items. You can export it via Export .md or copy it.`;
      } else if (/risk|issue|block/i.test(userText)) {
        reply = `The primary identified technical risk is VAD latency jitter on older hardware, which is mitigated by CoreML local fallbacks.`;
      } else if (/who|attendee|speaker/i.test(userText)) {
        reply = `The participants were ${meeting.attendees?.map((a) => a.name).join(", ") || "Sarah Lin, Erik Larson, and Alex Chen"}.`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-ai-${Date.now()}`,
          sender: "ai" as const,
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 600);
  };

  const formatMarkdownNotes = () => {
    return `# ${meeting.title}
*Date: ${new Date(meeting.date).toLocaleString()}*
*Persona: ${persona.label} | Duration: ${meeting.duration}*

## Executive Summary
${meeting.summary}

${meeting.objective ? `**Objective:** ${meeting.objective}\n` : ""}
${meeting.consensus ? `**Consensus:** ${meeting.consensus}\n` : ""}

## Action Items
${actionItems.map((a) => `${a.completed ? "[x]" : "[ ]"} ${a.text} ${a.assignee ? `(@${a.assignee})` : ""}`).join("\n")}

## Key Decisions
${meeting.keyPoints
  .map((k) => (typeof k === "string" ? `- ${k}` : `- **${k.decision}**\n  *Rationale: ${k.rationale || "N/A"}*`))
  .join("\n\n")}

${
  meeting.openQuestions && meeting.openQuestions.length > 0
    ? `## Open Questions\n${meeting.openQuestions.map((q) => `- [${q.status.toUpperCase()}] ${q.question} (${q.owner || "Unassigned"})`).join("\n")}\n`
    : ""
}

${
  meeting.risks && meeting.risks.length > 0
    ? `## Risks & Blockers\n${meeting.risks.map((r) => `- [${r.severity.toUpperCase()}] ${r.risk}\n  *Mitigation: ${r.mitigation || "N/A"}*`).join("\n\n")}\n`
    : ""
}

## Live Transcript
${transcriptLines.map((t) => `**${speakerLabels[t.speaker] || t.speaker}**: ${t.text}`).join("\n\n")}
`;
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(formatMarkdownNotes());
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {}
  };

  const handleCopyTranscript = async () => {
    try {
      const text = transcriptLines
        .map((t) => `[${Math.floor(t.timestamp / 60)}:${(t.timestamp % 60).toString().padStart(2, "0")}] ${speakerLabels[t.speaker] || t.speaker}: ${t.text}`)
        .join("\n\n");
      await navigator.clipboard.writeText(text);
      setCopiedTranscript(true);
      setTimeout(() => setCopiedTranscript(false), 2000);
    } catch {}
  };

  const handleExportMarkdown = () => {
    const text = formatMarkdownNotes();
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${meeting.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_notes.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveSpeaker = (original: string) => {
    if (newSpeakerDraft.trim()) {
      setSpeakerLabels((prev) => ({ ...prev, [original]: newSpeakerDraft.trim() }));
    }
    setEditingSpeaker(null);
    setNewSpeakerDraft("");
  };

  const filteredTranscript = React.useMemo(() => {
    let list = transcriptLines;
    if (selectedSpeakerFilter !== "all") {
      list = list.filter((t) => (speakerLabels[t.speaker] || t.speaker) === selectedSpeakerFilter);
    }
    if (transcriptSearch.trim()) {
      const q = transcriptSearch.toLowerCase();
      list = list.filter((t) => {
        const spk = (speakerLabels[t.speaker] || t.speaker).toLowerCase();
        return t.text.toLowerCase().includes(q) || spk.includes(q);
      });
    }
    return list;
  }, [transcriptLines, selectedSpeakerFilter, transcriptSearch, speakerLabels]);

  const completedCount = actionItems.filter((a) => a.completed).length;
  const totalTasks = actionItems.length;

  const visibleAttendees = meeting.attendees
    ? showAllAttendees
      ? meeting.attendees
      : meeting.attendees.slice(0, 4)
    : [];

  return (
    <div
      className="no-drag"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
        userSelect: "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 24px 12px 24px",
          borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
          backgroundColor: "#FFFFFF",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1
              style={{
                margin: "0 0 4px 0",
                fontSize: 18,
                fontWeight: 700,
                color: "#1D1D1F",
                letterSpacing: "-0.02em",
                lineHeight: 1.25,
              }}
            >
              {meeting.title}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "#86868B" }}>
              <span style={{ fontWeight: 600, color: "#1D1D1F" }}>{persona.label}</span>
              <span>&bull;</span>
              <span>{meeting.duration}</span>
              <span>&bull;</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                {new Date(meeting.date).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, position: "relative" }}>
            <button
              onClick={handleCopySummary}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 9px",
                borderRadius: 6,
                border: "1px solid rgba(0, 0, 0, 0.08)",
                backgroundColor: "#FFFFFF",
                fontSize: 11.5,
                fontWeight: 600,
                color: copiedSummary ? "#059669" : "#1D1D1F",
                cursor: "pointer",
                transition: "all 120ms ease",
              }}
            >
              {copiedSummary ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
              <span>{copiedSummary ? "Copied" : "Copy"}</span>
            </button>

            <button
              onClick={handleExportMarkdown}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 9px",
                borderRadius: 6,
                border: "1px solid rgba(0, 0, 0, 0.08)",
                backgroundColor: "#FFFFFF",
                fontSize: 11.5,
                fontWeight: 600,
                color: "#1D1D1F",
                cursor: "pointer",
                transition: "all 120ms ease",
              }}
            >
              <Download size={12} />
              <span>Export .md</span>
            </button>

            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              title="More Options"
              style={{
                padding: "4px 6px",
                borderRadius: 6,
                border: "1px solid rgba(0, 0, 0, 0.08)",
                backgroundColor: "#FFFFFF",
                color: "#6E6E73",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MoreHorizontal size={13} />
            </button>

            <AnimatePresence>
              {showMoreMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    marginTop: 4,
                    zIndex: 300,
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    borderRadius: 8,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    padding: 4,
                    minWidth: 120,
                  }}
                >
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      onDelete?.(meeting.id);
                      onBack();
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "5px 8px",
                      borderRadius: 5,
                      border: "none",
                      background: "transparent",
                      fontSize: 11.5,
                      color: "#FF3B30",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 59, 48, 0.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <Trash2 size={12} />
                    <span>Delete Session</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            backgroundColor: "#EBEBEF",
            padding: 2,
            borderRadius: 7,
            gap: 2,
            marginTop: 12,
          }}
        >
          {[
            { id: "summary", label: "Notes & Summary", icon: <FileText size={11} /> },
            { id: "transcript", label: `Transcript (${transcriptLines.length})`, icon: <MessageSquare size={11} /> },
            { id: "usage", label: `AI Q&A History (${usageHistory.length})`, icon: <History size={11} /> },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DetailTab)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 11px",
                  borderRadius: 5,
                  border: "none",
                  backgroundColor: isSelected ? "#FFFFFF" : "transparent",
                  color: isSelected ? "#1D1D1F" : "#6E6E73",
                  fontSize: 11.5,
                  fontWeight: isSelected ? 650 : 500,
                  cursor: "pointer",
                  boxShadow: isSelected ? "0 1px 2px rgba(0, 0, 0, 0.12)" : "none",
                  transition: "color 120ms ease",
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px 96px 28px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
          <AnimatePresence mode="wait">
            {activeTab === "summary" && (
              <motion.div
                key="tab_summary"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                style={{ display: "flex", flexDirection: "column", gap: 24 }}
              >
                {meeting.attendees && meeting.attendees.length > 0 && (
                  <div style={{ paddingBottom: 14, borderBottom: "1px solid rgba(0, 0, 0, 0.06)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#86868B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        <Users size={12} color="#86868B" />
                        <span>Participants ({meeting.attendees.length})</span>
                      </div>

                      {meeting.attendees.length > 4 && (
                        <button
                          onClick={() => setShowAllAttendees(!showAllAttendees)}
                          style={{
                            border: "none",
                            background: "transparent",
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#0071E3",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          {showAllAttendees ? "Show less" : `+${meeting.attendees.length - 4} more`}
                        </button>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      {visibleAttendees.map((att, idx) => {
                        const displayName = speakerLabels[att.name] || att.name;
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedSpeakerFilter(displayName);
                              setActiveTab("transcript");
                            }}
                            title="Click to filter transcript by this speaker"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "3px 8px",
                              borderRadius: 6,
                              backgroundColor: "#F8F9FA",
                              border: "1px solid rgba(0, 0, 0, 0.06)",
                              fontSize: 11.5,
                              cursor: "pointer",
                              transition: "background-color 100ms ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 113, 227, 0.06)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F8F9FA")}
                          >
                            <span style={{ fontWeight: 600, color: "#1D1D1F" }}>{displayName}</span>
                            {att.role && <span style={{ color: "#86868B", fontSize: 10.5 }}>({att.role})</span>}
                            {att.talkRatio !== undefined && (
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: "1px 5px",
                                  borderRadius: 4,
                                  backgroundColor: "rgba(0, 113, 227, 0.08)",
                                  color: "#0071E3",
                                }}
                              >
                                {att.talkRatio}%
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <Sparkles size={13} color="#0071E3" />
                    <h3 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#86868B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Executive Summary
                    </h3>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10, borderLeft: "2.5px solid #0071E3", paddingLeft: 14 }}>
                    {meeting.objective && (
                      <div style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.5 }}>
                        <strong style={{ color: "#1D1D1F" }}>Objective: </strong>
                        {meeting.objective}
                      </div>
                    )}

                    <div style={{ fontSize: 13.5, color: "#1D1D1F", lineHeight: 1.6 }}>
                      {meeting.summary}
                    </div>

                    {meeting.consensus && (
                      <div style={{ fontSize: 13, color: "#047857", backgroundColor: "rgba(16, 185, 129, 0.06)", padding: "6px 10px", borderRadius: 6, lineHeight: 1.45 }}>
                        <strong>Outcome & Consensus: </strong>
                        {meeting.consensus}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <ListTodo size={13} color="#059669" />
                      <h3 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#86868B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Action Items ({totalTasks})
                      </h3>
                    </div>
                    <span style={{ fontSize: 11.5, color: "#86868B", fontVariantNumeric: "tabular-nums" }}>
                      {completedCount} of {totalTasks} completed ({totalTasks ? Math.round((completedCount / totalTasks) * 100) : 0}%)
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {actionItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleTask(item.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 8px",
                          borderRadius: 6,
                          cursor: "pointer",
                          transition: "background-color 100ms ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8F9FB")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0, flex: 1, marginRight: 12 }}>
                          {item.completed ? (
                            <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0 }} />
                          ) : (
                            <Circle size={16} color="#C7C7CC" style={{ flexShrink: 0 }} />
                          )}
                          <span
                            style={{
                              fontSize: 13.5,
                              color: item.completed ? "#86868B" : "#1D1D1F",
                              textDecoration: item.completed ? "line-through" : "none",
                              lineHeight: 1.45,
                            }}
                          >
                            {item.text}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                          {item.evidenceTimestamp !== undefined && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJumpToEvidence(item.evidenceTimestamp);
                              }}
                              title="Jump to transcript evidence"
                              style={{
                                border: "none",
                                background: "transparent",
                                fontSize: 10.5,
                                color: "#0071E3",
                                cursor: "pointer",
                                padding: "1px 4px",
                                borderRadius: 3,
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <span>
                                {Math.floor(item.evidenceTimestamp / 60)}:{(item.evidenceTimestamp % 60).toString().padStart(2, "0")}
                              </span>
                              <ExternalLink size={9} />
                            </button>
                          )}

                          {item.assignee && (
                            <span style={{ fontSize: 11, color: "#0071E3", backgroundColor: "rgba(0, 113, 227, 0.08)", padding: "1px 6px", borderRadius: 4, fontWeight: 550 }}>
                              @{item.assignee}
                            </span>
                          )}
                          {item.dueDate && (
                            <span style={{ fontSize: 10.5, color: "#86868B", fontWeight: 500 }}>
                              {item.dueDate}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {isAddingTask ? (
                      <form onSubmit={handleAddNewTask} style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                        <input
                          type="text"
                          placeholder="Type action item text and press Enter..."
                          value={newTaskText}
                          onChange={(e) => setNewTaskText(e.target.value)}
                          autoFocus
                          style={{
                            flex: 1,
                            padding: "6px 10px",
                            borderRadius: 6,
                            border: "1px solid rgba(0, 113, 227, 0.4)",
                            boxShadow: "0 0 0 2px rgba(0, 113, 227, 0.12)",
                            outline: "none",
                            fontSize: 12.5,
                            fontFamily: "inherit",
                          }}
                        />
                        <button
                          type="submit"
                          style={{
                            padding: "6px 12px",
                            borderRadius: 6,
                            border: "none",
                            backgroundColor: "#0071E3",
                            color: "#FFFFFF",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingTask(false)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 6,
                            border: "1px solid rgba(0,0,0,0.1)",
                            backgroundColor: "#FFFFFF",
                            fontSize: 12,
                            color: "#86868B",
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <button
                        onClick={() => setIsAddingTask(true)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "4px 8px",
                          borderRadius: 6,
                          border: "none",
                          background: "transparent",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#0071E3",
                          cursor: "pointer",
                          alignSelf: "flex-start",
                          marginTop: 4,
                        }}
                      >
                        <Plus size={12} />
                        <span>Add action item</span>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <CheckCircle2 size={13} color="#8B5CF6" />
                    <h3 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#86868B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Key Decisions & Rationales
                    </h3>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingLeft: 8 }}>
                    {meeting.keyPoints.map((kp, idx) => {
                      const isObj = typeof kp !== "string";
                      const decision = isObj ? kp.decision : kp;
                      const rationale = isObj ? kp.rationale : null;
                      const evidenceTs = isObj ? kp.evidenceTimestamp : undefined;

                      return (
                        <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, fontSize: 13.5, color: "#1D1D1F", lineHeight: 1.45 }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                              <span style={{ color: "#8B5CF6", fontWeight: 700 }}>&bull;</span>
                              <span style={{ fontWeight: 600 }}>{decision}</span>
                            </div>

                            {evidenceTs !== undefined && (
                              <button
                                onClick={() => handleJumpToEvidence(evidenceTs)}
                                title="Jump to transcript"
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  fontSize: 10.5,
                                  color: "#8B5CF6",
                                  cursor: "pointer",
                                  padding: "1px 4px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  flexShrink: 0,
                                }}
                              >
                                <span>{Math.floor(evidenceTs / 60)}:{(evidenceTs % 60).toString().padStart(2, "0")}</span>
                                <ExternalLink size={9} />
                              </button>
                            )}
                          </div>
                          {rationale && (
                            <div style={{ fontSize: 12, color: "#64748B", paddingLeft: 16, lineHeight: 1.4 }}>
                              <em>Rationale: {rationale}</em>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {meeting.openQuestions && meeting.openQuestions.length > 0 && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <HelpCircle size={13} color="#B45309" />
                      <h3 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#86868B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Open Questions ({meeting.openQuestions.length})
                      </h3>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 8 }}>
                      {meeting.openQuestions.map((q) => (
                        <div
                          key={q.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "7px 12px",
                            borderRadius: 7,
                            backgroundColor: "#FEF3C7",
                            border: "1px solid rgba(217, 119, 6, 0.2)",
                            fontSize: 12.5,
                          }}
                        >
                          <span style={{ color: "#78350F", fontWeight: 600 }}>
                            {q.question}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 750,
                              textTransform: "uppercase",
                              padding: "2px 6px",
                              borderRadius: 4,
                              backgroundColor: q.status === "open" ? "#FDE68A" : "#DCFCE7",
                              color: q.status === "open" ? "#92400E" : "#166534",
                              letterSpacing: "0.02em",
                            }}
                          >
                            {q.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {meeting.risks && meeting.risks.length > 0 && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <ShieldAlert size={13} color="#B91C1C" />
                      <h3 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#86868B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Risks & Blockers ({meeting.risks.length})
                      </h3>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 8 }}>
                      {meeting.risks.map((r) => (
                        <div
                          key={r.id}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 3,
                            padding: "8px 12px",
                            borderRadius: 7,
                            backgroundColor: "#FEE2E2",
                            border: "1px solid rgba(220, 38, 38, 0.2)",
                            fontSize: 12.5,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ color: "#7F1D1D", fontWeight: 650 }}>{r.risk}</span>
                            <span
                              style={{
                                fontSize: 9.5,
                                fontWeight: 750,
                                textTransform: "uppercase",
                                padding: "2px 6px",
                                borderRadius: 4,
                                backgroundColor: r.severity === "high" ? "#FECACA" : "#FEF3C7",
                                color: r.severity === "high" ? "#991B1B" : "#92400E",
                                letterSpacing: "0.02em",
                              }}
                            >
                              {r.severity} severity
                            </span>
                          </div>
                          {r.mitigation && (
                            <span style={{ color: "#7F1D1D", fontSize: 11.5 }}>
                              <strong>Mitigation:</strong> {r.mitigation}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "transcript" && (
              <motion.div
                key="tab_transcript"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div
                    style={{
                      flex: 1,
                      minWidth: 200,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 12px",
                      borderRadius: 7,
                      backgroundColor: "#F2F2F7",
                      border: "1px solid rgba(0, 0, 0, 0.06)",
                    }}
                  >
                    <Search size={13} color="#86868B" />
                    <input
                      type="text"
                      placeholder="Search in transcript..."
                      value={transcriptSearch}
                      onChange={(e) => setTranscriptSearch(e.target.value)}
                      style={{
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        width: "100%",
                        fontSize: 12,
                        color: "#1D1D1F",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>

                  <select
                    value={selectedSpeakerFilter}
                    onChange={(e) => setSelectedSpeakerFilter(e.target.value)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 7,
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      backgroundColor: "#FFFFFF",
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: "#1D1D1F",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="all">All Speakers ({allSpeakers.length})</option>
                    {allSpeakers.map((spk) => (
                      <option key={spk} value={spk}>
                        {spk}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleCopyTranscript}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "6px 10px",
                      borderRadius: 7,
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      backgroundColor: "#FFFFFF",
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: copiedTranscript ? "#059669" : "#1D1D1F",
                      cursor: "pointer",
                    }}
                  >
                    {copiedTranscript ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                    <span>{copiedTranscript ? "Copied" : "Copy Transcript"}</span>
                  </button>
                </div>

                {filteredTranscript.length === 0 ? (
                  <div style={{ padding: "32px 0", textAlign: "center", color: "#86868B", fontSize: 13 }}>
                    No dialogue matched the filter criteria.
                  </div>
                ) : (
                  filteredTranscript.map((t, idx) => {
                    const originalSpeaker = t.speaker;
                    const resolvedSpeaker = speakerLabels[originalSpeaker] || originalSpeaker;
                    const isAI = resolvedSpeaker.toLowerCase().includes("reality") || resolvedSpeaker.toLowerCase().includes("ai");
                    const isHighlighted = highlightedTimestamp === t.timestamp;

                    return (
                      <div
                        id={`transcript-ts-${t.timestamp}`}
                        key={idx}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 8,
                          backgroundColor: isHighlighted ? "rgba(0, 113, 227, 0.12)" : isAI ? "rgba(0, 113, 227, 0.04)" : "#F8F9FB",
                          border: `1px solid ${isHighlighted ? "#0071E3" : isAI ? "rgba(0, 113, 227, 0.12)" : "rgba(0, 0, 0, 0.05)"}`,
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                          transition: "all 200ms ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          {editingSpeaker === originalSpeaker ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <input
                                type="text"
                                value={newSpeakerDraft}
                                onChange={(e) => setNewSpeakerDraft(e.target.value)}
                                placeholder={resolvedSpeaker}
                                autoFocus
                                style={{
                                  padding: "1px 4px",
                                  borderRadius: 4,
                                  border: "1px solid #0071E3",
                                  fontSize: 11,
                                  outline: "none",
                                }}
                              />
                              <button
                                onClick={() => handleSaveSpeaker(originalSpeaker)}
                                style={{
                                  border: "none",
                                  backgroundColor: "#0071E3",
                                  color: "#FFFFFF",
                                  borderRadius: 4,
                                  fontSize: 10,
                                  padding: "2px 5px",
                                  cursor: "pointer",
                                }}
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span
                                style={{
                                  fontSize: 11.5,
                                  fontWeight: 700,
                                  color: isAI ? "#0071E3" : "#1D1D1F",
                                }}
                              >
                                {resolvedSpeaker}
                              </span>
                              {!isAI && (
                                <button
                                  onClick={() => {
                                    setEditingSpeaker(originalSpeaker);
                                    setNewSpeakerDraft(resolvedSpeaker);
                                  }}
                                  title="Rename Speaker"
                                  style={{
                                    border: "none",
                                    background: "transparent",
                                    cursor: "pointer",
                                    padding: 0,
                                    color: "#86868B",
                                  }}
                                >
                                  <Edit2 size={10} />
                                </button>
                              )}
                            </div>
                          )}

                          <span style={{ fontSize: 10.5, color: "#86868B", fontVariantNumeric: "tabular-nums" }}>
                            {Math.floor(t.timestamp / 60)}:{(t.timestamp % 60).toString().padStart(2, "0")}
                          </span>
                        </div>

                        <p style={{ margin: 0, fontSize: 13, color: "#334155", lineHeight: 1.45 }}>
                          {t.text}
                        </p>
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}

            {activeTab === "usage" && (
              <motion.div
                key="tab_usage"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div style={{ fontSize: 12, color: "#86868B", marginBottom: 2 }}>
                  Questions and live AI assist queries asked during this meeting session:
                </div>

                {usageHistory.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      padding: "14px 16px",
                      borderRadius: 10,
                      backgroundColor: "#F8F9FB",
                      border: "1px solid rgba(0, 0, 0, 0.06)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          backgroundColor: "#E5E5EA",
                          color: "#1D1D1F",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: 700,
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        Q
                      </div>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1D1D1F" }}>
                        {item.question}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, paddingLeft: 28 }}>
                      <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                        {item.answer}
                      </p>
                    </div>

                    {item.codeSnippet && (
                      <div
                        style={{
                          marginLeft: 28,
                          borderRadius: 8,
                          backgroundColor: "#0F172A",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          overflow: "hidden",
                          fontFamily: "ui-monospace, Menlo, Monaco, monospace",
                        }}
                      >
                        <div
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Code2 size={12} color="#38BDF8" />
                            <span style={{ fontSize: 11, color: "#94A3B8" }}>
                              {item.codeSnippet.technique || "Implementation"}
                            </span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {item.codeSnippet.complexity && (
                              <span style={{ fontSize: 10, color: "#4ADE80", fontWeight: 600 }}>
                                {item.codeSnippet.complexity}
                              </span>
                            )}
                            <button
                              onClick={async () => {
                                await navigator.clipboard.writeText(item.codeSnippet?.code || "");
                              }}
                              style={{
                                border: "none",
                                background: "transparent",
                                color: "#94A3B8",
                                cursor: "pointer",
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                        </div>

                        <pre
                          style={{
                            margin: 0,
                            padding: "10px 12px",
                            fontSize: 11.5,
                            color: "#E2E8F0",
                            overflowX: "auto",
                            lineHeight: 1.5,
                          }}
                        >
                          {item.codeSnippet.code}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "10px 24px 12px 24px",
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid rgba(0, 0, 0, 0.08)",
          boxShadow: "0 -4px 16px rgba(0, 0, 0, 0.03)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          zIndex: 100,
        }}
      >
        <form onSubmit={handleSendBottomChat} style={{ flex: 1, display: "flex", alignItems: "center", position: "relative" }}>
          <Sparkles size={14} color="#0071E3" style={{ position: "absolute", left: 12 }} />
          <input
            type="text"
            placeholder="Ask Reality anything about this meeting (e.g. key objections, action summary)..."
            value={bottomChatQuery}
            onChange={(e) => setBottomChatQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 36px 8px 34px",
              borderRadius: 8,
              border: "1px solid rgba(0, 0, 0, 0.12)",
              backgroundColor: "#F8F9FA",
              fontSize: 12.5,
              color: "#1D1D1F",
              outline: "none",
              fontFamily: "inherit",
              transition: "border-color 150ms ease, box-shadow 150ms ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#0071E3";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0, 113, 227, 0.15)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.12)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          <button
            type="submit"
            disabled={!bottomChatQuery.trim()}
            style={{
              position: "absolute",
              right: 6,
              border: "none",
              backgroundColor: bottomChatQuery.trim() ? "#0071E3" : "transparent",
              color: bottomChatQuery.trim() ? "#FFFFFF" : "#C7C7CC",
              width: 24,
              height: 24,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: bottomChatQuery.trim() ? "pointer" : "default",
            }}
          >
            <Send size={12} />
          </button>
        </form>

        <button
          onClick={() => setIsChatOverlayOpen(!isChatOverlayOpen)}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid rgba(0, 0, 0, 0.08)",
            backgroundColor: isChatOverlayOpen ? "#1D1D1F" : "#FFFFFF",
            color: isChatOverlayOpen ? "#FFFFFF" : "#1D1D1F",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <MessageSquare size={13} />
          <span>{isChatOverlayOpen ? "Close Chat" : "Meeting Chat"}</span>
        </button>
      </div>

      <AnimatePresence>
        {isChatOverlayOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.2, ease: springEase }}
            style={{
              position: "absolute",
              bottom: 58,
              left: 20,
              right: 20,
              height: 380,
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.08)",
              display: "flex",
              flexDirection: "column",
              zIndex: 200,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "10px 14px",
                borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                backgroundColor: "#F8F9FA",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Sparkles size={14} color="#0071E3" />
                <span style={{ fontSize: 13, fontWeight: 650, color: "#1D1D1F" }}>
                  Meeting Chat: {meeting.title}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setIsToneDropdownOpen(!isToneDropdownOpen)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "3px 8px",
                      borderRadius: 6,
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      backgroundColor: "#FFFFFF",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#0071E3",
                      cursor: "pointer",
                    }}
                  >
                    <span>Tone: {followUpTone.charAt(0).toUpperCase() + followUpTone.slice(1)}</span>
                    <ChevronDown size={11} />
                  </button>

                  <AnimatePresence>
                    {isToneDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 2 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "100%",
                          marginTop: 4,
                          zIndex: 300,
                          backgroundColor: "#FFFFFF",
                          border: "1px solid rgba(0, 0, 0, 0.08)",
                          borderRadius: 8,
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                          padding: 4,
                          minWidth: 120,
                        }}
                      >
                        {(["professional", "warm", "concise", "friendly"] as FollowUpTone[]).map((t) => (
                          <button
                            key={t}
                            onClick={() => {
                              setFollowUpTone(t);
                              setIsToneDropdownOpen(false);
                            }}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "5px 8px",
                              borderRadius: 5,
                              border: "none",
                              backgroundColor: followUpTone === t ? "rgba(0, 113, 227, 0.08)" : "transparent",
                              color: followUpTone === t ? "#0071E3" : "#1D1D1F",
                              fontSize: 11.5,
                              fontWeight: followUpTone === t ? 650 : 500,
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                            {followUpTone === t && <Check size={11} color="#0071E3" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={() => setIsChatOverlayOpen(false)}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "#86868B",
                    padding: 2,
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div
              style={{
                padding: "8px 14px",
                borderBottom: "1px solid rgba(0, 0, 0, 0.04)",
                backgroundColor: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                gap: 6,
                overflowX: "auto",
              }}
            >
              <button
                onClick={() => handleRunAiQuickPrompt("email")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  backgroundColor: "#F8F9FA",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#1D1D1F",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <Mail size={11} color="#0071E3" />
                <span>Draft Follow-Up ({followUpTone})</span>
              </button>

              <button
                onClick={() => handleRunAiQuickPrompt("slack")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  backgroundColor: "#F8F9FA",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#1D1D1F",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <Share2 size={11} color="#059669" />
                <span>Format for Slack</span>
              </button>

              <button
                onClick={() => handleRunAiQuickPrompt("risks")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  backgroundColor: "#F8F9FA",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#1D1D1F",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <AlertTriangle size={11} color="#D97706" />
                <span>Summarize Risks</span>
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "85%",
                      padding: "8px 12px",
                      borderRadius: 10,
                      backgroundColor: msg.sender === "user" ? "#0071E3" : "#F2F2F7",
                      color: msg.sender === "user" ? "#FFFFFF" : "#1D1D1F",
                      fontSize: 12.5,
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                      position: "relative",
                    }}
                  >
                    {msg.sender === "ai" && (
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(msg.text);
                        }}
                        style={{
                          position: "absolute",
                          right: 6,
                          top: 6,
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: "#86868B",
                          padding: 2,
                        }}
                        title="Copy Response"
                      >
                        <Copy size={11} />
                      </button>
                    )}
                    {msg.text}
                  </div>
                  <span style={{ fontSize: 10, color: "#86868B", marginTop: 2, padding: "0 4px", fontVariantNumeric: "tabular-nums" }}>
                    {msg.time}
                  </span>
                </div>
              ))}

              {isChatResponding && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#0071E3", fontStyle: "italic" }}>
                  <Sparkles size={12} />
                  <span>Reality AI is synthesizing response...</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
