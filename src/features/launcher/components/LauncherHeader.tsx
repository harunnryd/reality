import * as React from "react";
import { ChevronLeft, Settings, Sparkles } from "lucide-react";
import { TopSearchPill } from "./TopSearchPill";
import { PersonaSelector } from "./PersonaSelector";
import { WindowControls } from "@/components/WindowControls";
import { PersonaMode, Meeting } from "../types";

export interface LauncherHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedPersona: PersonaMode;
  onSelectPersona: (persona: PersonaMode) => void;
  onOpenSettings?: () => void;
  onOpenProfileIntelligence?: () => void;
  searchRef?: React.RefObject<HTMLInputElement>;
  selectedMeeting?: Meeting | null;
  onBack?: () => void;
}

export const LauncherHeader: React.FC<LauncherHeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedPersona,
  onSelectPersona,
  onOpenSettings,
  onOpenProfileIntelligence,
  searchRef,
  selectedMeeting,
  onBack,
}) => {
  return (
    <header
      data-tauri-drag-region
      style={{
        height: 40,
        backgroundColor: "#F5F5F5",
        borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 14px",
        boxSizing: "border-box",
        userSelect: "none",
        position: "relative",
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="no-drag" style={{ display: "flex", alignItems: "center" }}>
          <WindowControls />
        </div>

        {selectedMeeting && (
          <div className="no-drag" style={{ display: "flex", alignItems: "center", marginLeft: 6 }}>
            <button
              onClick={onBack}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 8px",
                borderRadius: 6,
                border: "1px solid rgba(0, 0, 0, 0.08)",
                backgroundColor: "#FFFFFF",
                fontSize: 11.5,
                fontWeight: 650,
                color: "#0071E3",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)",
                transition: "all 120ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 113, 227, 0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FFFFFF")}
            >
              <ChevronLeft size={13} />
              <span>All Sessions</span>
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 650,
                  padding: "1px 4px",
                  borderRadius: 3,
                  backgroundColor: "#F2F2F7",
                  color: "#86868B",
                  marginLeft: 2,
                }}
              >
                Esc
              </span>
            </button>
          </div>
        )}
      </div>

      {!selectedMeeting && (
        <div
          className="no-drag"
          style={{
            flex: 1,
            maxWidth: 320,
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <TopSearchPill
            value={searchQuery}
            onChange={onSearchChange}
            inputRef={searchRef}
          />
        </div>
      )}

      <div
        className="no-drag"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {!selectedMeeting && (
          <PersonaSelector
            selectedPersona={selectedPersona}
            onSelectPersona={onSelectPersona}
          />
        )}

        {onOpenProfileIntelligence && (
          <button
            onClick={onOpenProfileIntelligence}
            title="Profile Intelligence & Resume/JD"
            style={{
              border: "1px solid rgba(0, 113, 227, 0.2)",
              backgroundColor: "rgba(0, 113, 227, 0.06)",
              cursor: "pointer",
              padding: "4px 7px",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: "#0071E3",
              fontSize: 11,
              fontWeight: 650,
              transition: "background-color 150ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 113, 227, 0.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 113, 227, 0.06)")}
          >
            <Sparkles size={12} color="#0071E3" />
            <span>Profile</span>
          </button>
        )}

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            title="Reality Settings"
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: "5px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#86868B",
              transition: "background-color 150ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.06)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <Settings size={14} />
          </button>
        )}
      </div>
    </header>
  );
};
