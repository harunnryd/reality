import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ChevronDown, Check } from "lucide-react";

export type DateFilterOption =
  | "all_time"
  | "today"
  | "this_week"
  | "this_month"
  | "last_30_days";

export interface DatePickerDropdownProps {
  selectedFilter: DateFilterOption;
  onSelectFilter: (opt: DateFilterOption) => void;
  customDate?: Date | null;
  onSelectCustomDate?: (date: Date | null) => void;
}

const DATE_OPTIONS: Array<{ id: DateFilterOption; label: string }> = [
  { id: "all_time", label: "All Time" },
  { id: "today", label: "Today" },
  { id: "this_week", label: "This Week" },
  { id: "this_month", label: "This Month" },
  { id: "last_30_days", label: "Last 30 Days" },
];

export const DatePickerDropdown: React.FC<DatePickerDropdownProps> = ({
  selectedFilter,
  onSelectFilter,
  customDate,
  onSelectCustomDate,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const currentLabel =
    customDate
      ? customDate.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
      : DATE_OPTIONS.find((o) => o.id === selectedFilter)?.label || "Date Scope";

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block", zIndex: 100 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "4px 8px",
          borderRadius: 6,
          border: "1px solid rgba(0, 0, 0, 0.08)",
          backgroundColor: "#FFFFFF",
          fontSize: 11.5,
          fontWeight: 600,
          color: customDate || selectedFilter !== "all_time" ? "#0071E3" : "#6E6E73",
          cursor: "pointer",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)",
          transition: "all 120ms ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8F9FA")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FFFFFF")}
      >
        <CalendarIcon size={12} color={customDate || selectedFilter !== "all_time" ? "#0071E3" : "#6E6E73"} />
        <span>{currentLabel}</span>
        <ChevronDown size={11} style={{ opacity: 0.5 }} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.12 }}
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: 4,
              minWidth: 190,
              borderRadius: 10,
              backgroundColor: "#FFFFFF",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              boxShadow: "0 14px 36px -4px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.05)",
              padding: 4,
              zIndex: 9999,
            }}
          >
            <div
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "#86868B",
                padding: "5px 8px 3px 8px",
              }}
            >
              Filter by Date
            </div>

            {DATE_OPTIONS.map((opt) => {
              const isSelected = !customDate && selectedFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    onSelectCustomDate?.(null);
                    onSelectFilter(opt.id);
                    setIsOpen(false);
                  }}
                  style={{
                    width: "100%",
                    cursor: "pointer",
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "none",
                    fontSize: 12,
                    color: "#1D1D1F",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: isSelected ? "rgba(0, 113, 227, 0.08)" : "transparent",
                    fontWeight: isSelected ? 650 : 450,
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.04)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={12} color="#0071E3" />}
                </button>
              );
            })}

            <div style={{ height: 1, backgroundColor: "rgba(0, 0, 0, 0.06)", margin: "4px 0" }} />

            <div style={{ padding: "4px 8px 6px 8px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#86868B", marginBottom: 4 }}>
                Jump to Specific Day:
              </div>
              <input
                type="date"
                onChange={(e) => {
                  if (e.target.value) {
                    const parts = e.target.value.split("-").map(Number);
                    const y = parts[0];
                    const m = parts[1];
                    const d = parts[2];
                    if (typeof y === "number" && typeof m === "number" && typeof d === "number") {
                      onSelectCustomDate?.(new Date(y, m - 1, d));
                      setIsOpen(false);
                    }
                  }
                }}
                style={{
                  width: "100%",
                  padding: "4px 6px",
                  borderRadius: 6,
                  border: "1px solid rgba(0, 0, 0, 0.12)",
                  fontSize: 11,
                  fontFamily: "inherit",
                  outline: "none",
                  color: "#1D1D1F",
                  backgroundColor: "#F8F9FA",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
