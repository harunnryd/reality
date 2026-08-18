import { Meeting, PersonaConfig, ActionItemDetail } from "../types";

const MEETINGS_STORAGE_KEY = "reality_saved_meetings_v8";

export const PERSONA_CONFIGS: Record<string, PersonaConfig> = {
  general: {
    id: "general",
    label: "General Assistant",
    description: "Adaptive note taking & conversational insights",
    icon: "sparkles",
    badgeColor: "blue",
  },
  tech: {
    id: "tech",
    label: "Tech & Architecture",
    description: "Deep dive code, schema review & system design",
    icon: "code",
    badgeColor: "purple",
  },
  sales: {
    id: "sales",
    label: "Sales & Client Pitch",
    description: "Objection handling, pricing & deal closing cues",
    icon: "trending-up",
    badgeColor: "green",
  },
  executive: {
    id: "executive",
    label: "Executive Briefing",
    description: "High-level summary, KPI tracking & risk items",
    icon: "shield",
    badgeColor: "amber",
  },
};

const SEED_MEETINGS: Meeting[] = [
  {
    id: "m-1",
    title: "Distributed Vector Search & Hybrid RAG Architecture Review",
    date: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    duration: "28m",
    persona: "tech",
    objective: "Evaluate HNSW vector index latency vs IVFFlat for 10M embeddings with sub-50ms p99 query constraint.",
    summary:
      "Benchmarked Qdrant vs pgvector for multi-tenant hybrid search. Agreed on HNSW m=16, ef_construction=64 with quantized FP16 embeddings. Validated SOC2-compliant encryption at rest with customer-managed keys (BYOK).",
    consensus:
      "Deploy dedicated Qdrant cluster on AWS eu-central-1 with dual-write fallback. Ship private beta build by Friday.",
    attendees: [
      { name: "Sarah Lin", role: "VP Engineering", talkRatio: 40 },
      { name: "Erik Larson", role: "Staff Audio Engineer", talkRatio: 30 },
      { name: "Alex Chen", role: "Security Architect", talkRatio: 20 },
      { name: "Dimas Prasetyo", role: "Lead Backend", talkRatio: 10 },
    ],
    actionItems: [
      {
        id: "act-1",
        text: "Benchmark vector index recall on 10M test dataset with payload filtering",
        completed: false,
        assignee: "Dimas Prasetyo",
        priority: "high",
        dueDate: "Tomorrow, 5 PM",
      },
      {
        id: "act-2",
        text: "Draft Terraform infra definition for isolated VPC peering",
        completed: false,
        assignee: "Alex Chen",
        priority: "medium",
        dueDate: "Thursday",
      },
    ],
    keyPoints: [
      {
        id: "dec-1",
        decision: "Adopt HNSW index with FP16 scalar quantization for vector search",
        rationale: "Reduces memory footprint by 52% with less than 0.8% recall degradation across 10M vectors.",
      },
    ],
  },
  {
    id: "m-2",
    title: "Enterprise Pilot Negotiation: Horizon FinTech Global Rollout",
    date: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    duration: "42m",
    persona: "sales",
    objective: "Demo hardware-undetectable stealth HUD, address compliance objections, and finalize 250-seat annual contract terms.",
    summary:
      "Walked through real-time speech assistance during live board presentations. Addressed compliance requirements regarding EU BaFin financial regulatory constraints and BYOK key rotation. Client agreed to initiate 250-seat enterprise pilot.",
    consensus:
      "Deliver custom security whitepaper and sign SOC2 Type II mutual DPA before Friday. Provision dedicated EU tenant.",
    attendees: [
      { name: "David Vance", role: "VP Tech, Horizon FinTech", talkRatio: 45 },
      { name: "Elena Rostova", role: "Head of Compliance", talkRatio: 35 },
      { name: "Rahmat Hidayat", role: "Enterprise Account Exec", talkRatio: 20 },
    ],
    actionItems: [
      {
        id: "act-4",
        text: "Send countersigned SOC2 Type II compliance package and Enterprise DPA",
        completed: true,
        assignee: "Rahmat Hidayat",
        priority: "high",
        dueDate: "Today, 6 PM",
      },
    ],
    keyPoints: [
      {
        id: "dec-3",
        decision: "250-seat pilot approved with single-tenant VPC deployment in Frankfurt",
        rationale: "Complies with EU BaFin financial regulatory constraints requiring European data sovereignty.",
      },
    ],
  },
  {
    id: "m-3",
    title: "Growth & Marketing Strategy: ProductHunt Private Beta Campaign",
    date: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    duration: "45m",
    persona: "executive",
    objective: "Align on ProductHunt launch schedule, influencer outreach, and viral referral loops.",
    summary:
      "Evaluated ProductHunt launch collateral and demo videos showcasing sub-350ms streaming AI reasoning on Apple Silicon. Finalized launch date and community tier pricing.",
    consensus:
      "Launch ProductHunt campaign next Tuesday at 12:01 AM PST.",
    attendees: [
      { name: "Maya Anderson", role: "CEO", talkRatio: 40 },
      { name: "Kevin Wijaya", role: "Head of Product", talkRatio: 35 },
      { name: "Amanda Cole", role: "CFO", talkRatio: 25 },
    ],
    actionItems: [
      {
        id: "act-6",
        text: "Finalize ProductHunt gallery screenshots and founder comment",
        completed: false,
        assignee: "Kevin Wijaya",
        priority: "high",
        dueDate: "Monday",
      },
    ],
    keyPoints: [
      {
        id: "dec-4",
        decision: "Offer exclusive early bird lifetime pricing for top 500 ProductHunt supporters",
        rationale: "Maximizes upfront day-1 upvotes and viral referral distribution.",
      },
    ],
  },
  {
    id: "m-4",
    title: "On-Device Inference: CoreML Whisper Engine Acceleration",
    date: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    duration: "30m",
    persona: "tech",
    objective: "Optimize Apple Neural Engine (ANE) memory residency for CoreML Whisper large-v3-turbo.",
    summary:
      "Benchmarked CoreML Whisper on M3 Max and M4 chips. Achieved 110ms on-device transcription latency with zero network dependency and zero battery drain.",
    consensus:
      "Ship CoreML Whisper as default local fallback for offline air-gapped enterprise environments.",
    attendees: [
      { name: "Erik Larson", role: "Staff Audio Engineer", talkRatio: 50 },
      { name: "Sarah Lin", role: "VP Engineering", talkRatio: 30 },
      { name: "Alex Chen", role: "Security Architect", talkRatio: 20 },
    ],
    actionItems: [
      {
        id: "act-7",
        text: "Package CoreML quantized weights into standalone asset bundle",
        completed: true,
        assignee: "Erik Larson",
        priority: "high",
        dueDate: "Completed",
      },
    ],
    keyPoints: [
      {
        id: "dec-5",
        decision: "Default to CoreML Whisper when network connectivity drops below 200kbps",
        rationale: "Guarantees zero-dropout real-time transcription in unstable conference Wi-Fi.",
      },
    ],
  },
  {
    id: "m-5",
    title: "Production Infrastructure: PostgreSQL 16 Zero-Downtime Database Cutover",
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    duration: "40m",
    persona: "tech",
    objective: "Execute blue-green cutover to managed PostgreSQL 16 cluster with logical replication.",
    summary:
      "Completed live replication sync and cutover to PostgreSQL 16 with pgvector extension enabled. Total database cutover completed with 0 dropped queries and 42ms failover time.",
    consensus:
      "Decommission legacy PostgreSQL 14 instance after 7-day rollback verification window.",
    attendees: [
      { name: "Dimas Prasetyo", role: "Lead Backend", talkRatio: 60 },
      { name: "Sarah Lin", role: "VP Engineering", talkRatio: 40 },
    ],
    actionItems: [
      {
        id: "act-8",
        text: "Set up automated pg_dump snapshot cron on AWS S3 with KMS encryption",
        completed: true,
        assignee: "Dimas Prasetyo",
        priority: "medium",
        dueDate: "Completed",
      },
    ],
    keyPoints: [
      {
        id: "dec-6",
        decision: "Enable PostgreSQL query performance insights and connection pooling",
        rationale: "Reduces peak connection overhead by 70% during simultaneous meeting spikes.",
      },
    ],
  },
  {
    id: "m-6",
    title: "Security & Compliance: Healthcare HIPAA Certification Audit",
    date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    duration: "50m",
    persona: "executive",
    objective: "Audit BAA contracts and on-device ephemeral audio storage for Healthcare HIPAA compliance.",
    summary:
      "Third-party audit team verified that Reality operates strictly with Zero-Data Retention (ZDR). No Protected Health Information (PHI) is ever saved to persistent disk or transmitted to unapproved third-party servers.",
    consensus:
      "Execute formal Healthcare HIPAA Business Associate Agreement (BAA) for medical enterprise customers.",
    attendees: [
      { name: "Alex Chen", role: "Security Architect", talkRatio: 45 },
      { name: "Maya Anderson", role: "CEO", talkRatio: 35 },
      { name: "Dr. Gregory House", role: "Chief Medical Officer", talkRatio: 20 },
    ],
    actionItems: [
      {
        id: "act-9",
        text: "Publish Healthcare HIPAA compliance trust center page on reality.ai",
        completed: false,
        assignee: "Alex Chen",
        priority: "high",
        dueDate: "Friday",
      },
    ],
    keyPoints: [
      {
        id: "dec-7",
        decision: "Provide dedicated HIPAA-compliant BAA signing workflow in Enterprise Settings",
        rationale: "Unlocks enterprise medical and clinical trial customer onboarding.",
      },
    ],
  },
  {
    id: "m-7",
    title: "Candidate Final Round: Staff ML Compiler Engineer",
    date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    duration: "55m",
    persona: "tech",
    objective: "Assess systems-level understanding of Apple Silicon GPU metal shading and quantization kernels.",
    summary:
      "Deep dive interview on custom Metal kernels for 4-bit matrix multiplication. Candidate demonstrated deep expertise with Apple unified memory architecture and SIMD group matrix operations.",
    consensus:
      "Strong hire recommendation for Staff ML Compiler Engineer position.",
    attendees: [
      { name: "Sarah Lin", role: "VP Engineering", talkRatio: 30 },
      { name: "Daniel Richter", role: "Staff ML Candidate", talkRatio: 60 },
      { name: "Alex Chen", role: "Security Architect", talkRatio: 10 },
    ],
    actionItems: [
      {
        id: "act-10",
        text: "Compile interview debrief feedback and send formal offer letter",
        completed: false,
        assignee: "Sarah Lin",
        priority: "high",
        dueDate: "Monday",
      },
    ],
    keyPoints: [
      {
        id: "dec-8",
        decision: "Extend formal offer with $210k base + equity package",
        rationale: "Candidate scored top 1% on custom Metal Performance Shaders benchmark test.",
      },
    ],
  },
  {
    id: "m-8",
    title: "Series A Investor Pitch: Lightspeed Venture Partners",
    date: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    duration: "60m",
    persona: "sales",
    objective: "Pitch Reality AI platform vision, unit economics, and enterprise ARR trajectory.",
    summary:
      "Demonstrated live stealth overlay and real-time meeting assistance. Partner expressed strong interest in leading the $12M Series A round with syndicate participation.",
    consensus:
      "Deliver data room access and updated 24-month financial model by Wednesday.",
    attendees: [
      { name: "Maya Anderson", role: "CEO", talkRatio: 50 },
      { name: "Michael Moritz", role: "Partner, Lightspeed", talkRatio: 40 },
      { name: "Amanda Cole", role: "CFO", talkRatio: 10 },
    ],
    actionItems: [
      {
        id: "act-11",
        text: "Grant data room access and send 5-year cohort retention analysis",
        completed: true,
        assignee: "Amanda Cole",
        priority: "high",
        dueDate: "Wednesday",
      },
    ],
    keyPoints: [
      {
        id: "dec-9",
        decision: "Target $12M round at $60M post-money valuation cap",
        rationale: "Maintains founder ownership while securing 36 months of high-velocity runway.",
      },
    ],
  },
  {
    id: "m-9",
    title: "Product Design Review: Dark Mode & Glassmorphism Aesthetics",
    date: new Date(Date.now() - 1000 * 60 * 60 * 144).toISOString(),
    duration: "35m",
    persona: "general",
    objective: "Review Apple HIG-compliant glassmorphism overlay and HUD micro-animations.",
    summary:
      "Approved high-contrast typography, SF Pro font metrics, and vibrant accent colors. Refined HUD minimize/maximize spring physics for 120Hz ProMotion displays.",
    consensus:
      "Adopt unified Apple Design System tokens across all React components.",
    attendees: [
      { name: "Kevin Wijaya", role: "Head of Product", talkRatio: 60 },
      { name: "Sarah Lin", role: "VP Engineering", talkRatio: 40 },
    ],
    actionItems: [
      {
        id: "act-12",
        text: "Audit contrast ratios across dark mode overlay themes",
        completed: true,
        assignee: "Kevin Wijaya",
        priority: "medium",
        dueDate: "Thursday",
      },
    ],
    keyPoints: [
      {
        id: "dec-10",
        decision: "Enforce WCAG AAA 7:1 contrast ratio on all real-time transcript cues",
        rationale: "Ensures maximum legibility during intense high-speed executive presentations.",
      },
    ],
  },
  {
    id: "m-10",
    title: "Weekly Engineering All-Hands: Sprint Retrospective & OKR Check-in",
    date: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(),
    duration: "45m",
    persona: "tech",
    objective: "Review sprint deliverables, close out critical bug tickets, and celebrate v0.1.0 milestone.",
    summary:
      "All 14 sprint engineering deliverables completed on schedule. Audio resampler, stealth window, and active process detection modules merged to main with 100% test pass rate.",
    consensus:
      "Begin multi-agent AI reasoning engine development in sprint 15.",
    attendees: [
      { name: "Sarah Lin", role: "VP Engineering", talkRatio: 30 },
      { name: "Dimas Prasetyo", role: "Lead Backend", talkRatio: 25 },
      { name: "Erik Larson", role: "Staff Audio Engineer", talkRatio: 25 },
      { name: "Alex Chen", role: "Security Architect", talkRatio: 20 },
    ],
    actionItems: [
      {
        id: "act-13",
        text: "Celebrate v0.1.0 release milestone with team dinner",
        completed: false,
        assignee: "Sarah Lin",
        priority: "low",
        dueDate: "Friday",
      },
    ],
    keyPoints: [
      {
        id: "dec-11",
        decision: "Freeze Rust core native API and transition focus to LangGraph multi-agent engine",
        rationale: "Provides solid, stable foundation for advanced real-time LLM reasoning.",
      },
    ],
  },
];

export const meetingsService = {
  getMeetings(): Meeting[] {
    try {
      const stored = localStorage.getItem(MEETINGS_STORAGE_KEY);
      if (!stored) {
        this.saveMeetings(SEED_MEETINGS);
        return SEED_MEETINGS;
      }
      return JSON.parse(stored);
    } catch {
      return SEED_MEETINGS;
    }
  },

  getMeetingById(id: string): Meeting | undefined {
    const meetings = this.getMeetings();
    return meetings.find((m) => m.id === id);
  },

  saveMeetings(meetings: Meeting[]): void {
    try {
      localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(meetings));
    } catch {}
  },

  saveMeeting(meeting: Meeting): void {
    const current = this.getMeetings();
    const exists = current.some((m) => m.id === meeting.id);
    const updated = exists ? current.map((m) => (m.id === meeting.id ? meeting : m)) : [meeting, ...current];
    this.saveMeetings(updated);
  },

  addMeeting(meeting: Omit<Meeting, "id" | "date">): Meeting {
    const newMeeting: Meeting = {
      ...meeting,
      id: `m-${Date.now()}`,
      date: new Date().toISOString(),
    };
    const current = this.getMeetings();
    const updated = [newMeeting, ...current];
    this.saveMeetings(updated);
    return newMeeting;
  },

  updateActionItemStatus(meetingId: string, actionId: string, completed: boolean): void {
    const meetings = this.getMeetings();
    const updated = meetings.map((m) => {
      if (m.id === meetingId) {
        return {
          ...m,
          actionItems: (m.actionItems || []).map((a: string | ActionItemDetail) => {
            if (typeof a === "string") {
              return a;
            }
            return a.id === actionId ? { ...a, completed } : a;
          }),
        };
      }
      return m;
    });
    this.saveMeetings(updated);
  },

  deleteMeeting(id: string): void {
    const current = this.getMeetings();
    const updated = current.filter((m) => m.id !== id);
    this.saveMeetings(updated);
  },
};
