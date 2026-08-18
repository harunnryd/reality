import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Camera,
  Square,
  ArrowUp,
  Copy,
  Check,
  Zap,
  Ghost,
  Code2,
  Pencil,
  MessageSquare,
  Lightbulb,
  HelpCircle,
  X,
  Image as ImageIcon,
  ChevronDown,
} from "lucide-react";
import { WindowControls } from "@/components/WindowControls";
import { useLiveMeetingSession } from "../hooks/useLiveMeetingSession";
import { LiveMeetingConfig } from "../types";
import { Meeting, PersonaMode } from "../../launcher/types";
import { PERSONA_CONFIGS } from "../../launcher/services/meetingsService";
import { visionService, stealthService } from "@/services";
import { typography } from "@/styles/theme";

export interface MeetingHudShellProps {
  config?: LiveMeetingConfig;
  onFinishMeeting: (meeting: Meeting) => void;
}

const HOTKEYS = [
  { id: "what_to_answer", label: "What should I answer?" },
  { id: "clarify", label: "Clarify" },
  { id: "recap", label: "Recap" },
  { id: "follow_up", label: "Follow up" },
  { id: "answer", label: "Answer" },
];

export const MeetingHudShell: React.FC<MeetingHudShellProps> = ({
  config,
  onFinishMeeting,
}) => {
  const [selectedPersona, setSelectedPersona] = React.useState<PersonaMode>(config?.persona ?? "tech");
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = React.useState(false);
  const [inputPrompt, setInputPrompt] = React.useState("");
  const [isOcrScanning, setIsOcrScanning] = React.useState(false);
  const [attachedScreenshot, setAttachedScreenshot] = React.useState<string | null>(null);
  const [copiedCode, setCopiedCode] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const personaConfig = PERSONA_CONFIGS[selectedPersona] || PERSONA_CONFIGS.tech;

  const sessionConfig = React.useMemo<LiveMeetingConfig>(() => ({
    title: config?.title || "Architecture & AI Strategy Review",
    persona: selectedPersona,
    isStealth: config?.isStealth ?? false,
  }), [config, selectedPersona]);

  const {
    messages,
    currentSuggestion,
    isMicActive,
    isStealth,
    toggleStealth,
    formattedTimer,
    sendCustomPrompt,
    finalizeMeeting,
  } = useLiveMeetingSession(sessionConfig);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentSuggestion]);

  const handleToggleStealth = async () => {
    toggleStealth();
    if (!isStealth) {
      await stealthService.applyStealthMode();
    }
  };

  const handleEndMeeting = () => {
    const finalData = finalizeMeeting();
    onFinishMeeting(finalData);
  };

  const handleOcrClick = async () => {
    setIsOcrScanning(true);
    try {
      const snapshot = await visionService.captureScreenSlide();
      if (snapshot.image_base64) {
        setAttachedScreenshot(`Slide OCR (${snapshot.width}x${snapshot.height})`);
      }
    } catch {
      setAttachedScreenshot("Active Window OCR Capture");
    } finally {
      setIsOcrScanning(false);
    }
  };

  const handleHotkeyClick = (actionLabel: string) => {
    sendCustomPrompt(actionLabel);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() && !attachedScreenshot) return;

    const fullPrompt = attachedScreenshot
      ? `[${attachedScreenshot}] ${inputPrompt}`
      : inputPrompt;

    sendCustomPrompt(fullPrompt);
    setInputPrompt("");
    setAttachedScreenshot(null);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        fontFamily: typography.fontFamily,
        userSelect: "none",
        zIndex: 99999,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 620,
          height: "88vh",
          maxHeight: 680,
          borderRadius: 18,
          backgroundColor: "rgba(255, 255, 255, 0.88)",
          backdropFilter: "blur(32px) saturate(190%)",
          WebkitBackdropFilter: "blur(32px) saturate(190%)",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <div
          data-tauri-drag-region
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
            backgroundColor: "rgba(255, 255, 255, 0.65)",
            backdropFilter: "blur(12px)",
            cursor: "grab",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="no-drag">
              <WindowControls />
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "2px 8px",
                borderRadius: 999,
                backgroundColor: "rgba(0, 0, 0, 0.04)",
                color: "#1D1D1F",
                fontSize: 11,
                fontWeight: 650,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: isMicActive ? "#22C55E" : "#94A3B8",
                  boxShadow: isMicActive ? "0 0 6px rgba(34, 197, 94, 0.6)" : "none",
                }}
              />
              <span>{formattedTimer}</span>
            </div>

            <div style={{ position: "relative" }} className="no-drag">
              <button
                type="button"
                onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                style={{
                  ...typography.scale.badge,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 8px",
                  borderRadius: 6,
                  border: "1px solid rgba(0, 113, 227, 0.2)",
                  backgroundColor: "rgba(0, 113, 227, 0.06)",
                  color: "#0071E3",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 120ms ease",
                }}
              >
                <span>{personaConfig.label}</span>
                <ChevronDown size={10} />
              </button>

              <AnimatePresence>
                {isPersonaMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      marginTop: 6,
                      zIndex: 300,
                      backgroundColor: "#FFFFFF",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      borderRadius: 8,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
                      padding: 4,
                      minWidth: 160,
                    }}
                  >
                    {Object.values(PERSONA_CONFIGS).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPersona(p.id as PersonaMode);
                          setIsPersonaMenuOpen(false);
                        }}
                        style={{
                          ...typography.scale.caption,
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "4px 8px",
                          borderRadius: 5,
                          border: "none",
                          backgroundColor: selectedPersona === p.id ? "rgba(0, 113, 227, 0.08)" : "transparent",
                          color: selectedPersona === p.id ? "#0071E3" : "#1D1D1F",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <span>{p.label}</span>
                        {selectedPersona === p.id && <Check size={11} color="#0071E3" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }} className="no-drag">
            <button
              onClick={handleToggleStealth}
              title={isStealth ? "Stealth Mode: Invisible to screen shares" : "Standard Mode: Normal HUD"}
              style={{
                ...typography.scale.badge,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 8px",
                borderRadius: 6,
                backgroundColor: isStealth ? "rgba(88, 86, 214, 0.1)" : "rgba(0, 0, 0, 0.04)",
                border: isStealth ? "1px solid rgba(88, 86, 214, 0.25)" : "1px solid transparent",
                color: isStealth ? "#5856D6" : "#6E6E73",
                cursor: "pointer",
                transition: "all 120ms ease",
              }}
            >
              <Ghost size={11} color={isStealth ? "#5856D6" : "#6E6E73"} />
              <span>{isStealth ? "Stealth" : "Visible"}</span>
            </button>

            <button
              onClick={handleEndMeeting}
              title="End Meeting & Generate Notes"
              style={{
                ...typography.scale.badge,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 9px",
                borderRadius: 6,
                backgroundColor: "#DC2626",
                border: "none",
                color: "#FFFFFF",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(220, 38, 38, 0.3)",
                transition: "all 120ms ease",
              }}
            >
              <Square size={8} fill="#FFFFFF" color="#FFFFFF" />
              <span>Stop</span>
            </button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {messages.map((m) => {
            const isUser = m.speaker.toLowerCase() === "you";
            const isRealityAI = m.speaker.toLowerCase().includes("reality") || m.speaker.toLowerCase().includes("ai");

            if (isUser) {
              return (
                <div key={m.id} style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div
                    style={{
                      ...typography.scale.bodyMedium,
                      padding: "7px 13px",
                      borderRadius: "14px 14px 2px 14px",
                      background: "linear-gradient(180deg, #0077ED 0%, #0066D6 100%)",
                      boxShadow: "0 2px 8px rgba(0, 113, 227, 0.25)",
                      color: "#FFFFFF",
                      maxWidth: "75%",
                      wordBreak: "break-word",
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              );
            }

            if (isRealityAI) {
              return (
                <div
                  key={m.id}
                  style={{
                    borderRadius: 12,
                    backgroundColor: "rgba(0, 113, 227, 0.05)",
                    border: "1px solid rgba(0, 113, 227, 0.16)",
                    padding: "10px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Sparkles size={13} color="#0071E3" />
                    <span style={{ ...typography.scale.badge, color: "#0071E3", fontWeight: 600 }}>
                      Reality AI
                    </span>
                  </div>
                  <div style={{ ...typography.scale.bodyMedium, color: "#1D1D1F", lineHeight: 1.45 }}>
                    {m.text}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={m.id}
                style={{
                  borderRadius: 10,
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  border: "1px solid rgba(0, 0, 0, 0.06)",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)",
                  padding: "9px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ ...typography.scale.caption, fontWeight: 600, color: "#475569" }}>
                    {m.speaker}
                  </span>
                  <span style={{ ...typography.scale.micro, color: "#94A3B8" }}>
                    {Math.floor(m.timestamp / 60)}:{(m.timestamp % 60).toString().padStart(2, "0")}
                  </span>
                </div>
                <div style={{ ...typography.scale.bodyMedium, color: "#1D1D1F", lineHeight: 1.45 }}>
                  {m.text}
                </div>
              </div>
            );
          })}

          {currentSuggestion && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                borderRadius: 12,
                backgroundColor: "#FFFFFF",
                border: "1px solid rgba(0, 113, 227, 0.2)",
                boxShadow: "0 4px 16px rgba(0, 113, 227, 0.08)",
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Sparkles size={13} color="#0071E3" />
                  <span style={{ ...typography.scale.titleSmall, color: "#0071E3" }}>
                    {currentSuggestion.title}
                  </span>
                </div>

                {currentSuggestion.confidence && (
                  <span
                    style={{
                      ...typography.scale.micro,
                      color: "#047857",
                      backgroundColor: "rgba(16, 185, 129, 0.12)",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                      padding: "1.5px 6px",
                      borderRadius: 4,
                      fontWeight: 600,
                    }}
                  >
                    {currentSuggestion.confidence}% match
                  </span>
                )}
              </div>

              <div style={{ ...typography.scale.bodyMedium, color: "#0F172A", lineHeight: 1.45 }}>
                {currentSuggestion.summary}
              </div>

              {currentSuggestion.codeSnippet && (
                <div
                  style={{
                    borderRadius: 8,
                    backgroundColor: "#0F172A",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    overflow: "hidden",
                    fontFamily: typography.fontMono,
                    marginTop: 2,
                  }}
                >
                  <div
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Code2 size={11} color="#38BDF8" />
                      <span style={{ fontSize: 10.5, color: "#94A3B8" }}>
                        {currentSuggestion.codeSnippet.technique || "Snippet"}
                      </span>
                    </div>

                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(currentSuggestion.codeSnippet?.code || "");
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: copiedCode ? "#4ADE80" : "#94A3B8",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {copiedCode ? <Check size={11} color="#4ADE80" /> : <Copy size={11} />}
                    </button>
                  </div>

                  <pre
                    style={{
                      margin: 0,
                      padding: "8px 10px",
                      fontSize: 11,
                      color: "#F1F5F9",
                      overflowX: "auto",
                      lineHeight: 1.4,
                    }}
                  >
                    {currentSuggestion.codeSnippet.code}
                  </pre>
                </div>
              )}
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 12px",
            borderTop: "1px solid rgba(0, 0, 0, 0.05)",
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(8px)",
            overflowX: "auto",
            flexShrink: 0,
          }}
        >
          {HOTKEYS.map((h) => (
            <button
              key={h.id}
              onClick={() => handleHotkeyClick(h.label)}
              style={{
                ...typography.scale.caption,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 8px",
                borderRadius: 999,
                border: h.id === "answer" ? "1px solid rgba(0, 113, 227, 0.3)" : "1px solid rgba(0, 0, 0, 0.07)",
                backgroundColor: h.id === "answer" ? "rgba(0, 113, 227, 0.1)" : "#FFFFFF",
                color: h.id === "answer" ? "#0071E3" : "#1D1D1F",
                fontWeight: h.id === "answer" ? 600 : 500,
                whiteSpace: "nowrap",
                cursor: "pointer",
                transition: "all 120ms ease",
              }}
            >
              {h.id === "what_to_answer" && <Pencil size={10} color="#6E6E73" />}
              {h.id === "clarify" && <MessageSquare size={10} color="#6E6E73" />}
              {h.id === "recap" && <Lightbulb size={10} color="#6E6E73" />}
              {h.id === "follow_up" && <HelpCircle size={10} color="#6E6E73" />}
              {h.id === "answer" && <Zap size={10} color="#0071E3" />}
              <span>{h.label}</span>
            </button>
          ))}
        </div>

        <div
          style={{
            padding: "10px 12px 12px 12px",
            borderTop: "1px solid rgba(0, 0, 0, 0.06)",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            flexShrink: 0,
          }}
        >
          {attachedScreenshot && (
            <div
              style={{
                ...typography.scale.caption,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "3px 7px",
                borderRadius: 6,
                backgroundColor: "rgba(88, 86, 214, 0.08)",
                border: "1px solid rgba(88, 86, 214, 0.2)",
                color: "#5856D6",
                marginBottom: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <ImageIcon size={11} />
                <span>{attachedScreenshot}</span>
              </div>
              <button
                onClick={() => setAttachedScreenshot(null)}
                style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0, color: "#86868B" }}
              >
                <X size={11} />
              </button>
            </div>
          )}

          <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "4px 6px 4px 10px",
                borderRadius: 9,
                border: "1px solid rgba(0, 0, 0, 0.1)",
                backgroundColor: "#FFFFFF",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
                gap: 6,
              }}
            >
              <button
                type="button"
                onClick={handleOcrClick}
                disabled={isOcrScanning}
                title="Capture Screen Slide (⌘S)"
                style={{
                  ...typography.scale.caption,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: "1px solid rgba(0, 0, 0, 0.06)",
                  backgroundColor: "#F2F2F7",
                  color: "#475569",
                  cursor: isOcrScanning ? "default" : "pointer",
                  flexShrink: 0,
                }}
              >
                <Camera size={12} />
                <span>{isOcrScanning ? "Scanning…" : "Screen OCR"}</span>
              </button>

              <input
                type="text"
                placeholder="Ask about screen or meeting context (⌘↵)..."
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                style={{
                  ...typography.scale.bodyMedium,
                  flex: 1,
                  border: "none",
                  backgroundColor: "transparent",
                  color: "#1D1D1F",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />

              <button
                type="submit"
                disabled={!inputPrompt.trim() && !attachedScreenshot}
                title="Send question (Enter)"
                aria-label="Send question"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  border: "none",
                  background: inputPrompt.trim() || attachedScreenshot ? "linear-gradient(180deg, #0077ED 0%, #0066D6 100%)" : "rgba(0, 0, 0, 0.06)",
                  color: inputPrompt.trim() || attachedScreenshot ? "#FFFFFF" : "#86868B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: inputPrompt.trim() || attachedScreenshot ? "pointer" : "default",
                  boxShadow: inputPrompt.trim() || attachedScreenshot ? "0 2px 6px rgba(0, 113, 227, 0.3)" : "none",
                  transition: "all 120ms ease",
                  flexShrink: 0,
                }}
              >
                <ArrowUp size={13} strokeWidth={2.5} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
