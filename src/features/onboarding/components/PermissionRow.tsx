import * as React from "react";
import { Card, Flex, Box, Text, Switch } from "@radix-ui/themes";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { itemVariants } from "@/styles/animations";
import { springTransitions, typography } from "@/styles/theme";

export interface PermissionRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  hasBadge?: boolean;
}

export const PermissionRow: React.FC<PermissionRowProps> = ({
  icon,
  label,
  description,
  checked,
  onToggle,
  disabled = false,
  hasBadge = true,
}) => {
  const reduced = useReducedMotion();

  return (
    <motion.div
      variants={itemVariants}
      whileHover={!disabled && !reduced ? { scale: 1.004 } : {}}
      whileTap={!disabled && !reduced ? { scale: 0.99 } : {}}
      transition={springTransitions.apple}
    >
      <Card
        size="2"
        onClick={!disabled ? onToggle : undefined}
        style={{
          cursor: disabled ? "not-allowed" : "pointer",
          userSelect: "none",
          transition: "border-color 150ms ease, box-shadow 150ms ease",
        }}
      >
        <Flex align="center" justify="between" gap="3">
          <Flex align="center" gap="3" style={{ minWidth: 0, flex: 1 }}>
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: checked ? "var(--green-3)" : "var(--gray-3)",
                border: `1px solid ${checked ? "var(--green-6)" : "var(--gray-5)"}`,
                color: checked ? "var(--green-11)" : "var(--gray-11)",
                position: "relative",
                transition: "background-color 150ms ease, border-color 150ms ease",
              }}
            >
              {icon}

              {hasBadge && checked && (
                <Box
                  style={{
                    position: "absolute",
                    bottom: -2,
                    right: -2,
                    width: 13,
                    height: 13,
                    borderRadius: "50%",
                    backgroundColor: "var(--green-9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid var(--color-background, #fff)",
                  }}
                >
                  <Check size={8} strokeWidth={4} color="#FFFFFF" />
                </Box>
              )}
            </Box>

            <Box style={{ minWidth: 0, flex: 1 }}>
              <Text
                as="div"
                style={{
                  ...typography.scale.bodyMedium,
                  fontWeight: 500,
                  color: "var(--gray-12)",
                }}
              >
                {label}
              </Text>
              <Text
                as="div"
                style={{
                  ...typography.scale.bodySmall,
                  lineHeight: 1.4,
                  color: "var(--gray-11)",
                }}
              >
                {description}
              </Text>
            </Box>
          </Flex>

          <Box onClick={(e) => e.stopPropagation()}>
            <Switch
              size="2"
              checked={checked}
              onCheckedChange={onToggle}
              disabled={disabled}
              aria-label={label}
            />
          </Box>
        </Flex>
      </Card>
    </motion.div>
  );
};
