import * as React from "react";
import { Flex, Box, Heading, Text, TextField, Button, Callout } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { Key, Lock, ArrowRight, AlertCircle, ExternalLink, ShieldCheck } from "lucide-react";
import { containerVariants, itemVariants } from "@/styles/animations";
import { typography } from "@/styles/theme";

export interface ApiKeyStageProps {
  apiKey: string;
  deepgramApiKey?: string;
  isSaving: boolean;
  error: string | null;
  onSave: (openaiKey: string, deepgramKey: string) => Promise<void> | void;
  onBack: () => void;
  onSkip?: () => void;
}

export const ApiKeyStage: React.FC<ApiKeyStageProps> = ({
  apiKey,
  deepgramApiKey = "",
  isSaving,
  error,
  onSave,
  onBack,
  onSkip,
}) => {
  const [openAiKey, setOpenAiKey] = React.useState(apiKey);
  const [deepgramKey, setDeepgramKey] = React.useState(deepgramApiKey);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    void onSave(openAiKey.trim(), deepgramKey.trim());
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
                marginBottom: 4,
                color: "var(--gray-12)",
              }}
            >
              API Keys
            </Heading>
            <Text
              as="p"
              style={{
                ...typography.scale.bodyMedium,
                marginBottom: 16,
                color: "var(--gray-11)",
              }}
            >
              Set up your keys for live speech transcription and AI assistant.
            </Text>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Flex direction="column" gap="3">
              <Box>
                <Flex align="center" justify="between" style={{ marginBottom: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--gray-11)" }}>
                    DEEPGRAM API KEY
                  </label>
                  <a
                    href="https://console.deepgram.com/signup"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 11,
                      color: "var(--blue-9)",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 2,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    <span>Get key</span>
                    <ExternalLink size={10} />
                  </a>
                </Flex>
                <TextField.Root
                  size="2"
                  type="password"
                  placeholder="8aa709d649248fe8d11eec..."
                  value={deepgramKey}
                  onChange={(e) => setDeepgramKey(e.target.value)}
                  disabled={isSaving}
                  autoFocus
                  style={{
                    ...typography.scale.bodyMedium,
                    height: "36px",
                    borderRadius: "8px",
                  }}
                >
                  <TextField.Slot>
                    <Key size={14} />
                  </TextField.Slot>
                </TextField.Root>
                <Text style={{ fontSize: 10.5, color: "var(--gray-10)", marginTop: 2, display: "block" }}>
                  Used for real-time speech transcription
                </Text>
              </Box>

              <Box>
                <Flex align="center" justify="between" style={{ marginBottom: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--gray-11)" }}>
                    OPENAI / ANTHROPIC KEY
                  </label>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 11,
                      color: "var(--blue-9)",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 2,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    <span>Get key</span>
                    <ExternalLink size={10} />
                  </a>
                </Flex>
                <TextField.Root
                  size="2"
                  type="password"
                  placeholder="sk-proj-... or sk-ant-..."
                  value={openAiKey}
                  onChange={(e) => setOpenAiKey(e.target.value)}
                  disabled={isSaving}
                  style={{
                    ...typography.scale.bodyMedium,
                    height: "36px",
                    borderRadius: "8px",
                  }}
                >
                  <TextField.Slot>
                    <Key size={14} />
                  </TextField.Slot>
                  <TextField.Slot side="right">
                    <Lock size={12} />
                  </TextField.Slot>
                </TextField.Root>
                <Flex align="center" gap="1" style={{ marginTop: 2 }}>
                  <ShieldCheck size={11} color="var(--gray-9)" />
                  <Text style={{ fontSize: 10.5, color: "var(--gray-10)" }}>
                    Stored securely in macOS Keychain
                  </Text>
                </Flex>
              </Box>

              {error && (
                <Callout.Root color="red" size="1" style={{ padding: "6px 10px" }}>
                  <Callout.Icon>
                    <AlertCircle size={13} />
                  </Callout.Icon>
                  <Callout.Text style={{ ...typography.scale.caption }}>{error}</Callout.Text>
                </Callout.Root>
              )}
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

            {onSkip && (
              <Button
                type="button"
                size="2"
                variant="ghost"
                color="gray"
                disabled={isSaving}
                onClick={onSkip}
                style={{
                  ...typography.scale.button,
                  height: "36px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Skip for now
              </Button>
            )}

            <Button
              type="submit"
              size="2"
              variant="solid"
              color="gray"
              highContrast
              loading={isSaving}
              style={{
                ...typography.scale.button,
                flex: 1,
                height: "36px",
                borderRadius: "8px",
                cursor: isSaving ? "default" : "pointer",
              }}
            >
              {isSaving ? "Saving…" : "Continue"}
              <ArrowRight size={14} />
            </Button>
          </Flex>
        </motion.div>
      </form>
    </motion.div>
  );
};
