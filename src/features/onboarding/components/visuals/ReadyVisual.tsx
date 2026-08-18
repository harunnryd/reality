import * as React from "react";
import { Card, Flex, Box, Text, Badge } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { Sparkles, MessageSquare } from "lucide-react";
import { RealityLogo } from "@/components/RealityLogo";

export const ReadyVisual: React.FC = () => {
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
        <Flex align="center" justify="between" style={{ marginBottom: 12 }}>
          <Flex align="center" gap="2">
            <RealityLogo size={24} variant="icon" />
            <Box>
              <Text as="div" size="1" weight="bold" style={{ color: "var(--gray-12)" }}>
                Reality Live HUD
              </Text>
              <Text as="div" size="1" style={{ color: "var(--gray-10)", fontSize: 10 }}>
                Active Meeting Companion
              </Text>
            </Box>
          </Flex>

          <Badge size="1" color="green" variant="soft">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "var(--green-9)",
                marginRight: 4,
              }}
            />
            Listening
          </Badge>
        </Flex>

        <Box
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            backgroundColor: "var(--gray-2)",
            border: "1px solid var(--gray-4)",
            marginBottom: 8,
          }}
        >
          <Flex align="center" gap="1" style={{ marginBottom: 3 }}>
            <MessageSquare size={11} color="var(--gray-10)" />
            <Text size="1" style={{ color: "var(--gray-10)", fontSize: 10 }}>
              Live Speech • 2s ago
            </Text>
          </Flex>
          <Text size="1" style={{ color: "var(--gray-12)", lineHeight: 1.35, fontSize: 12 }}>
            &ldquo;How do we optimize PostgreSQL queries for high traffic?&rdquo;
          </Text>
        </Box>

        <Box
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            backgroundColor: "var(--blue-2)",
            border: "1px solid var(--blue-5)",
          }}
        >
          <Flex align="center" gap="1" style={{ marginBottom: 3 }}>
            <Sparkles size={11} color="var(--blue-9)" />
            <Text size="1" weight="medium" style={{ color: "var(--blue-11)", fontSize: 10 }}>
              Reality Instant Insight
            </Text>
          </Flex>
          <Text size="1" style={{ color: "var(--blue-12)", lineHeight: 1.35, fontSize: 12 }}>
            Add composite B-Tree indexes on filtered columns and enable PgBouncer pool.
          </Text>
        </Box>
      </Card>

      <Card
        size="1"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(12px)",
          borderRadius: 12,
          padding: "10px 14px",
          border: "1px solid var(--gray-4)",
        }}
      >
        <Flex align="center" justify="between">
          <Text size="1" style={{ color: "var(--gray-10)", fontSize: 11 }}>
            Summon anytime
          </Text>
          <Text size="1" weight="bold" style={{ color: "var(--gray-12)", fontSize: 11 }}>
            ⌘ Shift Space
          </Text>
        </Flex>
      </Card>
    </Flex>
  );
};
