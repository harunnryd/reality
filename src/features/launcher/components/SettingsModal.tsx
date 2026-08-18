import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  SlidersHorizontal,
  Mic,
  Cpu,
  Keyboard,
  Shield,
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
} from "@/services";
import { springEase } from "@/styles/theme";

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = "general" | "audio" | "models" | "shortcuts" | "about";

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
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("general");
  const [defaultPersona, setDefaultPersona] = React.useState<PersonaMode>("tech");
  const [stealthDefault, setStealthDefault] = React.useState(true);
  const [selectedDisguise, setSelectedDisguise] = React.useState("Reality");
  const [availableDisguises, setAvailableDisguises] = React.useState<string[]>([
    "Reality",
    "System Settings",
    "Terminal",
    "Finder",
    "Activity Monitor",
  ]);
  const [rnNoiseFilter, setRnNoiseFilter] = React.useState(true);
  const [vadThreshold, setVadThreshold] = React.useState(true);
  const [adaptiveNoiseTracking, setAdaptiveNoiseTracking] = React.useState(true);
  const [speechEngine, setSpeechEngine] = React.useState("whisper_sub350");
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
  const [hasStoredKey, setHasStoredKey] = React.useState(false);
  const [wipeRamOnFinish, setWipeRamOnFinish] = React.useState(true);
  const [savedToast, setSavedToast] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
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
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          padding: 24,
          userSelect: "none",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.18, ease: springEase }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 620,
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            border: "1px solid rgba(0, 0, 0, 0.08)",
            boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.06)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: 500,
          }}
        >
          <div
            style={{
              padding: "14px 18px",
              borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#FAFAFA",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  backgroundColor: "rgba(0, 113, 227, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0071E3",
                }}
              >
                <SlidersHorizontal size={14} />
              </div>
              <h3 style={{ margin: 0, fontSize: 13.5, fontWeight: 650, color: "#1D1D1F" }}>
                Reality Preferences
              </h3>
            </div>

            <button
              onClick={onClose}
              style={{
                border: "none",
                background: "transparent",
                color: "#86868B",
                cursor: "pointer",
                padding: 4,
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <X size={15} />
            </button>
          </div>

          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            <div
              style={{
                width: 160,
                borderRight: "1px solid rgba(0, 0, 0, 0.06)",
                backgroundColor: "#F8F9FA",
                padding: "8px 6px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {[
                { id: "general", label: "General", icon: <SlidersHorizontal size={13} /> },
                { id: "audio", label: "Audio & Input", icon: <Mic size={13} /> },
                { id: "models", label: "AI Models & BYOK", icon: <Cpu size={13} /> },
                { id: "shortcuts", label: "Shortcuts", icon: <Keyboard size={13} /> },
                { id: "about", label: "Security & About", icon: <Shield size={13} /> },
              ].map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "none",
                      backgroundColor: isSelected ? "#FFFFFF" : "transparent",
                      color: isSelected ? "#0071E3" : "#475569",
                      fontSize: 12,
                      fontWeight: isSelected ? 650 : 500,
                      cursor: "pointer",
                      textAlign: "left",
                      boxShadow: isSelected ? "0 1px 2px rgba(0, 0, 0, 0.06)" : "none",
                    }}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ flex: 1, padding: "16px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
              {activeTab === "general" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#86868B", textTransform: "uppercase" }}>
                      Default AI Reasoning Persona
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 6 }}>
                      {Object.values(PERSONA_CONFIGS).map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setDefaultPersona(p.id as PersonaMode)}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 8,
                            border: `1px solid ${defaultPersona === p.id ? "#0071E3" : "rgba(0, 0, 0, 0.08)"}`,
                            backgroundColor: defaultPersona === p.id ? "rgba(0, 113, 227, 0.04)" : "#FFFFFF",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            boxShadow: defaultPersona === p.id ? "0 0 0 1px #0071E3" : "none",
                          }}
                        >
                          <span style={{ fontSize: 12, fontWeight: 650, color: defaultPersona === p.id ? "#0071E3" : "#1D1D1F" }}>
                            {p.label}
                          </span>
                          <span style={{ fontSize: 10, color: "#86868B" }}>{p.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ paddingTop: 8, borderTop: "1px solid rgba(0, 0, 0, 0.05)" }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#86868B", textTransform: "uppercase" }}>
                      Activity Monitor Process Disguise
                    </label>
                    <select
                      value={selectedDisguise}
                      onChange={(e) => handleDisguiseChange(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        borderRadius: 7,
                        border: "1px solid rgba(0, 0, 0, 0.1)",
                        backgroundColor: "#FFFFFF",
                        fontSize: 12,
                        marginTop: 6,
                        outline: "none",
                        color: "#1D1D1F",
                      }}
                    >
                      {availableDisguises.map((disguise) => (
                        <option key={disguise} value={disguise}>
                          {disguise} {disguise === "Reality" ? "(Original Identity)" : "(Stealth Disguise)"}
                        </option>
                      ))}
                    </select>
                    <span style={{ fontSize: 10.5, color: "#86868B", marginTop: 4, display: "block" }}>
                      Rewrites macOS LaunchServices display name in memory without modifying app bundle
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid rgba(0, 0, 0, 0.05)" }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1D1D1F" }}>Stealth Mode by Default</div>
                      <div style={{ fontSize: 11, color: "#86868B" }}>Keep HUD invisible to Zoom/Meet screen shares</div>
                    </div>
                    <AppleSwitch checked={stealthDefault} onChange={setStealthDefault} ariaLabel="Stealth Mode by Default" />
                  </div>
                </div>
              )}

              {activeTab === "audio" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#86868B", textTransform: "uppercase" }}>
                      Input Microphone Device
                    </label>
                    <select
                      value={selectedMic}
                      onChange={(e) => setSelectedMic(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        borderRadius: 7,
                        border: "1px solid rgba(0, 0, 0, 0.1)",
                        backgroundColor: "#FFFFFF",
                        fontSize: 12,
                        marginTop: 6,
                        outline: "none",
                        color: "#1D1D1F",
                      }}
                    >
                      {availableMics.map((mic) => (
                        <option key={mic.id} value={mic.id}>
                          {mic.name} {mic.is_default ? "(Default)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#86868B", textTransform: "uppercase" }}>
                      System Audio Loopback (Attendee Voice Capture)
                    </label>
                    <select
                      value={selectedSpeaker}
                      onChange={(e) => setSelectedSpeaker(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        borderRadius: 7,
                        border: "1px solid rgba(0, 0, 0, 0.1)",
                        backgroundColor: "#FFFFFF",
                        fontSize: 12,
                        marginTop: 6,
                        outline: "none",
                        color: "#1D1D1F",
                      }}
                    >
                      {availableSpeakers.map((spk) => (
                        <option key={spk.id} value={spk.id}>
                          {spk.name} {spk.is_default ? "(Default Output)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid rgba(0, 0, 0, 0.05)" }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1D1D1F" }}>Adaptive Noise Floor Calibration</div>
                      <div style={{ fontSize: 11, color: "#86868B" }}>EMA adaptive tracking for noisy cafes & quiet rooms</div>
                    </div>
                    <AppleSwitch checked={adaptiveNoiseTracking} onChange={setAdaptiveNoiseTracking} ariaLabel="Adaptive Noise Floor" />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid rgba(0, 0, 0, 0.05)" }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1D1D1F" }}>RNNoise Background Noise Filter</div>
                      <div style={{ fontSize: 11, color: "#86868B" }}>Suppress typing sounds and ambient background chatter</div>
                    </div>
                    <AppleSwitch checked={rnNoiseFilter} onChange={setRnNoiseFilter} ariaLabel="RNNoise Background Noise Filter" />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid rgba(0, 0, 0, 0.05)" }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1D1D1F" }}>VAD Silence Suppression (320-sample)</div>
                      <div style={{ fontSize: 11, color: "#86868B" }}>Pause transmission when ambient sound is below threshold</div>
                    </div>
                    <AppleSwitch checked={vadThreshold} onChange={setVadThreshold} ariaLabel="VAD Silence Suppression" />
                  </div>
                </div>
              )}

              {activeTab === "models" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#86868B", textTransform: "uppercase" }}>
                      Speech Recognition Engine
                    </label>
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      {[
                        { id: "whisper_sub350", name: "Whisper Sub-350ms (Cloud)", latency: "38ms p99" },
                        { id: "whisper_coreml", name: "Whisper CoreML (On-Device)", latency: "110ms" },
                      ].map((eng) => (
                        <div
                          key={eng.id}
                          onClick={() => setSpeechEngine(eng.id)}
                          style={{
                            flex: 1,
                            padding: "8px 10px",
                            borderRadius: 8,
                            border: `1px solid ${speechEngine === eng.id ? "#0071E3" : "rgba(0, 0, 0, 0.08)"}`,
                            backgroundColor: speechEngine === eng.id ? "rgba(0, 113, 227, 0.04)" : "#FFFFFF",
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#1D1D1F" }}>{eng.name}</div>
                          <span style={{ fontSize: 10, color: "#0071E3", fontWeight: 600 }}>{eng.latency}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#86868B", textTransform: "uppercase" }}>
                        Custom BYOK OpenAI / Anthropic Key
                      </label>
                      {hasStoredKey && (
                        <span style={{ fontSize: 10.5, color: "#10B981", fontWeight: 600 }}>
                          ✓ Active in macOS Keychain
                        </span>
                      )}
                    </div>
                    <input
                      type="password"
                      placeholder={hasStoredKey ? "••••••••••••••••••••••••" : "sk-ant-... or sk-proj-..."}
                      value={customApiKey}
                      onChange={(e) => setCustomApiKey(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        borderRadius: 7,
                        border: "1px solid rgba(0, 0, 0, 0.1)",
                        fontSize: 12,
                        marginTop: 6,
                        outline: "none",
                        fontFamily: "ui-monospace, monospace",
                      }}
                    />
                    <span style={{ fontSize: 10.5, color: "#86868B", marginTop: 4, display: "block" }}>
                      Encrypted securely inside macOS Keychain via keyring
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "shortcuts" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(shortcutsList.length > 0 ? shortcutsList : [
                    { id: "toggle_hud", name: "Toggle Meeting HUD Overlay", key_combination: "⌘ + \\", is_enabled: true },
                    { id: "capture_slide", name: "Capture Slide OCR Snapshot", key_combination: "⌘ + S", is_enabled: true },
                    { id: "spotlight_search", name: "Open Spotlight Launcher", key_combination: "⌘ + K", is_enabled: true },
                    { id: "instant_assist", name: "Trigger Instant AI Suggestion", key_combination: "⌘ + ↵", is_enabled: true },
                  ]).map((sc) => (
                    <div
                      key={sc.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 10px",
                        borderRadius: 6,
                        backgroundColor: "#F8F9FA",
                        border: "1px solid rgba(0, 0, 0, 0.04)",
                      }}
                    >
                      <span style={{ fontSize: 12, color: "#1D1D1F" }}>{sc.name}</span>
                      <kbd
                        style={{
                          padding: "3px 7px",
                          borderRadius: 4,
                          backgroundColor: "#FFFFFF",
                          border: "1px solid rgba(0, 0, 0, 0.15)",
                          boxShadow: "0 1px 0 rgba(0, 0, 0, 0.08)",
                          fontSize: 11,
                          fontWeight: 650,
                          color: "#475569",
                        }}
                      >
                        {sc.key_combination}
                      </kbd>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "about" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      backgroundColor: "rgba(0, 113, 227, 0.04)",
                      border: "1px solid rgba(0, 113, 227, 0.15)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12.5, fontWeight: 650, color: "#0071E3" }}>
                        Reality Architecture
                      </span>
                      <span style={{ fontSize: 11, color: sidecarStatus?.is_alive ? "#10B981" : "#EF4444", fontWeight: 600 }}>
                        ● {sidecarStatus?.is_alive ? "Neural Engine Ready" : "Disconnected"}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: "#64748B" }}>
                      Built natively for Apple Silicon with sub-350ms streaming real-time transcription and contextual AI reasoning.
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1D1D1F" }}>Zero-Data Retention (ZDR)</div>
                      <div style={{ fontSize: 11, color: "#86868B" }}>Purge ephemeral RAM audio frames immediately upon meeting end</div>
                    </div>
                    <AppleSwitch checked={wipeRamOnFinish} onChange={setWipeRamOnFinish} ariaLabel="Zero-Data Retention" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              padding: "10px 18px",
              borderTop: "1px solid rgba(0, 0, 0, 0.06)",
              backgroundColor: "#FAFAFA",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {savedToast && (
                <span style={{ fontSize: 11.5, color: "#10B981", fontWeight: 600 }}>
                  ✓ Preferences Saved
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={onClose}
                style={{
                  padding: "5px 12px",
                  borderRadius: 6,
                  border: "1px solid rgba(0, 0, 0, 0.12)",
                  backgroundColor: "#FFFFFF",
                  fontSize: 12,
                  fontWeight: 550,
                  color: "#475569",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: "5px 14px",
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: "#0071E3",
                  fontSize: 12,
                  fontWeight: 650,
                  color: "#FFFFFF",
                  cursor: "pointer",
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
