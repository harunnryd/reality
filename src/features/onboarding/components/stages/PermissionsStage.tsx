import * as React from "react";
import { Flex, Box, Heading, Text, Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { Mic, Monitor, ArrowRight, ExternalLink } from "lucide-react";
import { PermissionRow } from "@/features/onboarding/components/PermissionRow";
import { containerVariants, itemVariants } from "@/styles/animations";
import { typography } from "@/styles/theme";
import type { usePermissionsState } from "@/features/onboarding/hooks/usePermissionsState";

export interface PermissionsStageProps {
  permissionsManager: ReturnType<typeof usePermissionsState>;
  onContinue: () => void;
}

export const PermissionsStage: React.FC<PermissionsStageProps> = ({
  permissionsManager,
  onContinue,
}) => {
  const {
    permissions,
    isRequesting,
    requestMicrophone,
    requestScreenRecording,
    openScreenSettings,
  } = permissionsManager;

  const isMicGranted = permissions.microphone === "granted";
  const isScreenGranted = permissions.screen_recording === "granted";

  const handleScreenToggle = () => {
    if (permissions.screen_recording === "denied") {
      void openScreenSettings();
    } else {
      void requestScreenRecording();
    }
  };

  const getButtonConfig = () => {
    if (!isMicGranted) {
      return {
        label: isRequesting ? "Requesting access…" : "Allow Microphone Access",
        action: requestMicrophone,
        icon: <Mic size={14} />,
      };
    }
    if (!isScreenGranted) {
      if (permissions.screen_recording === "denied") {
        return {
          label: "Open Screen Recording Settings",
          action: openScreenSettings,
          icon: <ExternalLink size={14} />,
        };
      }
      return {
        label: isRequesting ? "Requesting access…" : "Allow Screen Recording Access",
        action: requestScreenRecording,
        icon: <Monitor size={14} />,
      };
    }
    return {
      label: "Continue",
      action: onContinue,
      icon: <ArrowRight size={14} />,
    };
  };

  const btnConfig = getButtonConfig();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <Box>
        <motion.div variants={itemVariants}>
          <Heading
            as="h2"
            style={{
              ...typography.scale.titleLarge,
              marginBottom: 6,
              color: "var(--gray-12)",
            }}
          >
            Enable system access
          </Heading>
          <Text
            as="p"
            style={{
              ...typography.scale.bodyMedium,
              marginBottom: 20,
              color: "var(--gray-11)",
            }}
          >
            Reality needs microphone and screen capture permissions to transcribe speech and assist during meetings.
          </Text>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Flex direction="column" gap="2" style={{ marginBottom: 16 }}>
            <PermissionRow
              icon={<Mic size={17} strokeWidth={2} />}
              label="Microphone"
              description="Transcribe meeting audio in real time."
              checked={isMicGranted}
              onToggle={!isMicGranted ? requestMicrophone : () => {}}
              hasBadge={true}
            />

            <PermissionRow
              icon={<Monitor size={17} strokeWidth={2} />}
              label="Screen Recording"
              description="Read active windows, slides, and code."
              checked={isScreenGranted}
              onToggle={handleScreenToggle}
              hasBadge={true}
            />
          </Flex>
        </motion.div>
      </Box>

      <motion.div variants={itemVariants}>
        <Button
          size="2"
          variant="solid"
          color="gray"
          highContrast
          className="no-drag"
          onClick={btnConfig.action}
          disabled={isRequesting}
          style={{
            ...typography.scale.button,
            width: "100%",
            height: "36px",
            borderRadius: "8px",
            cursor: isRequesting ? "default" : "pointer",
            transition: "all 0.15s ease",
          }}
        >
          {btnConfig.label}
          {btnConfig.icon}
        </Button>
      </motion.div>
    </motion.div>
  );
};
