import * as React from "react";
import { Card, Flex, Box, Text, Badge } from "@radix-ui/themes";
import { ShieldCheck, Radio, Sparkles } from "lucide-react";

export const ApiKeyVisual: React.FC = () => {
  return (
    <Flex
      direction="column"
      gap="3"
      style={{
        width: "100%",
        maxWidth: 300,
        userSelect: "none",
        margin: "auto 0",
      }}
    >
      <Card
        size="2"
        style={{
          backgroundColor: "#FFFFFF",
          boxShadow: "0 8px 20px -6px rgba(0, 0, 0, 0.05)",
          borderRadius: 12,
          padding: "14px 16px",
          border: "1px solid var(--gray-4)",
        }}
      >
        <Flex align="center" justify="between">
          <Flex align="center" gap="3">
            <Box
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: "rgba(0, 113, 227, 0.1)",
                color: "#0071E3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Radio size={16} />
            </Box>
            <Box>
              <Text as="div" size="2" weight="bold" style={{ color: "var(--gray-12)", lineHeight: 1.2 }}>
                Deepgram Nova-2
              </Text>
              <Text as="div" size="1" style={{ color: "var(--gray-10)", marginTop: 2 }}>
                Live speech-to-text
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
          boxShadow: "0 8px 20px -6px rgba(0, 0, 0, 0.05)",
          borderRadius: 12,
          padding: "14px 16px",
          border: "1px solid var(--gray-4)",
        }}
      >
        <Flex align="center" justify="between">
          <Flex align="center" gap="3">
            <Box
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: "var(--green-3)",
                color: "var(--green-9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck size={16} />
            </Box>
            <Box>
              <Text as="div" size="2" weight="bold" style={{ color: "var(--gray-12)", lineHeight: 1.2 }}>
                macOS Keychain
              </Text>
              <Text as="div" size="1" style={{ color: "var(--gray-10)", marginTop: 2 }}>
                Hardware encrypted
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
          backgroundColor: "rgba(255, 255, 255, 0.75)",
          borderRadius: 10,
          padding: "10px 14px",
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
              Direct BYOK
            </Text>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
};
