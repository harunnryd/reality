import * as React from "react";
import { Calendar, Video, ChevronRight } from "lucide-react";

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  platform: "google_meet" | "zoom" | "teams" | "in_person";
  attendeesCount?: number;
  isNow?: boolean;
}

export interface UpcomingCalendarCardProps {
  onJoinMeeting?: (event: CalendarEvent) => void;
  onOpenSchedule?: () => void;
}

export const UpcomingCalendarCard: React.FC<UpcomingCalendarCardProps> = ({
  onJoinMeeting,
  onOpenSchedule,
}) => {
  const [upcomingEvent] = React.useState<CalendarEvent | null>({
    id: "evt-real-1",
    title: "Distributed Vector Search & Hybrid RAG Review",
    startTime: "14:00",
    endTime: "14:45",
    platform: "google_meet",
    attendeesCount: 4,
    isNow: false,
  });

  return (
    <div
      style={{
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        border: "1px solid rgba(0, 0, 0, 0.07)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        userSelect: "none",
        height: 106,
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Calendar size={12} color="#0071E3" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#86868B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Next Calendar Event
          </span>
        </div>

        {onOpenSchedule && (
          <button
            onClick={onOpenSchedule}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 10,
              fontWeight: 650,
              color: "#0071E3",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 2,
              padding: 0,
            }}
          >
            <span>View Schedule</span>
            <ChevronRight size={10} />
          </button>
        )}
      </div>

      {upcomingEvent ? (
        <div
          style={{
            borderRadius: 8,
            backgroundColor: "#F8F9FB",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            padding: "7px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            height: 52,
            boxSizing: "border-box",
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 650,
                color: "#1D1D1F",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginBottom: 2,
              }}
            >
              {upcomingEvent.title}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: "#86868B" }}>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{upcomingEvent.startTime} – {upcomingEvent.endTime}</span>
              <span>&bull;</span>
              <span>Google Meet</span>
            </div>
          </div>

          <button
            onClick={() => onJoinMeeting?.(upcomingEvent)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid rgba(0, 113, 227, 0.2)",
              backgroundColor: "rgba(0, 113, 227, 0.08)",
              color: "#0071E3",
              fontSize: 11,
              fontWeight: 650,
              cursor: "pointer",
              flexShrink: 0,
              transition: "all 120ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 113, 227, 0.14)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 113, 227, 0.08)")}
          >
            <Video size={11} />
            <span>Join HUD</span>
          </button>
        </div>
      ) : (
        <div
          style={{
            borderRadius: 8,
            backgroundColor: "#F8F9FB",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            padding: "7px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#86868B",
            fontSize: 11,
            gap: 6,
            height: 52,
            boxSizing: "border-box",
          }}
        >
          <Calendar size={13} color="#86868B" />
          <span>No upcoming calendar events today</span>
        </div>
      )}
    </div>
  );
};
