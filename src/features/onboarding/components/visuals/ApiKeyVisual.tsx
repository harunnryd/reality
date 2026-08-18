import * as React from "react";
import { Card, Flex, Box, Text, Badge } from "@radix-ui/themes";
import { ShieldCheck, Radio, Sparkles } from "lucide-react";

export const ApiKeyVisual: React.FC = () => {
  return (
    <Flex direction="column" gap="3" style={{ width: "100%", maxWidth: 320, userSelect: "none" }}>
      <Card
        size="2"
        style={{
          backgroundColor: "#FFFFFF",
          boxShadow: "0 12px 24px -8px rgba(0, 0, 0, 0.06)",
          borderRadius: 12,
          padding: 14,
          border: "1px solid var(--gray-4)",
        }}
      >
        <Flex align="center" justify="between">
          <Flex align="center" gap="2">
            <Box
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                backgroundColor: "rgba(0, 113, 227, 0.1)",
                color: "#0071E3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Radio size={14} />
            </Box>
            <Box>
              <Text as="div" size="2" weight="bold" style={{ color: "var(--gray-12)" }}>
                Deepgram Nova-2
              </Text>
              <Text as="div" size="1" style={{ color: "var(--gray-10)" }}>
                Live streaming speech-to-text
              </Text>
            </Box>
          </Flex>

          <Badge size="1" color="blue" variant="surface">
            Live
          </Badge>
        </Flex>
      </Card>

      <Card
        size="2"
        style={{
          backgroundColor: "#FFFFFF",
          boxShadow: "0 12px 24px -8px rgba(0, 0, 0, 0.06)",
          borderRadius: 12,
          padding: 14,
          border: "1px solid var(--gray-4)",
        }}
      >
        <Flex align="center" justify="between">
          <Flex align="center" gap="2">
            <Box
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                backgroundColor: "var(--green-3)",
                color: "var(--green-9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck size={14} />
            </Box>
            <Box>
              <Text as="div" size="2" weight="bold" style={{ color: "var(--gray-12)" }}>
                macOS Keychain
              </Text>
              <Text as="div" size="1" style={{ color: "var(--gray-10)" }}>
                Hardware encrypted local storage
              </Text>
            </Box>
          </Flex>

          <Badge size="1" color="green" variant="soft">
            Secure
          </Badge>
        </Flex>
      </Card>

      <Card
        size="1"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: 10,
          padding: "10px 12px",
          border: "1px solid var(--gray-4)",
        }}
      >
        <Flex align="center" justify="between">
          <Text size="1" color="gray">
            Zero cloud proxy
          </Text>
          <Flex align="center" gap="1">
            <Sparkles size={11} color="var(--gray-10)" />
            <Text size="1" color="gray">
              Direct BYOK inference
            </Text>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
};
