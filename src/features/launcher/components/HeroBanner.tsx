import * as React from "react";
import { Radio, RotateCw, Ghost, Zap } from "lucide-react";
import { PersonaConfig, PersonaMode } from "../types";
import { PERSONA_CONFIGS } from "../services/meetingsService";
import { systemService, ActiveMeetingApp } from "@/services";
import { typography } from "@/styles/theme";

export interface HeroBannerProps {
  selectedPersona?: PersonaMode;
  persona?: PersonaConfig;
  isStealthActive?: boolean;
  isStealth?: boolean;
  onToggleStealth: () => void;
  onStartMeeting: () => void;
  onRefresh?: () => void | Promise<void>;
  onRefreshMeetings?: () => void;
  onOpenSchedule?: () => void;
  isRefreshing?: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  selectedPersona = "general",
  persona: providedPersona,
  isStealthActive,
  isStealth,
  onToggleStealth,
  onStartMeeting,
  onRefresh,
  onRefreshMeetings,
  isRefreshing = false,
}) => {
  const activeStealth = isStealthActive ?? isStealth ?? false;
  const activeRefresh = onRefresh ?? onRefreshMeetings;
  const persona = providedPersona || PERSONA_CONFIGS[selectedPersona] || (PERSONA_CONFIGS["general"] as PersonaConfig);
  const [activeMeetingApps, setActiveMeetingApps] = React.useState<ActiveMeetingApp[]>([]);

  React.useEffect(() => {
    systemService.detectActiveMeetingApps().then((apps) => {
      if (apps.length > 0) setActiveMeetingApps(apps);
    });
  }, []);

  const activeAppName = activeMeetingApps.length > 0 && activeMeetingApps[0] ? activeMeetingApps[0].name.replace(" Workplace", "").replace(" Call", "") : null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px",
        borderRadius: 11,
        backgroundColor: "#FFFFFF",
        border: "1px solid rgba(0, 0, 0, 0.07)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
        userSelect: "none",
        gap: 12,
        height: 44,
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0, flex: 1 }}>
        <div
          style={{
            ...typography.scale.badge,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 8px",
            borderRadius: 6,
            backgroundColor: "#F2F2F7",
            border: "1px solid rgba(0, 0, 0, 0.04)",
            color: "#1D1D1F",
            whiteSpace: "nowrap",
            height: 26,
            boxSizing: "border-box",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#34C759",
              boxShadow: "0 0 0 2px rgba(52, 199, 89, 0.2)",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <span>Neural Engine &bull; &lt;350ms</span>
        </div>

        {activeAppName && (
          <div
            title={`Active process detected: ${activeAppName}`}
            style={{
              ...typography.scale.badge,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 8px",
              borderRadius: 6,
              backgroundColor: "rgba(0, 113, 227, 0.08)",
              border: "1px solid rgba(0, 113, 227, 0.18)",
              color: "#0071E3",
              fontWeight: 600,
              whiteSpace: "nowrap",
              height: 26,
              boxSizing: "border-box",
            }}
          >
            <Zap size={11} />
            <span>{activeAppName} Active</span>
          </div>
        )}

        <button
          onClick={onToggleStealth}
          title={activeStealth ? "Stealth Mode Active: Invisible to screen shares" : "Standard Mode: Normal HUD overlay"}
          style={{
            ...typography.scale.badge,
            display: "inline-flex",
            alignItems: "center",
            gap: 4.5,
            padding: "4px 8px",
            borderRadius: 6,
            border: activeStealth ? "1px solid rgba(88, 86, 214, 0.25)" : "1px solid rgba(0, 0, 0, 0.06)",
            backgroundColor: activeStealth ? "rgba(88, 86, 214, 0.08)" : "#FFFFFF",
            color: activeStealth ? "#5856D6" : "#6E6E73",
            cursor: "pointer",
            whiteSpace: "nowrap",
            height: 26,
            boxSizing: "border-box",
            transition: "all 120ms ease",
          }}
          onMouseEnter={(e) => {
            if (!activeStealth) e.currentTarget.style.backgroundColor = "#F8F9FA";
          }}
          onMouseLeave={(e) => {
            if (!activeStealth) e.currentTarget.style.backgroundColor = "#FFFFFF";
          }}
        >
          <Ghost size={12} />
          <span>{activeStealth ? "Stealth" : "Visible"}</span>
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
        {activeRefresh && (
          <button
            onClick={activeRefresh}
            disabled={isRefreshing}
            title="Sync and refresh live meeting schedule"
            style={{
              ...typography.scale.badge,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid rgba(0, 0, 0, 0.06)",
              backgroundColor: "#FFFFFF",
              color: "#6E6E73",
              cursor: isRefreshing ? "default" : "pointer",
              height: 26,
              boxSizing: "border-box",
              transition: "all 120ms ease",
            }}
            onMouseEnter={(e) => {
              if (!isRefreshing) e.currentTarget.style.backgroundColor = "#F8F9FA";
            }}
            onMouseLeave={(e) => {
              if (!isRefreshing) e.currentTarget.style.backgroundColor = "#FFFFFF";
            }}
          >
            <RotateCw size={11} className={isRefreshing ? "animate-spin" : ""} />
            <span>Sync</span>
          </button>
        )}

        <button
          onClick={onStartMeeting}
          style={{
            ...typography.scale.button,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "0 11px",
            borderRadius: 7,
            backgroundColor: "#1D1D1F",
            color: "#FFFFFF",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
            whiteSpace: "nowrap",
            height: 26,
            boxSizing: "border-box",
            transition: "all 120ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#000000";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#1D1D1F";
          }}
        >
          <Radio size={11} color="#34C759" />
          <span>Start {persona.label.split(" ")[0]}</span>
        </button>
      </div>
    </div>
  );
};
