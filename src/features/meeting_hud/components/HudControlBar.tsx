import * as React from "react";
import { Mic, MicOff, Camera, Sparkles, Send, Square, Command } from "lucide-react";

export interface HudControlBarProps {
  isMicActive: boolean;
  onToggleMic: () => void;
  isOcrScanning: boolean;
  onTriggerOcr: () => void;
  onSubmitPrompt: (text: string) => void;
  onEndMeeting: () => void;
}

export const HudControlBar: React.FC<HudControlBarProps> = ({
  isMicActive,
  onToggleMic,
  isOcrScanning,
  onTriggerOcr,
  onSubmitPrompt,
  onEndMeeting,
}) => {
  const [promptText, setPromptText] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    onSubmitPrompt(promptText.trim());
    setPromptText("");
  };

  return (
    <div
      style={{
        padding: "10px 14px",
        backgroundColor: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(0, 0, 0, 0.08)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxSizing: "border-box",
        zIndex: 50,
      }}
    >
      <button
        onClick={onToggleMic}
        title={isMicActive ? "Mute Microphone" : "Unmute Microphone"}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: 8,
          border: `1px solid ${isMicActive ? "rgba(0, 113, 227, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
          backgroundColor: isMicActive ? "rgba(0, 113, 227, 0.08)" : "rgba(239, 68, 68, 0.08)",
          color: isMicActive ? "#0071E3" : "#EF4444",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        {isMicActive ? <Mic size={14} /> : <MicOff size={14} />}
      </button>

      <button
        onClick={onTriggerOcr}
        disabled={isOcrScanning}
        title="Capture & OCR active screen slide (⌘S)"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "0 9px",
          height: 32,
          borderRadius: 8,
          border: "1px solid rgba(88, 86, 214, 0.2)",
          backgroundColor: isOcrScanning ? "rgba(88, 86, 214, 0.15)" : "rgba(88, 86, 214, 0.08)",
          color: "#5856D6",
          fontSize: 11,
          fontWeight: 600,
          cursor: isOcrScanning ? "default" : "pointer",
          flexShrink: 0,
        }}
      >
        <Camera size={13} />
        <span>{isOcrScanning ? "Scanning..." : "Slide OCR"}</span>
      </button>

      <form onSubmit={handleSubmit} style={{ flex: 1, display: "flex", alignItems: "center", position: "relative" }}>
        <Sparkles size={13} color="#0071E3" style={{ position: "absolute", left: 10 }} />
        <input
          type="text"
          placeholder="Ask AI during meeting (e.g. objection handling, stats)..."
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          style={{
            width: "100%",
            padding: "6px 28px 6px 30px",
            borderRadius: 8,
            border: "1px solid rgba(0, 0, 0, 0.12)",
            backgroundColor: "#FFFFFF",
            fontSize: 12,
            color: "#1D1D1F",
            outline: "none",
            fontFamily: "inherit",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#0071E3";
            e.currentTarget.style.boxShadow = "0 0 0 2px rgba(0, 113, 227, 0.15)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.12)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <button
          type="submit"
          disabled={!promptText.trim()}
          style={{
            position: "absolute",
            right: 4,
            border: "none",
            backgroundColor: promptText.trim() ? "#0071E3" : "transparent",
            color: promptText.trim() ? "#FFFFFF" : "#C7C7CC",
            width: 22,
            height: 22,
            borderRadius: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: promptText.trim() ? "pointer" : "default",
          }}
        >
          <Send size={10} />
        </button>
      </form>

      <button
        onClick={onEndMeeting}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "0 10px",
          height: 32,
          borderRadius: 8,
          border: "1px solid rgba(220, 38, 38, 0.25)",
          backgroundColor: "#DC2626",
          color: "#FFFFFF",
          fontSize: 11.5,
          fontWeight: 650,
          cursor: "pointer",
          boxShadow: "0 1px 3px rgba(220, 38, 38, 0.3)",
          flexShrink: 0,
        }}
      >
        <Square size={11} fill="#FFFFFF" />
        <span>End Meeting</span>
      </button>
    </div>
  );
};
