import * as React from "react";
import { Clock, CheckSquare, Sparkles, ChevronRight, Search, X } from "lucide-react";
import { Meeting, PersonaMode } from "../types";
import { PERSONA_CONFIGS } from "../services/meetingsService";
import { DatePickerDropdown, DateFilterOption } from "./DatePickerDropdown";

export interface MeetingListProps {
  meetings: Meeting[];
  selectedMeetingId?: string;
  onSelectMeeting: (meeting: Meeting) => void;
  onDeleteMeeting?: (id: string) => void | Promise<void>;
  onStartMeeting?: () => void;
  onRefresh?: () => void | Promise<void>;
  isSearching?: boolean;
  selectedPersona?: PersonaMode;
  searchQuery?: string;
  onClearSearch?: () => void;
}

type TabMode = "all" | "action_items" | "decisions";

export const MeetingList: React.FC<MeetingListProps> = ({
  meetings,
  selectedMeetingId,
  onSelectMeeting,
  onDeleteMeeting,
  onStartMeeting,
  onRefresh,
  isSearching = false,
  selectedPersona = "general",
  searchQuery = "",
  onClearSearch,
}) => {
  const [activeTab, setActiveTab] = React.useState<TabMode>("all");
  const [selectedDateFilter, setSelectedDateFilter] = React.useState<DateFilterOption>("all_time");
  const [customDate, setCustomDate] = React.useState<Date | null>(null);

  const filteredMeetings = React.useMemo(() => {
    return meetings.filter((m) => {
      const meetingDate = new Date(m.date);
      const now = new Date();

      if (customDate) {
        return meetingDate.toDateString() === customDate.toDateString();
      }

      if (selectedDateFilter === "today") {
        return meetingDate.toDateString() === now.toDateString();
      } else if (selectedDateFilter === "this_week") {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return meetingDate >= startOfWeek;
      } else if (selectedDateFilter === "this_month") {
        return (
          meetingDate.getMonth() === now.getMonth() &&
          meetingDate.getFullYear() === now.getFullYear()
        );
      } else if (selectedDateFilter === "last_30_days") {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return meetingDate >= thirtyDaysAgo;
      }
      return true;
    });
  }, [meetings, selectedDateFilter, customDate]);

  const totalActionItems = React.useMemo(() => {
    return filteredMeetings.reduce((acc, m) => acc + (m.actionItems?.length || 0), 0);
  }, [filteredMeetings]);

  const totalDecisions = React.useMemo(() => {
    return filteredMeetings.reduce((acc, m) => acc + (m.keyPoints?.length || 0), 0);
  }, [filteredMeetings]);

  const handleResetFilters = () => {
    setSelectedDateFilter("all_time");
    setCustomDate(null);
    onClearSearch?.();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        userSelect: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            backgroundColor: "#EBEBEF",
            padding: 2,
            borderRadius: 7,
            gap: 2,
          }}
        >
          {[
            { id: "all", label: `All Meetings (${filteredMeetings.length})` },
            { id: "action_items", label: `Action Items (${totalActionItems})` },
            { id: "decisions", label: `Key Decisions (${totalDecisions})` },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabMode)}
                style={{
                  padding: "3px 9px",
                  borderRadius: 5,
                  border: "none",
                  backgroundColor: isSelected ? "#FFFFFF" : "transparent",
                  color: isSelected ? "#1D1D1F" : "#6E6E73",
                  fontSize: 11,
                  fontWeight: isSelected ? 650 : 500,
                  cursor: "pointer",
                  boxShadow: isSelected ? "0 1px 2px rgba(0, 0, 0, 0.12)" : "none",
                  transition: "color 120ms ease",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <DatePickerDropdown
          selectedFilter={selectedDateFilter}
          onSelectFilter={setSelectedDateFilter}
          customDate={customDate}
          onSelectCustomDate={setCustomDate}
        />
      </div>

      {filteredMeetings.length === 0 ? (
        <div
          style={{
            padding: "36px 20px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            border: "1px solid rgba(0, 0, 0, 0.06)",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              backgroundColor: "#F2F2F7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#86868B",
            }}
          >
            <Search size={16} />
          </div>

          <div>
            <h4 style={{ margin: "0 0 2px 0", fontSize: 13, fontWeight: 650, color: "#1D1D1F" }}>
              {searchQuery ? `No matches for "${searchQuery}"` : "No sessions for this date range"}
            </h4>
            <p style={{ margin: 0, fontSize: 11.5, color: "#86868B" }}>
              Try adjusting your search keywords or switching date filter to "All Time".
            </p>
          </div>

          <button
            onClick={handleResetFilters}
            style={{
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 10px",
              borderRadius: 6,
              border: "1px solid rgba(0, 113, 227, 0.2)",
              backgroundColor: "rgba(0, 113, 227, 0.06)",
              color: "#0071E3",
              fontSize: 11.5,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <X size={12} />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : activeTab === "all" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {filteredMeetings.map((meeting) => {
            const isSelected = selectedMeetingId === meeting.id;
            const persona = PERSONA_CONFIGS[meeting.persona] || PERSONA_CONFIGS.general;

            return (
              <div
                key={meeting.id}
                onClick={() => onSelectMeeting(meeting)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: 8,
                  backgroundColor: isSelected ? "rgba(0, 113, 227, 0.08)" : "#FFFFFF",
                  border: `1px solid ${isSelected ? "rgba(0, 113, 227, 0.25)" : "rgba(0, 0, 0, 0.05)"}`,
                  cursor: "pointer",
                  transition: "background-color 120ms cubic-bezier(0.2, 0, 0, 1), border-color 120ms ease",
                  gap: 12,
                }}
                className="group/item"
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = "#F8F9FB";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = "#FFFFFF";
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: isSelected ? "#0071E3" : "#1D1D1F",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      marginBottom: 2,
                    }}
                  >
                    {meeting.title}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: "#86868B",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span style={{ fontWeight: 550, color: isSelected ? "#0071E3" : "#475569" }}>
                      {persona.label}
                    </span>
                    <span>&bull;</span>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 300 }}>
                      {meeting.summary}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexShrink: 0,
                    fontSize: 11,
                    color: "#86868B",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  <span style={{ fontWeight: 500 }}>
                    {new Date(meeting.date).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span>&bull;</span>
                  <span>{meeting.duration}</span>
                  <ChevronRight size={12} color="#86868B" style={{ opacity: isSelected ? 1 : 0.6 }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : activeTab === "action_items" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filteredMeetings.map((meeting) =>
            meeting.actionItems?.map((item, idx) => {
              const text = typeof item === "string" ? item : item.text;
              const completed = typeof item === "string" ? false : item.completed;
              const assignee = typeof item === "string" ? undefined : item.assignee;

              return (
                <div
                  key={`${meeting.id}-${idx}`}
                  onClick={() => onSelectMeeting(meeting)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: 8,
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(0, 0, 0, 0.05)",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8F9FB")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FFFFFF")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1, marginRight: 8 }}>
                    <CheckSquare size={13} color={completed ? "#10B981" : "#86868B"} />
                    <span style={{ color: completed ? "#86868B" : "#1D1D1F", textDecoration: completed ? "line-through" : "none" }}>
                      {text}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    {assignee && (
                      <span style={{ fontSize: 10.5, color: "#0071E3", backgroundColor: "rgba(0, 113, 227, 0.08)", padding: "1px 5px", borderRadius: 4, fontWeight: 600 }}>
                        @{assignee}
                      </span>
                    )}
                    <span style={{ fontSize: 10.5, color: "#86868B" }}>{meeting.title.slice(0, 20)}...</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filteredMeetings.map((meeting) =>
            meeting.keyPoints?.map((kp, idx) => {
              const decision = typeof kp === "string" ? kp : kp.decision;
              const rationale = typeof kp === "string" ? null : kp.rationale;

              return (
                <div
                  key={`${meeting.id}-dec-${idx}`}
                  onClick={() => onSelectMeeting(meeting)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                    padding: "8px 12px",
                    borderRadius: 8,
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(0, 0, 0, 0.05)",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8F9FB")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FFFFFF")}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "#1D1D1F" }}>
                      <Sparkles size={12} color="#8B5CF6" />
                      <span>{decision}</span>
                    </div>
                    <span style={{ fontSize: 10.5, color: "#86868B" }}>{meeting.title.slice(0, 20)}...</span>
                  </div>
                  {rationale && <span style={{ fontSize: 11, color: "#64748B", paddingLeft: 18 }}>Rationale: {rationale}</span>}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
