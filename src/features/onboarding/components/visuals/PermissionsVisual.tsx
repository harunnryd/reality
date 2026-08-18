import * as React from "react";
import { Card, Flex, Box, Text, Button } from "@radix-ui/themes";
import { Shield } from "lucide-react";
import { RealityLogo } from "@/components/RealityLogo";
import type { usePermissionsState } from "@/features/onboarding/hooks/usePermissionsState";

export interface PermissionsVisualProps {
  permissionsManager: ReturnType<typeof usePermissionsState>;
}

export const PermissionsVisual: React.FC<PermissionsVisualProps> = ({ permissionsManager }) => {
  const { permissions, requestScreenRecording, openScreenSettings } = permissionsManager;
  const isScreenGranted = permissions.screen_recording === "granted";

  return (
    <Flex direction="column" gap="4" style={{ width: "100%", maxWidth: 340, userSelect: "none" }}>
      <Card
        size="2"
        style={{
          backgroundColor: "#FFFFFF",
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)",
          borderRadius: 14,
          padding: 16,
          border: "1px solid var(--gray-4)",
        }}
      >
        <Flex gap="3" align="start">
          <Box style={{ position: "relative", flexShrink: 0 }}>
            <RealityLogo size={38} variant="icon" />
            <Box
              style={{
                position: "absolute",
                bottom: -2,
                right: -2,
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: isScreenGranted ? "var(--green-9)" : "var(--red-9)",
                border: "2px solid #FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#FFFFFF" }} />
            </Box>
          </Box>

          <Box style={{ flex: 1 }}>
            <Text
              as="div"
              size="2"
              weight="bold"
              style={{ color: "var(--gray-12)", lineHeight: 1.3, marginBottom: 4 }}
            >
              &ldquo;Reality&rdquo; would like to record this screen and audio
            </Text>
            <Text as="div" size="1" style={{ color: "var(--gray-10)", lineHeight: 1.4 }}>
              Grant access in Privacy &amp; Security to enable live meeting transcription.
            </Text>
          </Box>
        </Flex>

        <Flex justify="end" gap="2" style={{ marginTop: 14 }}>
          <Button
            size="1"
            variant="soft"
            color="gray"
            onClick={openScreenSettings}
            style={{ cursor: "pointer", fontSize: 11 }}
          >
            Open Settings
          </Button>
          <Button
            size="1"
            variant="solid"
            color="blue"
            onClick={requestScreenRecording}
            style={{ cursor: "pointer", fontSize: 11 }}
          >
            Allow Access
          </Button>
        </Flex>
      </Card>

      <Card
        size="1"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(12px)",
          borderRadius: 12,
          padding: "12px 14px",
          border: "1px solid var(--gray-4)",
        }}
      >
        <Flex direction="column" gap="2">
          <Flex align="center" gap="2">
            <Shield size={14} color="var(--green-9)" />
            <Text size="1" weight="medium" style={{ color: "var(--gray-12)" }}>
              On-Device Audio Buffer
            </Text>
          </Flex>
          <Text size="1" style={{ color: "var(--gray-10)", lineHeight: 1.35, fontSize: 11 }}>
            Audio and screen streams are processed in memory and never stored on third-party servers.
          </Text>
        </Flex>
      </Card>
    </Flex>
  );
};
