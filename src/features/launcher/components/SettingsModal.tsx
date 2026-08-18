import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mic,
  Cpu,
  Keyboard,
  Shield,
  Info,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import { PERSONA_CONFIGS } from "../services/meetingsService";
import { PersonaMode } from "../types";
import {
  audioService,
  AudioInputDevice,
  AudioOutputDevice,
  sidecarService,
  SidecarHealthStatus,
  credentialsService,
  systemService,
  shortcutsService,
  ShortcutDefinition,
  deepgramService,
} from "@/services";
import { springEase } from "@/styles/theme";

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = "audio" | "models" | "shortcuts" | "privacy" | "about";

const AppleSwitch: React.FC<{
  checked: boolean;
  onChange: (val: boolean) => void;
  ariaLabel?: string;
}> = ({ checked, onChange, ariaLabel }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      style={{
        width: 36,
        height: 20,
        borderRadius: 999,
        backgroundColor: checked ? "#0071E3" : "#E5E5EA",
        border: "none",
        padding: 2,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        transition: "background-color 150ms ease",
        boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)",
      }}
    >
      <motion.div
        animate={{ x: checked ? 16 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.25), 0 0 1px rgba(0, 0, 0, 0.15)",
        }}
      />
    </button>
  );
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("audio");
  const [defaultPersona, setDefaultPersona] = React.useState<PersonaMode>("tech");
  const [selectedDisguise, setSelectedDisguise] = React.useState("Reality");
  const [availableDisguises, setAvailableDisguises] = React.useState<string[]>([
    "Reality",
    "System Settings",
    "Terminal",
    "Finder",
    "Activity Monitor",
  ]);
  const [vadThreshold, setVadThreshold] = React.useState(true);
  const [adaptiveNoiseTracking, setAdaptiveNoiseTracking] = React.useState(true);
  const [selectedMic, setSelectedMic] = React.useState("default");
  const [availableMics, setAvailableMics] = React.useState<AudioInputDevice[]>([
    { id: "default", name: "Default Microphone", is_default: true },
  ]);
  const [selectedSpeaker, setSelectedSpeaker] = React.useState("default_speaker");
  const [availableSpeakers, setAvailableSpeakers] = React.useState<AudioOutputDevice[]>([
    { id: "default_speaker", name: "Default Speakers", is_default: true },
  ]);
  const [shortcutsList, setShortcutsList] = React.useState<ShortcutDefinition[]>([]);
  const [sidecarStatus, setSidecarStatus] = React.useState<SidecarHealthStatus | null>(null);
  const [customApiKey, setCustomApiKey] = React.useState("");
  const [deepgramApiKey, setDeepgramApiKey] = React.useState(deepgramService.getApiKey());
  const [showDeepgramKey, setShowDeepgramKey] = React.useState(false);
  const [showCustomKey, setShowCustomKey] = React.useState(false);
  const [hasStoredKey, setHasStoredKey] = React.useState(false);
  const [wipeRamOnFinish, setWipeRamOnFinish] = React.useState(true);
  const [savedToast, setSavedToast] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setDeepgramApiKey(deepgramService.getApiKey());
      audioService.listInputDevices().then((devices) => {
        if (devices.length > 0) setAvailableMics(devices);
      });
      audioService.listOutputDevices().then((speakers) => {
        if (speakers.length > 0) setAvailableSpeakers(speakers);
      });
      systemService.getAvailableDisguises().then((disguises) => {
        if (disguises.length > 0) setAvailableDisguises(disguises);
      });
      shortcutsService.getGlobalShortcuts().then((shortcuts) => {
        if (shortcuts.length > 0) setShortcutsList(shortcuts);
      });
      sidecarService.getStatus().then((status) => {
        setSidecarStatus(status);
      });
      credentialsService.hasApiKey().then((hasKey) => {
        setHasStoredKey(hasKey);
      });
    }
  }, [isOpen]);

  const handleDisguiseChange = async (name: string) => {
    setSelectedDisguise(name);
    await systemService.setProcessDisguise(name);
  };

  const handleSave = async () => {
    if (deepgramApiKey.trim()) {
      void deepgramService.configure(deepgramApiKey.trim());
    }
    if (customApiKey.trim()) {
      try {
        await credentialsService.validateAndStoreKey(customApiKey.trim());
        setHasStoredKey(true);
      } catch {}
    }
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  const navItems = [
    { id: "audio" as SettingsTab, label: "Audio", icon: Mic },
    { id: "models" as SettingsTab, label: "AI Models", icon: Cpu },
    { id: "shortcuts" as SettingsTab, label: "Shortcuts", icon: Keyboard },
    { id: "privacy" as SettingsTab, label: "Privacy", icon: Shield },
    { id: "about" as SettingsTab, label: "About", icon: Info },
  ];

  return (
    <AnimatePresence>
      <div
        className="no-drag"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0, 0, 0, 0.35)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          padding: 24,
          userSelect: "none",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ duration: 0.16, ease: springEase }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 620,
            height: 440,
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            border: "1px solid rgba(0, 0, 0, 0.12)",
            boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.25)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
              backgroundColor: "#F6F6F6",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1D1D1F" }}>
              Settings
            </span>

            <button
              onClick={onClose}
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: "none",
                backgroundColor: "rgba(0, 0, 0, 0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#86868B",
              }}
            >
              <X size={11} />
            </button>
          </div>

          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            <div
              style={{
                width: 170,
                flexShrink: 0,
                borderRight: "1px solid rgba(0, 0, 0, 0.08)",
                backgroundColor: "#FBFBFD",
                padding: "8px 6px",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 10px",
                      borderRadius: 6,
                      backgroundColor: isSelected ? "#0071E3" : "transparent",
                      color: isSelected ? "#FFFFFF" : "#1D1D1F",
                      cursor: "pointer",
                      fontWeight: isSelected ? 500 : 400,
                      fontSize: 12.5,
                      transition: "all 100ms ease",
                    }}
                  >
                    <Icon size={14} color={isSelected ? "#FFFFFF" : "#86868B"} />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                flex: 1,
                padding: "16px 18px",
                overflowY: "auto",
                backgroundColor: "#FFFFFF",
              }}
            >
              {activeTab === "audio" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#86868B" }}>
                        DEEPGRAM API KEY
                      </label>
                      <a
                        href="https://console.deepgram.com/signup"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: 11,
                          color: "#0071E3",
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <span>Get key</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showDeepgramKey ? "text" : "password"}
                        placeholder="8aa709d649248fe8d11eec..."
                        value={deepgramApiKey}
                        onChange={(e) => setDeepgramApiKey(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "6px 26px 6px 8px",
                          borderRadius: 6,
                          border: "1px solid rgba(0, 0, 0, 0.15)",
                          fontSize: 12,
                          backgroundColor: "#FFFFFF",
                          outline: "none",
                          fontFamily: "ui-monospace, monospace",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowDeepgramKey(!showDeepgramKey)}
                        style={{
                          position: "absolute",
                          right: 6,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#86868B",
                        }}
                      >
                        {showDeepgramKey ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                    <span style={{ fontSize: 10.5, color: "#86868B", marginTop: 3, display: "block" }}>
                      Used for live speech-to-text
                    </span>
                  </div>

                  <div style={{ borderTop: "1px solid rgba(0, 0, 0, 0.06)", paddingTop: 12 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#86868B", display: "block", marginBottom: 6 }}>
                      DEVICES
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, color: "#1D1D1F" }}>Microphone</span>
                        <select
                          value={selectedMic}
                          onChange={(e) => setSelectedMic(e.target.value)}
                          style={{
                            padding: "3px 6px",
                            borderRadius: 6,
                            border: "1px solid rgba(0, 0, 0, 0.15)",
                            fontSize: 11.5,
                            backgroundColor: "#FFFFFF",
                            outline: "none",
                            maxWidth: 200,
                          }}
                        >
                          {availableMics.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, color: "#1D1D1F" }}>Speaker</span>
                        <select
                          value={selectedSpeaker}
                          onChange={(e) => setSelectedSpeaker(e.target.value)}
                          style={{
                            padding: "3px 6px",
                            borderRadius: 6,
                            border: "1px solid rgba(0, 0, 0, 0.15)",
                            fontSize: 11.5,
                            backgroundColor: "#FFFFFF",
                            outline: "none",
                            maxWidth: 200,
                          }}
                        >
                          {availableSpeakers.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid rgba(0, 0, 0, 0.06)", paddingTop: 12 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#86868B", display: "block", marginBottom: 6 }}>
                      VOICE PROCESSING
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, color: "#1D1D1F" }}>Silence detection (VAD)</span>
                        <AppleSwitch checked={vadThreshold} onChange={setVadThreshold} ariaLabel="VAD" />
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, color: "#1D1D1F" }}>Noise suppression</span>
                        <AppleSwitch checked={adaptiveNoiseTracking} onChange={setAdaptiveNoiseTracking} ariaLabel="Noise Tracking" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "models" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#86868B" }}>
                        OPENAI / ANTHROPIC KEY
                      </label>
                      {hasStoredKey && (
                        <span style={{ fontSize: 10.5, color: "#34C759", fontWeight: 500, display: "flex", alignItems: "center", gap: 2 }}>
                          <Check size={11} /> Saved in Keychain
                        </span>
                      )}
                    </div>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showCustomKey ? "text" : "password"}
                        placeholder={hasStoredKey ? "••••••••••••••••••••••••" : "sk-..."}
                        value={customApiKey}
                        onChange={(e) => setCustomApiKey(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "6px 26px 6px 8px",
                          borderRadius: 6,
                          border: "1px solid rgba(0, 0, 0, 0.15)",
                          fontSize: 12,
                          backgroundColor: "#FFFFFF",
                          outline: "none",
                          fontFamily: "ui-monospace, monospace",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCustomKey(!showCustomKey)}
                        style={{
                          position: "absolute",
                          right: 6,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#86868B",
                        }}
                      >
                        {showCustomKey ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                    <span style={{ fontSize: 10.5, color: "#86868B", marginTop: 3, display: "block" }}>
                      Used for meeting reasoning and summaries
                    </span>
                  </div>

                  <div style={{ borderTop: "1px solid rgba(0, 0, 0, 0.06)", paddingTop: 12 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#86868B", display: "block", marginBottom: 6 }}>
                      DEFAULT PERSONA
                    </label>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 6,
                      }}
                    >
                      {Object.entries(PERSONA_CONFIGS).map(([key, p]) => {
                        const isSel = defaultPersona === key;
                        return (
                          <div
                            key={key}
                            onClick={() => setDefaultPersona(key as PersonaMode)}
                            style={{
                              padding: "7px 9px",
                              borderRadius: 6,
                              border: `1px solid ${isSel ? "#0071E3" : "rgba(0, 0, 0, 0.1)"}`,
                              backgroundColor: isSel ? "rgba(0, 113, 227, 0.06)" : "#FAFAFA",
                              cursor: "pointer",
                            }}
                          >
                            <div style={{ fontSize: 12, fontWeight: 500, color: isSel ? "#0071E3" : "#1D1D1F" }}>
                              {p.label}
                            </div>
                            <div style={{ fontSize: 10.5, color: "#86868B", marginTop: 1 }}>{p.description}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "shortcuts" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#86868B", display: "block", marginBottom: 2 }}>
                    GLOBAL SHORTCUTS
                  </label>
                  {(shortcutsList.length > 0
                    ? shortcutsList
                    : [
                        { id: "toggle_hud", name: "Toggle HUD", key_combination: "⌘ + \\", is_enabled: true },
                        { id: "capture_slide", name: "Capture Screen", key_combination: "⌘ + S", is_enabled: true },
                        { id: "spotlight_search", name: "Spotlight Launcher", key_combination: "⌘ + K", is_enabled: true },
                        { id: "instant_assist", name: "Instant Suggestion", key_combination: "⌘ + ↵", is_enabled: true },
                      ]
                  ).map((sc) => (
                    <div
                      key={sc.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "7px 10px",
                        borderRadius: 6,
                        backgroundColor: "#F9F9FB",
                        border: "1px solid rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <span style={{ fontSize: 12, color: "#1D1D1F" }}>{sc.name}</span>
                      <div style={{ display: "flex", gap: 3 }}>
                        {sc.key_combination.split("+").map((k, i) => (
                          <kbd
                            key={i}
                            style={{
                              padding: "2px 6px",
                              borderRadius: 4,
                              backgroundColor: "#FFFFFF",
                              border: "1px solid rgba(0, 0, 0, 0.15)",
                              fontSize: 11,
                              fontFamily: "ui-monospace, monospace",
                              color: "#1D1D1F",
                              fontWeight: 500,
                            }}
                          >
                            {k.trim()}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "privacy" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#86868B", display: "block", marginBottom: 6 }}>
                      PROCESS TITLE DISGUISE
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {availableDisguises.map((d) => {
                        const isSel = selectedDisguise === d;
                        return (
                          <div
                            key={d}
                            onClick={() => handleDisguiseChange(d)}
                            style={{
                              padding: "5px 10px",
                              borderRadius: 6,
                              fontSize: 11.5,
                              cursor: "pointer",
                              border: `1px solid ${isSel ? "#0071E3" : "rgba(0, 0, 0, 0.1)"}`,
                              backgroundColor: isSel ? "#0071E3" : "#FAFAFA",
                              color: isSel ? "#FFFFFF" : "#1D1D1F",
                              fontWeight: isSel ? 500 : 400,
                            }}
                          >
                            {d}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid rgba(0, 0, 0, 0.06)", paddingTop: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12, color: "#1D1D1F" }}>Auto-clear memory on close</div>
                        <div style={{ fontSize: 10.5, color: "#86868B" }}>Clears local buffers when meeting ends</div>
                      </div>
                      <AppleSwitch checked={wipeRamOnFinish} onChange={setWipeRamOnFinish} ariaLabel="Clear RAM" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "about" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      backgroundColor: "#F9F9FB",
                      border: "1px solid rgba(0, 0, 0, 0.06)",
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1D1D1F" }}>Reality v0.1.0</div>
                    <div style={{ fontSize: 11, color: "#86868B", marginTop: 2 }}>
                      macOS Apple Silicon Native
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      backgroundColor: "#F9F9FB",
                      border: "1px solid rgba(0, 0, 0, 0.06)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: "#1D1D1F" }}>Sidecar</span>
                      <span style={{ fontSize: 11, color: "#34C759", fontWeight: 500 }}>
                        {sidecarStatus?.is_alive ? "Connected" : "Ready"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: "#1D1D1F" }}>Audio Engine</span>
                      <span style={{ fontSize: 11, color: "#86868B" }}>CPAL 16kHz PCM</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: "#1D1D1F" }}>STT Provider</span>
                      <span style={{ fontSize: 11, color: "#86868B" }}>Deepgram Nova-2</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 14px",
              borderTop: "1px solid rgba(0, 0, 0, 0.08)",
              backgroundColor: "#F6F6F6",
            }}
          >
            {savedToast ? (
              <span style={{ fontSize: 11.5, color: "#34C759", fontWeight: 500, display: "flex", alignItems: "center", gap: 3 }}>
                <Check size={12} /> Saved
              </span>
            ) : (
              <span />
            )}

            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={onClose}
                style={{
                  padding: "4px 10px",
                  borderRadius: 5,
                  border: "1px solid rgba(0, 0, 0, 0.15)",
                  backgroundColor: "#FFFFFF",
                  fontSize: 11.5,
                  cursor: "pointer",
                  color: "#1D1D1F",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: "4px 14px",
                  borderRadius: 5,
                  border: "none",
                  backgroundColor: "#0071E3",
                  fontSize: 11.5,
                  fontWeight: 500,
                  cursor: "pointer",
                  color: "#FFFFFF",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
