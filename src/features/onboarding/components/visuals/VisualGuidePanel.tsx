import * as React from "react";
import { Box } from "@radix-ui/themes";
import { AnimatePresence, motion } from "framer-motion";
import { PermissionsVisual } from "./PermissionsVisual";
import { ApiKeyVisual } from "./ApiKeyVisual";
import { ReadyVisual } from "./ReadyVisual";
import type { usePermissionsState } from "@/features/onboarding/hooks/usePermissionsState";
import type { OnboardingStage } from "@/features/onboarding/types";
import { springEase } from "@/styles/theme";

export interface VisualGuidePanelProps {
  stage: OnboardingStage;
  permissionsManager: ReturnType<typeof usePermissionsState>;
}

export const VisualGuidePanel: React.FC<VisualGuidePanelProps> = ({
  stage,
  permissionsManager,
}) => {
  return (
    <Box
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#F8F9FB",
        borderLeft: "1px solid var(--gray-4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 251, 0) 100%)",
        }}
      />

      <AnimatePresence mode="wait">
        {stage === "permissions" && (
          <motion.div
            key="permissions_visual"
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.22, ease: springEase }}
            style={{ width: "100%", display: "flex", justifyContent: "center", position: "relative", zIndex: 1 }}
          >
            <PermissionsVisual permissionsManager={permissionsManager} />
          </motion.div>
        )}

        {stage === "api_key" && (
          <motion.div
            key="api_key_visual"
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.22, ease: springEase }}
            style={{ width: "100%", display: "flex", justifyContent: "center", position: "relative", zIndex: 1 }}
          >
            <ApiKeyVisual />
          </motion.div>
        )}

        {stage === "ready" && (
          <motion.div
            key="ready_visual"
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.22, ease: springEase }}
            style={{ width: "100%", display: "flex", justifyContent: "center", position: "relative", zIndex: 1 }}
          >
            <ReadyVisual />
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};
