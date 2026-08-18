import * as React from "react";
import { Box } from "@radix-ui/themes";
import { AnimatePresence, motion } from "framer-motion";
import { LauncherHeader } from "./LauncherHeader";
import { HeroBanner } from "./HeroBanner";
import { FeatureSpotlight } from "./FeatureSpotlight";
import { UpcomingCalendarCard } from "./UpcomingCalendarCard";
import { MeetingList } from "./MeetingList";
import { MeetingDetailsView } from "./MeetingDetailsView";
import { UpcomingScheduleModal, CalendarEventItem } from "./UpcomingScheduleModal";
import { SettingsModal } from "./SettingsModal";
import { ProfileIntelligenceModal } from "./ProfileIntelligenceModal";
import { useLauncherState } from "../hooks/useLauncherState";
import { useWindowDrag, useGlobalShortcuts } from "@/hooks";
import { springEase } from "@/styles/theme";

export interface LauncherShellProps {
  onStartMeeting: () => void;
  onOpenSettings?: () => void;
}

export const LauncherShell: React.FC<LauncherShellProps> = ({
  onStartMeeting,
  onOpenSettings,
}) => {
  const {
    meetings,
    searchQuery,
    setSearchQuery,
    selectedPersona,
    setSelectedPersona,
    isStealthActive,
    setIsStealthActive,
    selectedMeeting,
    openMeetingDetail,
    closeMeetingDetail,
    deleteMeeting,
    refreshMeetings,
  } = useLauncherState();

  const [isScheduleModalOpen, setIsScheduleModalOpen] = React.useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const dragProps = useWindowDrag();
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  useGlobalShortcuts({
    onSearchFocus: () => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    },
    onEscape: () => {
      if (isProfileModalOpen) {
        setIsProfileModalOpen(false);
      } else if (isSettingsModalOpen) {
        setIsSettingsModalOpen(false);
      } else if (isScheduleModalOpen) {
        setIsScheduleModalOpen(false);
      } else if (selectedMeeting) {
        closeMeetingDetail();
      } else if (searchQuery) {
        setSearchQuery("");
      }
    },
    onStartMeeting: () => {
      if (!isSettingsModalOpen && !isScheduleModalOpen && !isProfileModalOpen && !selectedMeeting) {
        onStartMeeting();
      }
    },
  });

  const handleStartForEvent = (event: CalendarEventItem) => {
    setIsScheduleModalOpen(false);
    onStartMeeting();
  };

  const handleTriggerSettings = () => {
    setIsSettingsModalOpen(true);
    onOpenSettings?.();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <LauncherHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedPersona={selectedPersona}
        onSelectPersona={setSelectedPersona}
        onOpenSettings={handleTriggerSettings}
        onOpenProfileIntelligence={() => setIsProfileModalOpen(true)}
        searchRef={searchInputRef}
        selectedMeeting={selectedMeeting}
        onBack={closeMeetingDetail}
      />

      <Box style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <AnimatePresence mode="wait" initial={false}>
          {selectedMeeting ? (
            <motion.div
              key={`detail_${selectedMeeting.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18, ease: springEase }}
              style={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <MeetingDetailsView
                meeting={selectedMeeting}
                onBack={closeMeetingDetail}
                onDelete={deleteMeeting}
              />
            </motion.div>
          ) : (
            <motion.div
              key="main_dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                height: "100%",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#FAFAFA",
              }}
            >
              <div
                style={{
                  padding: "16px 20px 0 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <HeroBanner
                  onStartMeeting={onStartMeeting}
                  isStealthActive={isStealthActive}
                  onToggleStealth={() => setIsStealthActive(!isStealthActive)}
                  onRefresh={refreshMeetings}
                  selectedPersona={selectedPersona}
                  onOpenSchedule={() => setIsScheduleModalOpen(true)}
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <FeatureSpotlight />
                  <UpcomingCalendarCard
                    onJoinMeeting={onStartMeeting}
                    onOpenSchedule={() => setIsScheduleModalOpen(true)}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: "16px 20px 32px 20px",
                  boxSizing: "border-box",
                  backgroundColor: "#FAFAFA",
                }}
              >
                <MeetingList
                  meetings={meetings}
                  onSelectMeeting={openMeetingDetail}
                  onDeleteMeeting={deleteMeeting}
                  onStartMeeting={onStartMeeting}
                  onRefresh={refreshMeetings}
                  isSearching={Boolean(searchQuery.trim())}
                  searchQuery={searchQuery}
                  onClearSearch={() => setSearchQuery("")}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      <UpcomingScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onStartMeetingForEvent={handleStartForEvent}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <ProfileIntelligenceModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};
