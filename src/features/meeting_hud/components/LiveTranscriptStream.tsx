import * as React from "react";
import { motion } from "framer-motion";
import { Radio, User, Bot, Sparkles } from "lucide-react";
import { LiveTranscriptMessage } from "../types";

export interface LiveTranscriptStreamProps {
  messages: LiveTranscriptMessage[];
  isMicActive: boolean;
}

export const LiveTranscriptStream: React.FC<LiveTranscriptStreamProps> = ({
  messages,
  isMicActive,
}) => {
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        height: "100%",
        overflowY: "auto",
        padding: "12px 14px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 10px",
          borderRadius: 8,
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(0, 0, 0, 0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 2, height: 16 }}>
            {[12, 16, 14, 18, 12, 15, 13, 10].map((h, i) => (
              <motion.div
                key={i}
                animate={isMicActive ? { scaleY: [0.35, 1, 0.4] } : { scaleY: 0.2 }}
                transition={{
                  repeat: Infinity,
                  duration: 0.75 + (i % 3) * 0.12,
                  ease: "easeInOut",
                }}
                style={{
                  width: 2.5,
                  height: h,
                  borderRadius: 1.5,
                  backgroundColor: isMicActive ? "#0071E3" : "#C7C7CC",
                  transformOrigin: "center",
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 11, color: isMicActive ? "#1D1D1F" : "#86868B", fontWeight: 600 }}>
            {isMicActive ? "Streaming Audio & VAD Active" : "Microphone Muted"}
          </span>
        </div>

        <span style={{ fontSize: 10.5, color: "#86868B", fontVariantNumeric: "tabular-nums" }}>
          {messages.length} utterances
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {messages.map((m) => {
          const isAI = m.speaker.toLowerCase().includes("reality") || m.speaker.toLowerCase().includes("ai");
          const isMe = m.speaker.toLowerCase() === "you";

          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                padding: "8px 12px",
                borderRadius: 8,
                backgroundColor: isAI ? "rgba(0, 113, 227, 0.05)" : isMe ? "rgba(139, 92, 246, 0.05)" : "#FFFFFF",
                border: `1px solid ${isAI ? "rgba(0, 113, 227, 0.15)" : isMe ? "rgba(139, 92, 246, 0.15)" : "rgba(0, 0, 0, 0.06)"}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  {isAI ? (
                    <Sparkles size={11} color="#0071E3" />
                  ) : (
                    <User size={11} color={isMe ? "#8B5CF6" : "#6E6E73"} />
                  )}
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: isAI ? "#0071E3" : isMe ? "#8B5CF6" : "#1D1D1F",
                    }}
                  >
                    {m.speaker}
                  </span>
                </div>

                <span style={{ fontSize: 10, color: "#86868B", fontVariantNumeric: "tabular-nums" }}>
                  {Math.floor(m.timestamp / 60)}:{(m.timestamp % 60).toString().padStart(2, "0")}
                </span>
              </div>

              <p style={{ margin: 0, fontSize: 12.5, color: "#1D1D1F", lineHeight: 1.45 }}>
                {m.text}
              </p>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
