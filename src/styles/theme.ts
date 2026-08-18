export const colors = {
  appleBlue: "#0071E3",
  appleBlueHover: "#0077ED",
  appleBlueActive: "#0062CC",
  appleGreen: "#34C759",
  appleRed: "#FF3B30",
  appleAmber: "#FF9500",

  labelPrimary: "#1D1D1F",
  labelSecondary: "#6E6E73",
  labelTertiary: "#86868B",
  labelQuaternary: "#AEAEC2",

  windowBackground: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  fillQuaternary: "rgba(0, 0, 0, 0.03)",
  fillTertiary: "#F5F5F7",
  fillSecondary: "#E8E8ED",
  fillPrimary: "#1D1D1F",

  separator: "rgba(0, 0, 0, 0.08)",
  separatorOpaque: "#E5E5E7",
  borderSubtle: "rgba(0, 0, 0, 0.06)",
  focusRing: "rgba(0, 113, 227, 0.35)",

  windowShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.08)",
  cardShadow: "0 1px 3px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.06)",
  cardShadowHover: "0 4px 12px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.1)",
  buttonShadow: "0 1px 2px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
} as const;

export const typeScale = {
  titleLarge: { fontSize: "20px", lineHeight: "26px", fontWeight: 600, letterSpacing: "-0.022em" },
  titleMedium: { fontSize: "16px", lineHeight: "22px", fontWeight: 600, letterSpacing: "-0.018em" },
  titleSmall: { fontSize: "14px", lineHeight: "20px", fontWeight: 600, letterSpacing: "-0.014em" },

  bodyLarge: { fontSize: "14px", lineHeight: "20px", fontWeight: 400, letterSpacing: "-0.006em" },
  bodyMedium: { fontSize: "13px", lineHeight: "18px", fontWeight: 400, letterSpacing: "-0.004em" },
  bodySmall: { fontSize: "12px", lineHeight: "16px", fontWeight: 400, letterSpacing: "0em" },

  button: { fontSize: "13px", lineHeight: "16px", fontWeight: 500, letterSpacing: "-0.004em" },
  badge: { fontSize: "11px", lineHeight: "14px", fontWeight: 500, letterSpacing: "0.01em" },
  caption: { fontSize: "11px", lineHeight: "14px", fontWeight: 400, letterSpacing: "0.01em" },
  micro: { fontSize: "10px", lineHeight: "12px", fontWeight: 500, letterSpacing: "0.02em" },
} as const;

export const typography = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", system-ui, sans-serif',
  fontMono:
    'ui-monospace, "SF Mono", "Menlo", "Monaco", "Consolas", monospace',
  scale: typeScale,
} as const;

export const springEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const springTransitions = {
  apple: { type: "spring", stiffness: 420, damping: 32 },
  snappy: { type: "spring", stiffness: 500, damping: 30 },
  gentle: { type: "spring", stiffness: 300, damping: 26 },
} as const;
