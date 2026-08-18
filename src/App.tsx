import { useState } from "react";
import { Onboarding } from "@/features/onboarding";
import { LauncherShell } from "@/features/launcher";
import { MeetingHudShell } from "@/features/meeting_hud";
import { meetingsService } from "@/features/launcher/services/meetingsService";
import { Meeting } from "@/features/launcher/types";

export default function App() {
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [activeView, setActiveView] = useState<"launcher" | "meeting_hud" | "settings">("launcher");
  const [activeMeetingConfig, setActiveMeetingConfig] = useState<{ title?: string } | undefined>(undefined);

  const handleStartMeeting = (config?: { title?: string }) => {
    setActiveMeetingConfig(config);
    setActiveView("meeting_hud");
  };

  const handleFinishMeeting = async (finishedMeeting: Meeting) => {
    await meetingsService.saveMeeting(finishedMeeting);
    setActiveView("launcher");
  };

  const handleOpenSettings = () => {
    console.log("Opening Settings...");
  };

  if (!onboardingDone) {
    return (
      <main style={{ height: "100vh", boxSizing: "border-box", backgroundColor: "#FFFFFF" }}>
        <Onboarding onComplete={() => setOnboardingDone(true)} />
      </main>
    );
  }

  return (
    <main style={{ height: "100vh", boxSizing: "border-box", backgroundColor: "transparent" }}>
      {activeView === "launcher" && (
        <LauncherShell
          onStartMeeting={handleStartMeeting}
          onOpenSettings={handleOpenSettings}
        />
      )}

      {activeView === "meeting_hud" && (
        <MeetingHudShell
          config={activeMeetingConfig}
          onFinishMeeting={handleFinishMeeting}
        />
      )}
    </main>
  );
}
