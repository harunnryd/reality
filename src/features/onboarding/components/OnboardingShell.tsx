import * as React from "react";
import { Flex, Box, Button } from "@radix-ui/themes";
import { AnimatePresence } from "framer-motion";
import { PermissionsStage } from "@/features/onboarding/components/stages/PermissionsStage";
import { ApiKeyStage } from "@/features/onboarding/components/stages/ApiKeyStage";
import { ReadyStage } from "@/features/onboarding/components/stages/ReadyStage";
import { VisualGuidePanel } from "@/features/onboarding/components/visuals/VisualGuidePanel";
import { useOnboardingMachine } from "@/features/onboarding/hooks/useOnboardingMachine";
import { WindowControls } from "@/components/WindowControls";
import { useWindowDrag } from "@/hooks/useWindowDrag";
import { colors, typography } from "@/styles/theme";

export interface OnboardingShellProps {
  onComplete: () => void;
}

export const OnboardingShell: React.FC<OnboardingShellProps> = ({ onComplete }) => {
  const {
    state,
    permissionsManager,
    goToStage,
    saveKeys,
    completeOnboarding,
  } = useOnboardingMachine();

  const dragProps = useWindowDrag();

  const [isWide, setIsWide] = React.useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 600;
    }
    return false;
  });

  React.useEffect(() => {
    const handleResize = () => {
      setIsWide(window.innerWidth >= 600);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    if (state.stage === "done") {
      onComplete();
    }
  }, [state.stage, onComplete]);

  if (state.isLoading || state.stage === "done") {
    return null;
  }

  const handleSkip = () => {
    void completeOnboarding();
  };

  return (
    <div
      {...dragProps}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: colors.windowBackground,
        color: "var(--gray-12)",
        borderRadius: 14,
        boxShadow: colors.windowShadow,
        display: "flex",
        fontFamily: typography.fontFamily,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <Box
        style={{
          flex: isWide ? "1 1 50%" : "1 1 100%",
          width: isWide ? "50%" : "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: isWide ? "24px 28px" : "20px 24px",
          borderRight: isWide ? "1px solid var(--gray-4)" : "none",
          overflowY: "auto",
          boxSizing: "border-box",
          backgroundColor: colors.windowBackground,
        }}
      >
        <Flex
          align="center"
          justify="between"
          style={{ marginBottom: 20, cursor: "grab" }}
        >
          <div className="no-drag">
            <WindowControls />
          </div>

          <Button
            size="1"
            variant="ghost"
            color="gray"
            onClick={handleSkip}
            style={{ cursor: "pointer", color: "var(--gray-10)", fontSize: 12 }}
          >
            Skip
          </Button>
        </Flex>

        <Box style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 340 }}>
          <AnimatePresence mode="wait">
            {state.stage === "permissions" && (
              <PermissionsStage
                key="permissions"
                permissionsManager={permissionsManager}
                onContinue={() => goToStage("api_key")}
              />
            )}

            {state.stage === "api_key" && (
              <ApiKeyStage
                key="api_key"
                apiKey={state.apiKey}
                deepgramApiKey={state.deepgramApiKey}
                isSaving={state.apiKeySaving}
                error={state.apiKeyError}
                onSave={(openAiKey, deepgramKey) => saveKeys(openAiKey, deepgramKey)}
                onBack={() => goToStage("permissions")}
                onSkip={handleSkip}
              />
            )}

            {state.stage === "ready" && (
              <ReadyStage
                key="ready"
                onComplete={completeOnboarding}
              />
            )}
          </AnimatePresence>
        </Box>

        <Flex align="center" justify="center" gap="1" style={{ marginTop: 14 }}>
          {(["permissions", "api_key", "ready"] as const).map((s) => (
            <div
              key={s}
              style={{
                width: state.stage === s ? 14 : 5,
                height: 4,
                borderRadius: 2,
                backgroundColor: state.stage === s ? "var(--gray-12)" : "var(--gray-5)",
                transition: "all 200ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          ))}
        </Flex>
      </Box>

      {isWide && (
        <Box
          style={{
            flex: "1 1 50%",
            width: "50%",
            display: "flex",
            height: "100%",
          }}
        >
          <VisualGuidePanel
            stage={state.stage}
            permissionsManager={permissionsManager}
          />
        </Box>
      )}
    </div>
  );
};
