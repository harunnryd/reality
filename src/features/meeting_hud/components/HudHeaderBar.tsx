import * as React from "react";
import { WindowControls } from "@/components/WindowControls";
import { Ghost, Radio, Zap } from "lucide-react";
import { PersonaMode } from "../../launcher/types";
import { PERSONA_CONFIGS } from "../../launcher/services/meetingsService";

export interface HudHeaderBarProps {
  formattedTimer: string;
  isStealth: boolean;
  onToggleStealth: () => void;
  persona?: PersonaMode;
}

export const HudHeaderBar: React.FC<HudHeaderBarProps> = ({
  formattedTimer,
  isStealth,
  onToggleStealth,
  persona = "tech",
}) => {
  const currentPersona = PERSONA_CONFIGS[persona] || PERSONA_CONFIGS.tech;

  return (
    <header
      data-tauri-drag-region
      style={{
        height: 38,
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.07)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 14px",
        boxSizing: "border-box",
        userSelect: "none",
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="no-drag" style={{ display: "flex", alignItems: "center" }}>
          <WindowControls />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "2.5px 8px",
            borderRadius: 6,
            backgroundColor: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            fontSize: 11,
            color: "#DC2626",
            fontWeight: 650,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#EF4444",
              boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.25)",
              animation: "pulse 1.5s infinite ease-in-out",
            }}
          />
          <span>LIVE &bull; {formattedTimer}</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2.5px 7px",
            borderRadius: 5,
            backgroundColor: "rgba(0, 113, 227, 0.08)",
            border: "1px solid rgba(0, 113, 227, 0.15)",
            fontSize: 10.5,
            color: "#0071E3",
            fontWeight: 600,
          }}
        >
          <Zap size={10} />
          <span>&lt;350ms Whisper</span>
        </div>

        <button
          onClick={onToggleStealth}
          className="no-drag"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2.5px 7.5px",
            borderRadius: 5,
            border: isStealth ? "1px solid rgba(88, 86, 214, 0.25)" : "1px solid rgba(0, 0, 0, 0.08)",
            backgroundColor: isStealth ? "rgba(88, 86, 214, 0.08)" : "#FFFFFF",
            color: isStealth ? "#5856D6" : "#6E6E73",
            fontSize: 10.5,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 120ms ease",
          }}
        >
          <Ghost size={11} color={isStealth ? "#5856D6" : "#86868B"} />
          <span>{isStealth ? "Stealth Active" : "Stealth Off"}</span>
        </button>
      </div>
    </header>
  );
};
