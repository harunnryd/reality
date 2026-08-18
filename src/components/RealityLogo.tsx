import * as React from "react";

export interface RealityLogoProps {
  size?: number;
  variant?: "icon" | "mark" | "full";
  className?: string;
  style?: React.CSSProperties;
}

export const RealityLogo: React.FC<RealityLogoProps> = ({
  size = 24,
  variant = "mark",
  className,
  style,
}) => {
  const iconMarkup = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        flexShrink: 0,
        ...style,
      }}
    >
      <rect width="32" height="32" rx="8" fill="var(--gray-12, #1D1D1F)" />
      <rect x="12" y="7" width="8" height="12" rx="4" fill="#FFFFFF" />
      <path
        d="M8.5 13.5C8.5 17.6421 11.8579 21 16 21C20.1421 21 23.5 17.6421 23.5 13.5"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 21V25M12.5 25H19.5"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="23.5" cy="8.5" r="2" fill="var(--blue-9, #0071E3)" />
    </svg>
  );

  if (variant === "icon" || variant === "mark") {
    return iconMarkup;
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        userSelect: "none",
        ...style,
      }}
    >
      {iconMarkup}
      <span
        style={{
          fontSize: 13.5,
          fontWeight: 650,
          letterSpacing: "-0.02em",
          color: "var(--gray-12, #1D1D1F)",
          lineHeight: 1,
        }}
      >
        Reality
      </span>
    </div>
  );
};
