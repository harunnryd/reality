import { useState, useEffect, useMemo, useCallback } from "react";
import { Meeting, PersonaMode } from "../types";
import { meetingsService } from "../services/meetingsService";

export function useLauncherState() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<PersonaMode>("general");
  const [isStealthActive, setIsStealthActive] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadMeetings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await meetingsService.getMeetings();
      setMeetings(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMeetings();
  }, [loadMeetings]);

  const filteredMeetings = useMemo(() => {
    if (!searchQuery.trim()) {
      return meetings;
    }
    const q = searchQuery.toLowerCase();
    return meetings.filter((m) => {
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchSummary = m.summary.toLowerCase().includes(q);
      const matchObjective = m.objective?.toLowerCase().includes(q);
      const matchConsensus = m.consensus?.toLowerCase().includes(q);
      const matchAction = m.actionItems.some((a) =>
        typeof a === "string" ? a.toLowerCase().includes(q) : a.text.toLowerCase().includes(q)
      );
      const matchKeyPoints = m.keyPoints.some((k) =>
        typeof k === "string"
          ? k.toLowerCase().includes(q)
          : k.decision.toLowerCase().includes(q) || k.rationale?.toLowerCase().includes(q)
      );
      return matchTitle || matchSummary || matchObjective || matchConsensus || matchAction || matchKeyPoints;
    });
  }, [meetings, searchQuery]);

  const openMeetingDetail = useCallback((meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsDetailModalOpen(true);
  }, []);

  const closeMeetingDetail = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedMeeting(null);
  }, []);

  const deleteMeeting = useCallback(
    async (id: string) => {
      await meetingsService.deleteMeeting(id);
      setMeetings((prev) => prev.filter((m) => m.id !== id));
      if (selectedMeeting?.id === id) {
        closeMeetingDetail();
      }
    },
    [selectedMeeting, closeMeetingDetail]
  );

  return {
    meetings: filteredMeetings,
    rawMeetings: meetings,
    searchQuery,
    setSearchQuery,
    selectedPersona,
    setSelectedPersona,
    isStealthActive,
    setIsStealthActive,
    selectedMeeting,
    isDetailModalOpen,
    openMeetingDetail,
    closeMeetingDetail,
    deleteMeeting,
    isLoading,
    refreshMeetings: loadMeetings,
  };
}
