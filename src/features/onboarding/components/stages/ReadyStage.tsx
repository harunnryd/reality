import * as React from "react";
import { Flex, Box, Heading, Text, Card, Kbd, Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { Zap, MessageSquare, ArrowRight } from "lucide-react";
import { containerVariants, itemVariants } from "@/styles/animations";
import { typography } from "@/styles/theme";

export interface ReadyStageProps {
  onComplete: () => Promise<void> | void;
}

export const ReadyStage: React.FC<ReadyStageProps> = ({ onComplete }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      await onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

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
            You're all set!
          </Heading>
          <Text
            as="p"
            style={{
              ...typography.scale.bodyMedium,
              marginBottom: 20,
              color: "var(--gray-11)",
            }}
          >
            Reality runs quietly in the background during your meetings. Use global shortcuts to interact.
          </Text>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Flex direction="column" gap="2">
            <Card size="2">
              <Flex align="center" justify="between">
                <Flex align="center" gap="2">
                  <Zap size={15} color="var(--blue-9)" />
                  <Text style={{ ...typography.scale.bodyMedium, fontWeight: 500 }}>
                    Toggle Overlay
                  </Text>
                </Flex>
                <Flex gap="1">
                  <Kbd size="2">⌘</Kbd>
                  <Kbd size="2">Shift</Kbd>
                  <Kbd size="2">Space</Kbd>
                </Flex>
              </Flex>
            </Card>

            <Card size="2">
              <Flex align="center" justify="between">
                <Flex align="center" gap="2">
                  <MessageSquare size={15} color="var(--green-9)" />
                  <Text style={{ ...typography.scale.bodyMedium, fontWeight: 500 }}>
                    Ask Assistant
                  </Text>
                </Flex>
                <Flex gap="1">
                  <Kbd size="2">Enter</Kbd>
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </motion.div>
      </Box>

      <motion.div variants={itemVariants}>
        <Button
          size="2"
          variant="solid"
          color="gray"
          highContrast
          loading={isSubmitting}
          onClick={handleLaunch}
          style={{
            ...typography.scale.button,
            width: "100%",
            height: "36px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Start using Reality
          <ArrowRight size={14} />
        </Button>
      </motion.div>
    </motion.div>
  );
};
