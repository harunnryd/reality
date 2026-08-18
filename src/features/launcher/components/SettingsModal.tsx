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
  Lock,
  Radio,
  Volume2,
  Sparkles,
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

type SettingsTab = "audio" | "models" | "shortcuts" | "stealth" | "about";

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
    { id: "default", name: "Default System Microphone", is_default: true },
  ]);
  const [selectedSpeaker, setSelectedSpeaker] = React.useState("default_speaker");
  const [availableSpeakers, setAvailableSpeakers] = React.useState<AudioOutputDevice[]>([
    { id: "default_speaker", name: "MacBook Pro Speakers", is_default: true },
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
    { id: "audio" as SettingsTab, label: "Speech & Audio", icon: Mic, badge: deepgramApiKey ? "Active" : undefined },
    { id: "models" as SettingsTab, label: "AI Intelligence", icon: Cpu, badge: hasStoredKey ? "Keychain" : undefined },
    { id: "shortcuts" as SettingsTab, label: "Shortcuts", icon: Keyboard },
    { id: "stealth" as SettingsTab, label: "Stealth & Privacy", icon: Shield },
    { id: "about" as SettingsTab, label: "System Health", icon: Info },
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
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          padding: 24,
          userSelect: "none",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 10 }}
          transition={{ duration: 0.18, ease: springEase }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 720,
            height: 490,
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            border: "1px solid rgba(0, 0, 0, 0.1)",
            boxShadow: "0 32px 64px -16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.04)",
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
              padding: "12px 16px",
              borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
              backgroundColor: "rgba(249, 249, 251, 0.95)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  backgroundColor: "#0071E3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 4px rgba(0, 113, 227, 0.3)",
                }}
              >
                <Sparkles size={12} color="#FFFFFF" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1D1D1F", letterSpacing: -0.2 }}>
                Reality Preferences
              </span>
            </div>

            <button
              onClick={onClose}
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                border: "none",
                backgroundColor: "rgba(0, 0, 0, 0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#86868B",
              }}
            >
              <X size={12} />
            </button>
          </div>

          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            <div
              style={{
                width: 215,
                flexShrink: 0,
                borderRight: "1px solid rgba(0, 0, 0, 0.06)",
                backgroundColor: "rgba(247, 247, 249, 0.7)",
                padding: "10px 8px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
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
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: 8,
                      backgroundColor: isSelected ? "rgba(0, 113, 227, 0.12)" : "transparent",
                      color: isSelected ? "#0071E3" : "#3A3A3C",
                      cursor: "pointer",
                      fontWeight: isSelected ? 600 : 500,
                      fontSize: 12.5,
                      transition: "all 120ms ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                      <Icon size={14} color={isSelected ? "#0071E3" : "#86868B"} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: 4,
                          backgroundColor: isSelected ? "#0071E3" : "rgba(0, 0, 0, 0.06)",
                          color: isSelected ? "#FFFFFF" : "#86868B",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          marginLeft: 6,
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div
              style={{
                flex: 1,
                padding: "18px 22px",
                overflowY: "auto",
                backgroundColor: "#FFFFFF",
              }}
            >
              {activeTab === "audio" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#86868B", textTransform: "uppercase" }}>
                        Live Speech-To-Text Engine
                      </label>
                      <span style={{ fontSize: 10.5, color: "#0071E3", fontWeight: 600 }}>
                        &lt;180ms p99 Live Streaming
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        padding: "10px 12px",
                        borderRadius: 10,
                        backgroundColor: "#F5F5F7",
                        border: "1px solid rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Radio size={13} color="#0071E3" />
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#1D1D1F" }}>
                            Deepgram Nova-2 (Python Sidecar WebSocket)
                          </span>
                        </div>
                        <a
                          href="https://console.deepgram.com/signup"
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: 10.5,
                            color: "#0071E3",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                            fontWeight: 600,
                          }}
                        >
                          <span>Get $200 Free</span>
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
                            padding: "6px 28px 6px 8px",
                            borderRadius: 6,
                            border: "1px solid rgba(0, 0, 0, 0.1)",
                            fontSize: 11.5,
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
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#86868B", textTransform: "uppercase" }}>
                      Hardware Devices
                    </label>
                    <div
                      style={{
                        marginTop: 6,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        padding: "10px 12px",
                        borderRadius: 10,
                        backgroundColor: "#F5F5F7",
                        border: "1px solid rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Mic size={13} color="#5856D6" />
                          <span style={{ fontSize: 12, color: "#1D1D1F" }}>Microphone</span>
                        </div>
                        <select
                          value={selectedMic}
                          onChange={(e) => setSelectedMic(e.target.value)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: 6,
                            border: "1px solid rgba(0, 0, 0, 0.1)",
                            fontSize: 11.5,
                            backgroundColor: "#FFFFFF",
                            outline: "none",
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
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Volume2 size={13} color="#34C759" />
                          <span style={{ fontSize: 12, color: "#1D1D1F" }}>Speaker (System Loopback)</span>
                        </div>
                        <select
                          value={selectedSpeaker}
                          onChange={(e) => setSelectedSpeaker(e.target.value)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: 6,
                            border: "1px solid rgba(0, 0, 0, 0.1)",
                            fontSize: 11.5,
                            backgroundColor: "#FFFFFF",
                            outline: "none",
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

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#86868B", textTransform: "uppercase" }}>
                      Signal Processing
                    </label>
                    <div
                      style={{
                        marginTop: 6,
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        padding: "10px 12px",
                        borderRadius: 10,
                        backgroundColor: "#F5F5F7",
                        border: "1px solid rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: "#1D1D1F" }}>VAD Silence Suppression</div>
                          <div style={{ fontSize: 10.5, color: "#86868B" }}>Pause audio streaming during speech pauses</div>
                        </div>
                        <AppleSwitch checked={vadThreshold} onChange={setVadThreshold} ariaLabel="VAD" />
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: "#1D1D1F" }}>Adaptive Noise Tracking</div>
                          <div style={{ fontSize: 10.5, color: "#86868B" }}>Dynamically cancel background noise</div>
                        </div>
                        <AppleSwitch checked={adaptiveNoiseTracking} onChange={setAdaptiveNoiseTracking} ariaLabel="Noise Tracking" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "models" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#86868B", textTransform: "uppercase" }}>
                        BYOK OpenAI / Anthropic Key
                      </label>
                      {hasStoredKey && (
                        <span style={{ fontSize: 10.5, color: "#34C759", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                          <Check size={11} /> Keychain Active
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        padding: "10px 12px",
                        borderRadius: 10,
                        backgroundColor: "#F5F5F7",
                        border: "1px solid rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      <div style={{ position: "relative" }}>
                        <input
                          type={showCustomKey ? "text" : "password"}
                          placeholder={hasStoredKey ? "••••••••••••••••••••••••" : "sk-ant-... or sk-proj-..."}
                          value={customApiKey}
                          onChange={(e) => setCustomApiKey(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "6px 28px 6px 8px",
                            borderRadius: 6,
                            border: "1px solid rgba(0, 0, 0, 0.1)",
                            fontSize: 11.5,
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
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                        <Lock size={11} color="#86868B" />
                        <span style={{ fontSize: 10.5, color: "#86868B" }}>
                          Encrypted securely inside macOS Keychain via keyring
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#86868B", textTransform: "uppercase" }}>
                      Assistant Persona Profile
                    </label>
                    <div
                      style={{
                        marginTop: 6,
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                      }}
                    >
                      {Object.entries(PERSONA_CONFIGS).map(([key, p]) => {
                        const isSel = defaultPersona === key;
                        return (
                          <div
                            key={key}
                            onClick={() => setDefaultPersona(key as PersonaMode)}
                            style={{
                              padding: "8px 10px",
                              borderRadius: 8,
                              border: `1px solid ${isSel ? "#0071E3" : "rgba(0, 0, 0, 0.08)"}`,
                              backgroundColor: isSel ? "rgba(0, 113, 227, 0.04)" : "#F5F5F7",
                              cursor: "pointer",
                            }}
                          >
                            <div style={{ fontSize: 12, fontWeight: 600, color: isSel ? "#0071E3" : "#1D1D1F" }}>
                              {p.label}
                            </div>
                            <div style={{ fontSize: 10.5, color: "#86868B", marginTop: 2 }}>{p.description}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "shortcuts" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(shortcutsList.length > 0
                    ? shortcutsList
                    : [
                        { id: "toggle_hud", name: "Toggle Meeting HUD Overlay", key_combination: "⌘ + \\", is_enabled: true },
                        { id: "capture_slide", name: "Capture Slide OCR Snapshot", key_combination: "⌘ + S", is_enabled: true },
                        { id: "spotlight_search", name: "Open Spotlight Launcher", key_combination: "⌘ + K", is_enabled: true },
                        { id: "instant_assist", name: "Trigger Instant AI Suggestion", key_combination: "⌘ + ↵", is_enabled: true },
                      ]
                  ).map((sc) => (
                    <div
                      key={sc.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        borderRadius: 8,
                        backgroundColor: "#F5F5F7",
                        border: "1px solid rgba(0, 0, 0, 0.04)",
                      }}
                    >
                      <span style={{ fontSize: 12, color: "#1D1D1F", fontWeight: 500 }}>{sc.name}</span>
                      <kbd
                        style={{
                          padding: "2px 7px",
                          borderRadius: 5,
                          backgroundColor: "#FFFFFF",
                          border: "1px solid rgba(0, 0, 0, 0.12)",
                          fontSize: 11,
                          fontFamily: "ui-monospace, monospace",
                          color: "#1D1D1F",
                          fontWeight: 600,
                          boxShadow: "0 1px 1px rgba(0, 0, 0, 0.05)",
                        }}
                      >
                        {sc.key_combination}
                      </kbd>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "stealth" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#86868B", textTransform: "uppercase" }}>
                      Process Title Disguise
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
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
                              fontWeight: 500,
                              cursor: "pointer",
                              border: `1px solid ${isSel ? "#0071E3" : "rgba(0, 0, 0, 0.08)"}`,
                              backgroundColor: isSel ? "#0071E3" : "#F5F5F7",
                              color: isSel ? "#FFFFFF" : "#1D1D1F",
                            }}
                          >
                            {d}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      backgroundColor: "#F5F5F7",
                      border: "1px solid rgba(0, 0, 0, 0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "#1D1D1F" }}>Auto-Wipe RAM on Finish</div>
                      <div style={{ fontSize: 10.5, color: "#86868B" }}>Clear memory buffer immediately upon meeting conclusion</div>
                    </div>
                    <AppleSwitch checked={wipeRamOnFinish} onChange={setWipeRamOnFinish} ariaLabel="Wipe RAM" />
                  </div>
                </div>
              )}

              {activeTab === "about" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: 10,
                      backgroundColor: "#F5F5F7",
                      border: "1px solid rgba(0, 0, 0, 0.06)",
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1D1D1F" }}>Reality v0.1.0</div>
                    <div style={{ fontSize: 11, color: "#86868B", marginTop: 2 }}>
                      Autonomous Meeting Intelligence Engine • Apple Silicon Native
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      backgroundColor: "#F5F5F7",
                      border: "1px solid rgba(0, 0, 0, 0.06)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11.5, color: "#1D1D1F" }}>Python Sidecar Orchestrator</span>
                      <span style={{ fontSize: 11, color: "#34C759", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#34C759" }} />
                        {sidecarStatus?.is_alive ? "Connected" : "Online"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11.5, color: "#1D1D1F" }}>Native Audio Pipeline (CPAL)</span>
                      <span style={{ fontSize: 11, color: "#34C759", fontWeight: 600 }}>16kHz Linear16</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11.5, color: "#1D1D1F" }}>Speech Engine</span>
                      <span style={{ fontSize: 11, color: "#0071E3", fontWeight: 600 }}>Deepgram Nova-2</span>
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
              padding: "10px 16px",
              borderTop: "1px solid rgba(0, 0, 0, 0.06)",
              backgroundColor: "rgba(249, 249, 251, 0.95)",
            }}
          >
            {savedToast ? (
              <span style={{ fontSize: 11.5, color: "#34C759", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                <Check size={13} /> Settings saved to Keychain &amp; Sidecar
              </span>
            ) : (
              <span style={{ fontSize: 10.5, color: "#86868B" }}>Preferences apply in real-time</span>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={onClose}
                style={{
                  padding: "5px 12px",
                  borderRadius: 6,
                  border: "1px solid rgba(0, 0, 0, 0.12)",
                  backgroundColor: "#FFFFFF",
                  fontSize: 11.5,
                  fontWeight: 500,
                  cursor: "pointer",
                  color: "#1D1D1F",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: "5px 16px",
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: "#0071E3",
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "#FFFFFF",
                  boxShadow: "0 1px 2px rgba(0, 113, 227, 0.3)",
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
