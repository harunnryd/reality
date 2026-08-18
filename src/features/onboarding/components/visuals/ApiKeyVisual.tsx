import * as React from "react";
import { Card, Flex, Box, Text, Badge } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Cpu, Zap } from "lucide-react";

export const ApiKeyVisual: React.FC = () => {
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
              <ShieldCheck size={18} />
            </Box>
            <Box>
              <Text as="div" size="2" weight="bold" style={{ color: "var(--gray-12)" }}>
                Apple Keychain Vault
              </Text>
              <Text as="div" size="1" style={{ color: "var(--gray-10)" }}>
                AES-256-GCM Hardware Encrypted
              </Text>
            </Box>
          </Flex>

          <Badge size="1" color="green" variant="surface">
            Encrypted
          </Badge>
        </Flex>

        <Box
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            backgroundColor: "var(--gray-2)",
            border: "1px solid var(--gray-4)",
            marginTop: 8,
          }}
        >
          <Flex align="center" justify="between" style={{ marginBottom: 6 }}>
            <Flex align="center" gap="2">
              <Cpu size={14} color="var(--blue-9)" />
              <Text size="1" weight="medium" style={{ color: "var(--gray-12)" }}>
                Direct OpenAI Inference
              </Text>
            </Flex>
            <Badge size="1" color="blue" variant="soft">
              BYOK
            </Badge>
          </Flex>

          <Box
            style={{
              height: 4,
              borderRadius: 2,
              backgroundColor: "var(--gray-4)",
              overflow: "hidden",
              position: "relative",
              marginTop: 8,
            }}
          >
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              style={{
                width: "40%",
                height: "100%",
                borderRadius: 2,
                backgroundColor: "var(--blue-9)",
              }}
            />
          </Box>
        </Box>
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
        <Flex align="center" justify="between">
          <Flex align="center" gap="1">
            <Zap size={13} color="var(--amber-9)" />
            <Text size="1" weight="medium" style={{ color: "var(--gray-12)" }}>
              Latency: &lt;350ms
            </Text>
          </Flex>
          <Flex align="center" gap="1">
            <Lock size={13} color="var(--gray-10)" />
            <Text size="1" style={{ color: "var(--gray-10)" }}>
              Zero Middleman Proxy
            </Text>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
};
