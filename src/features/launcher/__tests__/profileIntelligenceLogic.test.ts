import { describe, it, expect, beforeEach, vi } from "vitest";

export interface ProfileIntelligenceData {
  name: string;
  role: string;
  bio: string;
  skills: string[];
  targetRole: string;
  jobDescription: string;
  targetCompany: string;
  companyDomain: string;
  companyNotes: string;
}

const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  clear: () => {
    for (const k of Object.keys(mockStorage)) {
      delete mockStorage[k];
    }
  },
};
vi.stubGlobal("localStorage", localStorageMock);

const STORAGE_KEY = "reality_profile_intelligence_v1";

function calculateProfileCompleteness(profile: ProfileIntelligenceData): number {
  let score = 0;
  if (profile.name.trim()) score += 15;
  if (profile.role.trim()) score += 15;
  if (profile.bio.trim().length > 20) score += 20;
  if (profile.skills.length >= 3) score += 20;
  if (profile.targetRole.trim()) score += 15;
  if (profile.jobDescription.trim().length > 20) score += 15;
  return Math.min(100, score);
}

function matchSkillsToJobDescription(skills: string[], jdText: string): { matched: string[]; missing: string[] } {
  const lowerJd = jdText.toLowerCase();
  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of skills) {
    if (lowerJd.includes(skill.toLowerCase())) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  return { matched, missing };
}

function generateCoverLetterPitch(
  name: string,
  targetCompany: string,
  targetRole: string,
  tone: "confident" | "formal" | "technical"
): string {
  switch (tone) {
    case "confident":
      return `Dear ${targetCompany} Team,\n\nI am thrilled to apply for the ${targetRole} position. My background scaling distributed vector search pipelines makes me the ideal candidate to hit the ground running.`;
    case "formal":
      return `To the Hiring Committee at ${targetCompany},\n\nPlease accept this application for the position of ${targetRole}. With extensive engineering experience in low-latency infrastructure, I look forward to contributing to your organization.`;
    case "technical":
    default:
      return `Dear Engineering Team at ${targetCompany},\n\nI am writing regarding the ${targetRole} opportunity. Having architected sub-350ms streaming pipelines on Apple Silicon with 99.4% recall at 38ms p99 latency, my skill set aligns directly with your technical requirements.`;
  }
}

function parseWebGroundingUrls(rawText: string): string[] {
  return rawText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("http://") || line.startsWith("https://"));
}

describe("Launcher - Profile Intelligence & Knowledge Modal Unit Tests", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  const sampleProfile: ProfileIntelligenceData = {
    name: "Dimas Prasetyo",
    role: "Lead Systems Engineer",
    bio: "8+ years architecting high-throughput streaming systems and vector indexing pipelines.",
    skills: ["Distributed Systems", "Rust & Tauri", "Vector Search", "WebSockets"],
    targetRole: "Staff AI Infrastructure Engineer",
    jobDescription: "Building sub-350ms streaming speech synthesis and Vector Search pipelines.",
    targetCompany: "Horizon FinTech",
    companyDomain: "horizonfintech.io",
    companyNotes: "250-seat enterprise pilot with BaFin GDPR encryption.",
  };

  describe("Profile Completeness Score Calculation", () => {
    it("evaluates 100% score for complete profile", () => {
      expect(calculateProfileCompleteness(sampleProfile)).toBe(100);
    });

    it("evaluates partial score when fields are missing", () => {
      const partial = { ...sampleProfile, name: "", bio: "" };
      expect(calculateProfileCompleteness(partial)).toBe(65);
    });
  });

  describe("Skill Extraction & JD Matching", () => {
    it("matches skills mentioned in Job Description text", () => {
      const { matched, missing } = matchSkillsToJobDescription(sampleProfile.skills, sampleProfile.jobDescription);
      expect(matched).toContain("Vector Search");
      expect(missing).toContain("Rust & Tauri");
    });
  });

  describe("Cover Letter Pitch Generator by Tone", () => {
    const toneCases = [
      { tone: "technical" as const, expectedPhrase: "sub-350ms streaming pipelines" },
      { tone: "confident" as const, expectedPhrase: "ideal candidate to hit the ground running" },
      { tone: "formal" as const, expectedPhrase: "To the Hiring Committee" },
    ];

    it.each(toneCases)("generates pitch for $tone tone", ({ tone, expectedPhrase }) => {
      const letter = generateCoverLetterPitch(sampleProfile.name, sampleProfile.targetCompany, sampleProfile.targetRole, tone);
      expect(letter).toContain(expectedPhrase);
      expect(letter).toContain(sampleProfile.targetCompany);
      expect(letter).toContain(sampleProfile.targetRole);
    });
  });

  describe("Web Grounding URLs Parser", () => {
    it("parses and filters valid HTTP/HTTPS URLs", () => {
      const raw = "https://docs.reality.ai\n invalid-url \nhttps://developer.apple.com/machine-learning\n\n";
      const parsed = parseWebGroundingUrls(raw);
      expect(parsed).toEqual([
        "https://docs.reality.ai",
        "https://developer.apple.com/machine-learning",
      ]);
    });
  });

  describe("Profile Intelligence Local Storage Persistence", () => {
    it("saves and retrieves profile data to/from storage", () => {
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(sampleProfile));
      const retrieved = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!);
      expect(retrieved.name).toBe("Dimas Prasetyo");
      expect(retrieved.targetCompany).toBe("Horizon FinTech");
      expect(retrieved.skills.length).toBe(4);
    });
  });
});
