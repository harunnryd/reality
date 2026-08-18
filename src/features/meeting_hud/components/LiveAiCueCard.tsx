import * as React from "react";
import { Sparkles, Copy, Check, Code2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LiveAiSuggestion } from "../types";

export interface LiveAiCueCardProps {
  suggestion: LiveAiSuggestion | null;
  onApplyPrompt?: (text: string) => void;
}

export const LiveAiCueCard: React.FC<LiveAiCueCardProps> = ({
  suggestion,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [copiedCode, setCopiedCode] = React.useState(false);

  if (!suggestion) return null;

  const handleCopyAll = async () => {
    try {
      const text = `${suggestion.title}\n${suggestion.summary}${suggestion.codeSnippet ? `\n\n${suggestion.codeSnippet.code}` : ""}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleCopyCodeOnly = async () => {
    if (!suggestion.codeSnippet?.code) return;
    try {
      await navigator.clipboard.writeText(suggestion.codeSnippet.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={suggestion.id}
        initial={{ opacity: 0, scale: 0.98, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.18 }}
        style={{
          borderRadius: 12,
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(0, 113, 227, 0.25)",
          boxShadow: "0 10px 25px -5px rgba(0, 113, 227, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)",
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={13} color="#0071E3" />
            <h4
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 700,
                color: "#0071E3",
                letterSpacing: "-0.01em",
              }}
            >
              {suggestion.title}
            </h4>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {suggestion.confidence && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#059669",
                  backgroundColor: "rgba(16, 185, 129, 0.08)",
                  padding: "1.5px 5px",
                  borderRadius: 4,
                }}
              >
                {suggestion.confidence}% match
              </span>
            )}

            <button
              onClick={handleCopyAll}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 6px",
                borderRadius: 5,
                border: "1px solid rgba(0, 0, 0, 0.08)",
                backgroundColor: "#FFFFFF",
                fontSize: 10.5,
                fontWeight: 600,
                color: copied ? "#059669" : "#1D1D1F",
                cursor: "pointer",
              }}
            >
              {copied ? <Check size={10} color="#10B981" /> : <Copy size={10} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: 12.5, color: "#1D1D1F", lineHeight: 1.5 }}>
          {suggestion.summary}
        </p>

        {suggestion.codeSnippet && (
          <div
            style={{
              borderRadius: 8,
              backgroundColor: "#0F172A",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              overflow: "hidden",
              fontFamily: "ui-monospace, Menlo, Monaco, monospace",
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
                  {suggestion.codeSnippet.technique || "Snippet"}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {suggestion.codeSnippet.complexity && (
                  <span style={{ fontSize: 9.5, color: "#4ADE80", fontWeight: 600 }}>
                    {suggestion.codeSnippet.complexity}
                  </span>
                )}
                <button
                  onClick={handleCopyCodeOnly}
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
                  {copiedCode ? <Check size={10} /> : <Copy size={10} />}
                </button>
              </div>
            </div>

            <pre
              style={{
                margin: 0,
                padding: "8px 10px",
                fontSize: 11,
                color: "#E2E8F0",
                overflowX: "auto",
                lineHeight: 1.45,
              }}
            >
              {suggestion.codeSnippet.code}
            </pre>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
