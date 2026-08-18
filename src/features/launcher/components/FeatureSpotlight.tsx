import * as React from "react";
import { Sparkles, Camera, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const FeatureSpotlight: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<"hud" | "ocr" | "memory">("hud");

  return (
    <div
      style={{
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        border: "1px solid rgba(0, 0, 0, 0.07)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
        padding: "10px 12px 12px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        userSelect: "none",
        position: "relative",
        overflow: "hidden",
        height: 110,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#F2F2F7",
          padding: 2.5,
          borderRadius: 8,
          gap: 2,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {[
          { id: "hud", label: "Live HUD" },
          { id: "ocr", label: "Slide OCR" },
          { id: "memory", label: "Cross Memory" },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1,
                padding: "4px 0",
                borderRadius: 6,
                border: "none",
                backgroundColor: isSelected ? "#FFFFFF" : "transparent",
                color: isSelected ? "#0071E3" : "#6E6E73",
                fontSize: 11,
                fontWeight: isSelected ? 650 : 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isSelected ? "0 1px 3px rgba(0, 0, 0, 0.08)" : "none",
                transition: "all 120ms ease",
              }}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div
        style={{
          borderRadius: 8,
          backgroundColor: "#F8F9FB",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          padding: "7px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 5,
          height: 56,
          boxSizing: "border-box",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <AnimatePresence mode="wait">
          {activeTab === "hud" && (
            <motion.div
              key="tab_hud"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              style={{ display: "flex", flexDirection: "column", gap: 4 }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 2, height: 14 }}>
                    {[10, 14, 12, 15, 11, 14, 9].map((h, i) => (
                      <motion.div
                        key={i}
                        animate={{ scaleY: [0.35, 1, 0.4] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.75 + (i % 3) * 0.12,
                          ease: "easeInOut",
                        }}
                        style={{
                          width: 2.2,
                          height: h,
                          borderRadius: 1,
                          backgroundColor: "#10B981",
                          transformOrigin: "center",
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 10.5, color: "#64748B", fontWeight: 500, lineHeight: 1 }}>
                    Speaking &bull; <strong style={{ color: "#1D1D1F" }}>Sarah Lin</strong> (VP Eng)
                  </span>
                </div>

                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    color: "#047857",
                    backgroundColor: "rgba(16, 185, 129, 0.12)",
                    padding: "1px 5px",
                    borderRadius: 4,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  38ms p99
                </span>
              </div>

              <div
                style={{
                  padding: "3px 8px",
                  borderRadius: 5,
                  backgroundColor: "rgba(0, 113, 227, 0.08)",
                  border: "1px solid rgba(0, 113, 227, 0.14)",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Sparkles size={10} color="#0071E3" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: "#0071E3", fontWeight: 600, whiteSpace: "nowrap" }}>
                  Cue: Propose 150ms buffer for &lt;350ms latency.
                </span>
              </div>
            </motion.div>
          )}

          {activeTab === "ocr" && (
            <motion.div
              key="tab_ocr"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  backgroundColor: "rgba(88, 86, 214, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Camera size={13} color="#5856D6" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#1D1D1F", whiteSpace: "nowrap" }}>
                  [Slide 4] HNSW FP16 Quantized Indexing
                </span>
                <span style={{ fontSize: 9.5, color: "#5856D6", fontWeight: 550 }}>
                  Diagram detected &bull; Sub-350ms buffer SLA verified
                </span>
              </div>
            </motion.div>
          )}

          {activeTab === "memory" && (
            <motion.div
              key="tab_memory"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  backgroundColor: "rgba(16, 185, 129, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Brain size={13} color="#10B981" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#1D1D1F", whiteSpace: "nowrap" }}>
                  [Recall 14 Aug] Horizon FinTech BaFin SLA
                </span>
                <span style={{ fontSize: 9.5, color: "#047857", fontWeight: 550 }}>
                  Cross-meeting consensus: 99.95% uptime confirmed
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
