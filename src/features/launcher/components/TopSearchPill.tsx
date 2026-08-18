import * as React from "react";
import { Search, X } from "lucide-react";

export interface TopSearchPillProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit?: (val: string) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export const TopSearchPill: React.FC<TopSearchPillProps> = ({
  value,
  onChange,
  onSubmit,
  inputRef,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const internalRef = React.useRef<HTMLInputElement>(null);
  const resolvedRef = inputRef || internalRef;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      onSubmit?.(value);
    }
  };

  return (
    <div
      className="no-drag"
      onClick={() => resolvedRef.current?.focus()}
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        maxWidth: 380,
        height: 28,
        padding: "0 10px",
        borderRadius: 8,
        backgroundColor: isFocused ? "#FFFFFF" : "#EAEAEA",
        border: `1px solid ${isFocused ? "#0071E3" : "rgba(0, 0, 0, 0.08)"}`,
        boxShadow: isFocused ? "0 0 0 2px rgba(0, 113, 227, 0.2)" : "none",
        transition: "all 150ms ease",
        cursor: "text",
      }}
    >
      <Search
        size={13}
        color={isFocused ? "#0071E3" : "#86868B"}
        style={{ marginRight: 7, flexShrink: 0 }}
      />

      <input
        ref={resolvedRef}
        type="text"
        placeholder="Search past meetings or ask AI (⌘K)..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        style={{
          border: "none",
          outline: "none",
          background: "transparent",
          width: "100%",
          fontSize: 12,
          color: "#1D1D1F",
          fontFamily: "inherit",
        }}
      />

      {value ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChange("");
            resolvedRef.current?.focus();
          }}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            color: "#86868B",
          }}
        >
          <X size={12} />
        </button>
      ) : (
        <span
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            padding: "1px 5px",
            borderRadius: 4,
            backgroundColor: isFocused ? "#F2F2F7" : "#FFFFFF",
            color: "#86868B",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            marginLeft: 4,
            flexShrink: 0,
          }}
        >
          ⌘K
        </span>
      )}
    </div>
  );
};
