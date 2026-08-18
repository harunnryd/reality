import * as React from "react";
import { DropdownMenu, Button, Flex, Text } from "@radix-ui/themes";
import { Sparkles, Code, TrendingUp, Shield, ChevronDown, Check } from "lucide-react";
import { PersonaConfig, PersonaMode } from "../types";
import { PERSONA_CONFIGS } from "../services/meetingsService";

export interface PersonaSelectorProps {
  selectedPersona: PersonaMode;
  onSelectPersona: (persona: PersonaMode) => void;
}

const PERSONA_ICONS: Record<PersonaMode, React.ReactNode> = {
  general: <Sparkles size={13} />,
  tech: <Code size={13} />,
  sales: <TrendingUp size={13} />,
  executive: <Shield size={13} />,
};

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  selectedPersona,
  onSelectPersona,
}) => {
  const current = PERSONA_CONFIGS[selectedPersona] || (PERSONA_CONFIGS["general"] as PersonaConfig);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button
          size="1"
          variant="surface"
          color="gray"
          style={{
            cursor: "pointer",
            fontWeight: 550,
            fontSize: 11.5,
            padding: "0 8px",
            height: 28,
            borderRadius: 7,
            color: "var(--gray-12)",
          }}
        >
          <Flex align="center" gap="1">
            <span style={{ color: "var(--blue-9)", display: "flex", alignItems: "center" }}>
              {PERSONA_ICONS[selectedPersona]}
            </span>
            <Text>{current.label}</Text>
            <ChevronDown size={11} style={{ opacity: 0.5, marginLeft: 2 }} />
          </Flex>
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        size="2"
        align="end"
        style={{
          minWidth: 210,
          borderRadius: 10,
          padding: 4,
          backgroundColor: "var(--color-panel-solid, #ffffff)",
          boxShadow: "0 16px 36px -8px rgba(0, 0, 0, 0.16), 0 0 0 1px var(--gray-4)",
        }}
      >
        <DropdownMenu.Label
          style={{
            fontSize: 10,
            fontWeight: 650,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "var(--gray-9)",
            padding: "4px 8px 2px 8px",
          }}
        >
          AI Reasoning Persona
        </DropdownMenu.Label>

        {Object.values(PERSONA_CONFIGS).map((p) => {
          const isSelected = p.id === selectedPersona;
          return (
            <DropdownMenu.Item
              key={p.id}
              onClick={() => onSelectPersona(p.id as PersonaMode)}
              style={{
                cursor: "pointer",
                padding: "7px 8px",
                borderRadius: 6,
                height: "auto",
                minHeight: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: isSelected ? "var(--gray-3)" : "transparent",
              }}
            >
              <Flex align="center" gap="2">
                <span style={{ color: "var(--gray-11)", display: "flex", alignItems: "center" }}>
                  {PERSONA_ICONS[p.id as PersonaMode]}
                </span>
                <Text size="2" weight={isSelected ? "bold" : "medium"} style={{ color: "var(--gray-12)", fontSize: 12.5 }}>
                  {p.label}
                </Text>
              </Flex>

              {isSelected && (
                <Check size={14} color="var(--blue-9)" style={{ marginLeft: 8 }} />
              )}
            </DropdownMenu.Item>
          );
        })}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
