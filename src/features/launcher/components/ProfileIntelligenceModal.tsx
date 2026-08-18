import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  FileText,
  Target,
  Building2,
  Mail,
  Globe,
  Sparkles,
} from "lucide-react";
import { springEase } from "@/styles/theme";

export interface ProfileIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SectionTab = "identity" | "profile" | "roleinsight" | "company" | "coverletter" | "webgrounding";

const NAV_ITEMS: Array<{ id: SectionTab; label: string; icon: React.ReactNode }> = [
  { id: "identity", label: "Identity", icon: <User size={14} /> },
  { id: "profile", label: "Profile & Skills", icon: <FileText size={14} /> },
  { id: "roleinsight", label: "Role & JD Insight", icon: <Target size={14} /> },
  { id: "company", label: "Company Intel", icon: <Building2 size={14} /> },
  { id: "coverletter", label: "Cover Letter Pitch", icon: <Mail size={14} /> },
  { id: "webgrounding", label: "Web Grounding", icon: <Globe size={14} /> },
];

const STORAGE_KEY = "reality_profile_intelligence_v1";

export const ProfileIntelligenceModal: React.FC<ProfileIntelligenceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = React.useState<SectionTab>("identity");
  
  const [name, setName] = React.useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored).name || "Dimas Prasetyo";
    } catch {}
    return "Dimas Prasetyo";
  });

  const [role, setRole] = React.useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored).role || "Lead Distributed Systems Engineer";
    } catch {}
    return "Lead Distributed Systems Engineer";
  });

  const [bio, setBio] = React.useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored).bio || "8+ years architecting high-throughput streaming systems, vector indexing pipelines, and real-time audio AI inference on Apple Silicon.";
    } catch {}
    return "8+ years architecting high-throughput streaming systems, vector indexing pipelines, and real-time audio AI inference on Apple Silicon.";
  });

  const [uploadedResume, setUploadedResume] = React.useState<string | null>("Resume_Dimas_Prasetyo_2026.pdf");

  const [skills, setSkills] = React.useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && JSON.parse(stored).skills) return JSON.parse(stored).skills;
    } catch {}
    return [
      "Distributed Systems",
      "Rust & Tauri",
      "Vector Search (HNSW)",
      "CoreML & Whisper",
      "WebSockets & WebRTC",
      "PostgreSQL & Qdrant",
    ];
  });
  const [newSkill, setNewSkill] = React.useState("");

  const [targetRole, setTargetRole] = React.useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored).targetRole || "Staff AI Infrastructure Engineer";
    } catch {}
    return "Staff AI Infrastructure Engineer";
  });

  const [jobDescription, setJobDescription] = React.useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored).jobDescription || "Seeking a Staff Engineer to build sub-350ms streaming speech synthesis, on-device Neural Engine optimization, and enterprise BaFin/SOC2 compliance.";
    } catch {}
    return "Seeking a Staff Engineer to build sub-350ms streaming speech synthesis, on-device Neural Engine optimization, and enterprise BaFin/SOC2 compliance.";
  });

  const [targetCompany, setTargetCompany] = React.useState("Horizon FinTech & Cloud Corp");
  const [companyDomain, setCompanyDomain] = React.useState("horizonfintech.io");
  const [companyNotes, setCompanyNotes] = React.useState(
    "250-seat enterprise pilot. Needs on-premise BaFin GDPR encryption and zero-RAM audio retention."
  );

  const [coverTone, setCoverTone] = React.useState<"confident" | "formal" | "technical">("technical");
  const [customGroundingUrls, setCustomGroundingUrls] = React.useState("https://docs.reality.ai\nhttps://developer.apple.com/machine-learning");
  const [savedToast, setSavedToast] = React.useState(false);

  if (!isOpen) return null;

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    setSkills([...skills, trimmed]);
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          name,
          role,
          bio,
          skills,
          targetRole,
          jobDescription,
          targetCompany,
          companyDomain,
          companyNotes,
        })
      );
    } catch {}
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 600);
  };

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
            maxWidth: 680,
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            border: "1px solid rgba(0, 0, 0, 0.08)",
            boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.06)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: 520,
          }}
        >
          <div
            style={{
              padding: "14px 20px",
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
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  backgroundColor: "rgba(0, 113, 227, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0071E3",
                }}
              >
                <Sparkles size={15} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1D1D1F" }}>
                  Profile Intelligence & Knowledge Base
                </h3>
                <span style={{ fontSize: 11, color: "#86868B" }}>
                  Hyper-personalizes live HUD teleprompter cues with your background
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                border: "none",
                background: "transparent",
                color: "#86868B",
                cursor: "pointer",
                padding: 4,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            <div
              style={{
                width: 180,
                borderRight: "1px solid rgba(0, 0, 0, 0.06)",
                backgroundColor: "#F8F9FA",
                padding: "10px 8px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {NAV_ITEMS.map((item) => {
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "7px 10px",
                      borderRadius: 7,
                      border: "none",
                      backgroundColor: isSelected ? "#FFFFFF" : "transparent",
                      color: isSelected ? "#0071E3" : "#475569",
                      fontSize: 12,
                      fontWeight: isSelected ? 650 : 500,
                      cursor: "pointer",
                      textAlign: "left",
                      boxShadow: isSelected ? "0 1px 3px rgba(0, 0, 0, 0.06)" : "none",
                      transition: "all 120ms ease",
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ flex: 1, padding: "18px 22px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
              {activeTab === "identity" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#86868B", textTransform: "uppercase" }}>
                      Full Name & Title
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 5 }}>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        style={{
                          padding: "7px 10px",
                          borderRadius: 7,
                          border: "1px solid rgba(0, 0, 0, 0.1)",
                          fontSize: 12,
                          outline: "none",
                          fontFamily: "inherit",
                          color: "#1D1D1F",
                        }}
                      />
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="Primary title/role"
                        style={{
                          padding: "7px 10px",
                          borderRadius: 7,
                          border: "1px solid rgba(0, 0, 0, 0.1)",
                          fontSize: 12,
                          outline: "none",
                          fontFamily: "inherit",
                          color: "#1D1D1F",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#86868B", textTransform: "uppercase" }}>
                      Elevator Bio & Core Focus
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        borderRadius: 7,
                        border: "1px solid rgba(0, 0, 0, 0.1)",
                        fontSize: 12,
                        marginTop: 5,
                        outline: "none",
                        fontFamily: "inherit",
                        color: "#1D1D1F",
                        resize: "none",
                        lineHeight: 1.45,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#86868B", textTransform: "uppercase" }}>
                      Primary Résumé Document (PDF / DOCX)
                    </label>
                    <div
                      style={{
                        marginTop: 6,
                        padding: "12px 14px",
                        borderRadius: 8,
                        border: "1.5px dashed rgba(0, 113, 227, 0.3)",
                        backgroundColor: "rgba(0, 113, 227, 0.03)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <FileText size={16} color="#0071E3" />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#1D1D1F" }}>
                            {uploadedResume || "Drag & drop your resume here"}
                          </div>
                          <span style={{ fontSize: 10.5, color: "#10B981", fontWeight: 600 }}>
                            Indexed into local Neural Engine vector memory
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setUploadedResume("Resume_Dimas_Prasetyo_2026.pdf")}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 6,
                          border: "1px solid rgba(0, 113, 227, 0.3)",
                          backgroundColor: "#FFFFFF",
                          color: "#0071E3",
                          fontSize: 11,
                          fontWeight: 650,
                          cursor: "pointer",
                        }}
                      >
                        Replace
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "profile" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#86868B", textTransform: "uppercase" }}>
                      Verified Technical Skills ({skills.length})
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                      {skills.map((skill) => (
                        <div
                          key={skill}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "3px 9px",
                            borderRadius: 999,
                            backgroundColor: "rgba(0, 113, 227, 0.08)",
                            border: "1px solid rgba(0, 113, 227, 0.2)",
                            color: "#0071E3",
                            fontSize: 11.5,
                            fontWeight: 600,
                          }}
                        >
                          <span>{skill}</span>
                          <button
                            onClick={() => handleRemoveSkill(skill)}
                            style={{
                              border: "none",
                              background: "transparent",
                              color: "#0071E3",
                              cursor: "pointer",
                              padding: 0,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleAddSkill} style={{ display: "flex", gap: 6, marginTop: 10 }}>
                      <input
                        type="text"
                        placeholder="Add skill (e.g. Distributed HNSW)..."
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        style={{
                          flex: 1,
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "1px solid rgba(0, 0, 0, 0.1)",
                          fontSize: 12,
                          outline: "none",
                          fontFamily: "inherit",
                        }}
                      />
                      <button
                        type="submit"
                        style={{
                          padding: "6px 12px",
                          borderRadius: 6,
                          border: "none",
                          backgroundColor: "#0071E3",
                          color: "#FFFFFF",
                          fontSize: 11.5,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Add
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === "roleinsight" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#86868B", textTransform: "uppercase" }}>
                      Target Role / Opportunity
                    </label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        borderRadius: 7,
                        border: "1px solid rgba(0, 0, 0, 0.1)",
                        fontSize: 12,
                        marginTop: 5,
                        outline: "none",
                        fontFamily: "inherit",
                        color: "#1D1D1F",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#86868B", textTransform: "uppercase" }}>
                      Target Job Description (JD)
                    </label>
                    <textarea
                      rows={5}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        borderRadius: 7,
                        border: "1px solid rgba(0, 0, 0, 0.1)",
                        fontSize: 12,
                        marginTop: 5,
                        outline: "none",
                        fontFamily: "inherit",
                        color: "#1D1D1F",
                        resize: "none",
                        lineHeight: 1.45,
                      }}
                    />
                  </div>
                </div>
              )}

              {activeTab === "company" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#86868B", textTransform: "uppercase" }}>
                      Company Name & Domain
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 5 }}>
                      <input
                        type="text"
                        value={targetCompany}
                        onChange={(e) => setTargetCompany(e.target.value)}
                        style={{
                          padding: "7px 10px",
                          borderRadius: 7,
                          border: "1px solid rgba(0, 0, 0, 0.1)",
                          fontSize: 12,
                          outline: "none",
                          fontFamily: "inherit",
                        }}
                      />
                      <input
                        type="text"
                        value={companyDomain}
                        onChange={(e) => setCompanyDomain(e.target.value)}
                        style={{
                          padding: "7px 10px",
                          borderRadius: 7,
                          border: "1px solid rgba(0, 0, 0, 0.1)",
                          fontSize: 12,
                          outline: "none",
                          fontFamily: "inherit",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#86868B", textTransform: "uppercase" }}>
                      Company Intel & Strategic Deal Context
                    </label>
                    <textarea
                      rows={4}
                      value={companyNotes}
                      onChange={(e) => setCompanyNotes(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        borderRadius: 7,
                        border: "1px solid rgba(0, 0, 0, 0.1)",
                        fontSize: 12,
                        marginTop: 5,
                        outline: "none",
                        fontFamily: "inherit",
                        resize: "none",
                        lineHeight: 1.45,
                      }}
                    />
                  </div>
                </div>
              )}

              {activeTab === "coverletter" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#86868B", textTransform: "uppercase" }}>
                      Generated Cover Letter Pitch
                    </label>
                    <div style={{ display: "flex", gap: 4 }}>
                      {(["confident", "formal", "technical"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setCoverTone(t)}
                          style={{
                            padding: "2px 7px",
                            borderRadius: 4,
                            border: `1px solid ${coverTone === t ? "#0071E3" : "rgba(0,0,0,0.08)"}`,
                            backgroundColor: coverTone === t ? "rgba(0, 113, 227, 0.08)" : "#FFFFFF",
                            color: coverTone === t ? "#0071E3" : "#6E6E73",
                            fontSize: 10.5,
                            fontWeight: coverTone === t ? 650 : 500,
                            cursor: "pointer",
                            textTransform: "capitalize",
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: 8,
                      backgroundColor: "#F8F9FB",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      fontSize: 12,
                      color: "#1E293B",
                      lineHeight: 1.55,
                    }}
                  >
                    Dear Hiring Team at {targetCompany},
                    <br /><br />
                    I am writing to express my strong interest in the {targetRole} position. With over 8 years architecting high-throughput distributed systems and sub-350ms real-time audio pipelines on Apple Silicon, I have repeatedly scaled vector indexing benchmarks to 99.4% recall at 38ms p99 query latency.
                    <br /><br />
                    Given your focus on low-latency AI copilots and BaFin-compliant on-device encryption, my background directly bridges the gap between machine learning research and rock-solid enterprise production.
                  </div>
                </div>
              )}

              {activeTab === "webgrounding" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#86868B", textTransform: "uppercase" }}>
                      Custom URLs for Real-Time Grounding
                    </label>
                    <textarea
                      rows={4}
                      value={customGroundingUrls}
                      onChange={(e) => setCustomGroundingUrls(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        borderRadius: 7,
                        border: "1px solid rgba(0, 0, 0, 0.1)",
                        fontSize: 12,
                        marginTop: 5,
                        outline: "none",
                        fontFamily: "ui-monospace, Menlo, monospace",
                        color: "#0F172A",
                        resize: "none",
                      }}
                    />
                    <span style={{ fontSize: 10.5, color: "#86868B", display: "block", marginTop: 4 }}>
                      Reality AI crawls these references in real-time to answer domain-specific questions during your meetings.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid rgba(0, 0, 0, 0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 8,
              backgroundColor: "#FAFAFA",
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid rgba(0, 0, 0, 0.1)",
                backgroundColor: "#FFFFFF",
                fontSize: 12,
                fontWeight: 600,
                color: "#475569",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: "none",
                backgroundColor: "#0071E3",
                fontSize: 12,
                fontWeight: 650,
                color: "#FFFFFF",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0, 113, 227, 0.3)",
              }}
            >
              {savedToast ? "Saved Profile!" : "Save Profile Knowledge"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
