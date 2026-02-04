/**
 * Bento Minimal design tokens (light theme only for MVP)
 */
export const Theme = {
  colors: {
    background: "#FAFAFA",
    card: "#FFFFFF",
    cardBorder: "#EEEEEE",
    accent: "#000000",
    success: "#22C55E",
    textPrimary: "#000000",
    textSecondary: "#6B7280",
    inactive: "#E5E7EB",
    remaining: "#F8FAFC",
    heatmapEmpty: "#F3F4F6",
    heatmapLow: "#BBF7D0",
    heatmapHigh: "#22C55E",
  },
  radius: {
    card: 16,
    button: 9999, // 50% pill/circle
  },
  spacing: 16,
  shadow: {
    card: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.02,
      shadowRadius: 6,
      elevation: 2,
    },
  },
  typography: {
    date: { fontSize: 14, fontWeight: "500" as const },
    heading: { fontSize: 28, fontWeight: "700" as const },
    habitName: { fontSize: 18, fontWeight: "700" as const },
    mono: { fontSize: 14 },
  },
} as const;
