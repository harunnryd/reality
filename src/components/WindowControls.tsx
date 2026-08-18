import * as React from "react";
import { Flex, Box } from "@radix-ui/themes";
import { useWindowControls } from "@/hooks/useWindowControls";

export interface WindowControlsProps {
  className?: string;
  style?: React.CSSProperties;
}

export const WindowControls: React.FC<WindowControlsProps> = ({
  className,
  style,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const { close, minimize, toggleMaximize } = useWindowControls();

  const handleAction =
    (action: () => Promise<void>) => (e: React.MouseEvent) => {
      e.stopPropagation();
      void action();
    };

  return (
    <Flex
      align="center"
      gap="2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
      style={{ padding: "2px 0", cursor: "pointer", userSelect: "none", ...style }}
    >
      <Box
        onClick={handleAction(close)}
        title="Close"
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: "#FF5F57",
          border: "0.5px solid rgba(0,0,0,0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 8,
          fontWeight: 800,
          color: "rgba(77, 0, 0, 0.75)",
          lineHeight: 1,
          transition: "opacity 100ms ease",
        }}
      >
        {isHovered && "✕"}
      </Box>

      <Box
        onClick={handleAction(minimize)}
        title="Minimize"
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: "#FEBC2E",
          border: "0.5px solid rgba(0,0,0,0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 800,
          color: "rgba(102, 60, 0, 0.75)",
          lineHeight: 1,
          transition: "opacity 100ms ease",
        }}
      >
        {isHovered && "−"}
      </Box>

      <Box
        onClick={handleAction(toggleMaximize)}
        title="Zoom"
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: "#28C840",
          border: "0.5px solid rgba(0,0,0,0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 8,
          fontWeight: 800,
          color: "rgba(0, 77, 0, 0.75)",
          lineHeight: 1,
          transition: "opacity 100ms ease",
        }}
      >
        {isHovered && "+"}
      </Box>
    </Flex>
  );
};
