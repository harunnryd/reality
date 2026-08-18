import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Video,
  X,
  Users,
} from "lucide-react";
import { springEase } from "@/styles/theme";

export interface CalendarEventItem {
  id: string;
  title: string;
  time: string;
  duration: string;
  platform: "Google Meet" | "Zoom" | "Microsoft Teams";
  attendees: Array<{ name: string; email: string }>;
  isNext?: boolean;
}

const SCHEDULE_ITEMS: CalendarEventItem[] = [
  {
    id: "evt-real-1",
    title: "Distributed Vector Search & Hybrid RAG Architecture Review",
    time: "2:00 PM - 2:45 PM",
    duration: "45m",
    platform: "Google Meet",
    isNext: true,
    attendees: [
      { name: "Sarah Lin", email: "sarah.lin@acme.corp" },
      { name: "Dimas Prasetyo", email: "dimas@acme.corp" },
      { name: "Alex Chen", email: "alex.chen@acme.corp" },
      { name: "Erik Larson", email: "erik@acme.corp" },
    ],
  },
  {
    id: "evt-real-2",
    title: "Enterprise Pilot Negotiation: Horizon FinTech Global Rollout",
    time: "3:30 PM - 4:15 PM",
    duration: "45m",
    platform: "Zoom",
    attendees: [
      { name: "David Vance", email: "david.vance@horizonfintech.io" },
      { name: "Elena Rostova", email: "elena.rostova@horizonfintech.io" },
      { name: "Rahmat Hidayat", email: "rahmat@acme.corp" },
    ],
  },
  {
    id: "evt-real-3",
    title: "Executive Strategy: Q4 Roadmap & AI Copilot Monetization",
    time: "5:00 PM - 5:45 PM",
    duration: "45m",
    platform: "Google Meet",
    attendees: [
      { name: "Maya Anderson", email: "maya@acme.corp" },
      { name: "Kevin Wijaya", email: "kevin@acme.corp" },
      { name: "Amanda Cole", email: "amanda@acme.corp" },
      { name: "Sarah Lin", email: "sarah.lin@acme.corp" },
    ],
  },
];

const AVATAR_COLORS = [
  { bg: "#E0E7FF", text: "#3730A3" },
  { bg: "#FCE7F3", text: "#9D174D" },
  { bg: "#DCFCE7", text: "#166534" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#E0F2FE", text: "#075985" },
];

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getAvatarStyle(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export interface UpcomingScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMeetingForEvent?: (event: CalendarEventItem) => void;
}

export const UpcomingScheduleModal: React.FC<UpcomingScheduleModalProps> = ({
  isOpen,
  onClose,
  onStartMeetingForEvent,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="no-drag"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          padding: 24,
          userSelect: "none",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.18, ease: springEase }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 560,
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            border: "1px solid rgba(0, 0, 0, 0.08)",
            boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.06)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "16px 20px 14px 20px",
              borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#FAFAFA",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: "rgba(0, 113, 227, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0071E3",
                }}
              >
                <Calendar size={16} />
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 14.5,
                    fontWeight: 700,
                    color: "#1D1D1F",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Today's Calendar Schedule
                </h3>
                <span style={{ fontSize: 11, color: "#86868B" }}>
                  {new Date().toLocaleDateString([], {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                border: "none",
                background: "transparent",
                color: "#86868B",
                cursor: "pointer",
                padding: 4,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <X size={16} />
            </button>
          </div>

          <div
            style={{
              padding: "16px 20px 24px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              maxHeight: 440,
              overflowY: "auto",
            }}
          >
            {SCHEDULE_ITEMS.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  backgroundColor: item.isNext ? "rgba(0, 113, 227, 0.03)" : "#F8F9FB",
                  border: `1px solid ${item.isNext ? "rgba(0, 113, 227, 0.25)" : "rgba(0, 0, 0, 0.06)"}`,
                  boxShadow: item.isNext ? "0 2px 8px rgba(0, 113, 227, 0.08)" : "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      {item.isNext && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#0071E3",
                            backgroundColor: "rgba(0, 113, 227, 0.1)",
                            padding: "2px 7px",
                            borderRadius: 999,
                            letterSpacing: "0.02em",
                          }}
                        >
                          <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#0071E3" }} />
                          UP NEXT
                        </span>
                      )}
                      <h4
                        style={{
                          margin: 0,
                          fontSize: 13.5,
                          fontWeight: 650,
                          color: "#1D1D1F",
                          lineHeight: 1.35,
                        }}
                      >
                        {item.title}
                      </h4>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 11,
                        color: "#86868B",
                        marginTop: 5,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 3.5 }}>
                        <Clock size={11} />
                        <span>{item.time}</span>
                      </div>
                      <span>&bull;</span>
                      <span>{item.duration}</span>
                      <span>&bull;</span>
                      <span style={{ fontWeight: 600, color: "#475569" }}>{item.platform}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onStartMeetingForEvent?.(item)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "none",
                      backgroundColor: item.isNext ? "#0071E3" : "rgba(0, 113, 227, 0.08)",
                      color: item.isNext ? "#FFFFFF" : "#0071E3",
                      fontSize: 11.5,
                      fontWeight: 650,
                      cursor: "pointer",
                      boxShadow: item.isNext ? "0 2px 6px rgba(0, 113, 227, 0.25)" : "none",
                      transition: "all 120ms ease",
                      flexShrink: 0,
                    }}
                  >
                    <Video size={12} />
                    <span>Join HUD</span>
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    paddingTop: 8,
                    borderTop: "1px solid rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", marginLeft: 2 }}>
                    {item.attendees.slice(0, 4).map((a, idx) => {
                      const style = getAvatarStyle(a.name);
                      return (
                        <div
                          key={a.email}
                          title={a.name}
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            backgroundColor: style.bg,
                            color: style.text,
                            fontSize: 8.5,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1.5px solid #FFFFFF",
                            marginLeft: idx === 0 ? 0 : -5,
                          }}
                        >
                          {getInitials(a.name)}
                        </div>
                      );
                    })}
                  </div>

                  <span style={{ fontSize: 11, color: "#64748B" }}>
                    {item.attendees.map((a) => a.name).join(", ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
