import * as React from "react";
import { Flex, Box, Heading, Text, TextField, Button, Callout } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { Key, Lock, ArrowRight, AlertCircle, ExternalLink, ShieldCheck } from "lucide-react";
import { containerVariants, itemVariants } from "@/styles/animations";
import { typography } from "@/styles/theme";

export interface ApiKeyStageProps {
  apiKey: string;
  isSaving: boolean;
  error: string | null;
  onSave: (key: string) => Promise<void> | void;
  onBack: () => void;
}

export const ApiKeyStage: React.FC<ApiKeyStageProps> = ({
  apiKey,
  isSaving,
  error,
  onSave,
  onBack,
}) => {
  const [key, setKey] = React.useState(apiKey);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || isSaving) return;
    void onSave(key.trim());
  };

  const handleOpenConsole = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open("https://platform.openai.com/api-keys", "_blank");
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
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "space-between",
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
              Connect OpenAI
            </Heading>
            <Text
              as="p"
              style={{
                ...typography.scale.bodyMedium,
                marginBottom: 18,
                color: "var(--gray-11)",
              }}
            >
              Enter your OpenAI API key for speech transcription and screen reasoning.
            </Text>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Flex direction="column" gap="3">
              <TextField.Root
                size="2"
                type="password"
                placeholder="sk-proj-..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                disabled={isSaving}
                autoFocus
                style={{
                  ...typography.scale.bodyMedium,
                  height: "38px",
                  borderRadius: "8px",
                }}
              >
                <TextField.Slot>
                  <Key size={15} />
                </TextField.Slot>
                <TextField.Slot side="right">
                  <Lock size={13} />
                </TextField.Slot>
              </TextField.Root>

              {error && (
                <Callout.Root color="red" size="1" style={{ padding: "6px 10px" }}>
                  <Callout.Icon>
                    <AlertCircle size={13} />
                  </Callout.Icon>
                  <Callout.Text style={{ ...typography.scale.caption }}>{error}</Callout.Text>
                </Callout.Root>
              )}

              <Flex direction="column" gap="1" style={{ marginTop: 2 }}>
                <Flex align="center" justify="between">
                  <span
                    style={{
                      ...typography.scale.bodySmall,
                      color: "var(--gray-10)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <ShieldCheck size={13} color="var(--gray-9)" />
                    Stored in macOS Keychain
                  </span>
                  <a
                    href="https://platform.openai.com/api-keys"
                    onClick={handleOpenConsole}
                    style={{
                      ...typography.scale.bodySmall,
                      color: "var(--blue-9)",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "3px",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                    }}
                  >
                    <span>Get API key</span>
                    <ExternalLink size={12} style={{ display: "inline-block", flexShrink: 0 }} />
                  </a>
                </Flex>
              </Flex>
            </Flex>
          </motion.div>
        </Box>

        <motion.div variants={itemVariants}>
          <Flex gap="2" style={{ marginTop: 16 }}>
            <Button
              type="button"
              size="2"
              variant="soft"
              color="gray"
              disabled={isSaving}
              onClick={onBack}
              style={{
                ...typography.scale.button,
                height: "36px",
                padding: "0 16px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Back
            </Button>

            <Button
              type="submit"
              size="2"
              variant="solid"
              color="gray"
              highContrast
              loading={isSaving}
              disabled={!key.trim() || isSaving}
              style={{
                ...typography.scale.button,
                flex: 1,
                height: "36px",
                borderRadius: "8px",
                cursor: !key.trim() || isSaving ? "default" : "pointer",
              }}
            >
              {isSaving ? "Verifying key…" : "Continue"}
              <ArrowRight size={14} />
            </Button>
          </Flex>
        </motion.div>
      </form>
    </motion.div>
  );
};
