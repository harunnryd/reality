import * as React from "react";
import { Flex, Box, Heading, Text, TextField, Button, Callout } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { Key, Lock, ArrowRight, AlertCircle, ExternalLink, ShieldCheck, Mic, Sparkles } from "lucide-react";
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
              Connect Speech &amp; AI
            </Heading>
            <Text
              as="p"
              style={{
                ...typography.scale.bodyMedium,
                marginBottom: 14,
                color: "var(--gray-11)",
              }}
            >
              Configure ultra-fast live speech transcription and meeting AI reasoning.
            </Text>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Flex direction="column" gap="3">
              <Box>
                <Flex align="center" justify="between" style={{ marginBottom: 4 }}>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--gray-11)",
                      textTransform: "uppercase",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Mic size={12} color="#0071E3" />
                    Deepgram Nova-2 API Key
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
                      gap: 3,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    <span>Get $200 Free</span>
                    <ExternalLink size={11} />
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
                  Powers real-time speech transcription (&lt;180ms p99)
                </Text>
              </Box>

              <Box>
                <Flex align="center" justify="between" style={{ marginBottom: 4 }}>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--gray-11)",
                      textTransform: "uppercase",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Sparkles size={12} color="#8E8E93" />
                    OpenAI / Anthropic Key
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
                      gap: 3,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    <span>Get OpenAI Key</span>
                    <ExternalLink size={11} />
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
                    Encrypted inside macOS Keychain
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
                Skip for later
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
              {isSaving ? "Connecting…" : "Continue"}
              <ArrowRight size={14} />
            </Button>
          </Flex>
        </motion.div>
      </form>
    </motion.div>
  );
};
