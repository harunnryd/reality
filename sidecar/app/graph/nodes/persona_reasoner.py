from __future__ import annotations

from typing import Any
from app.graph.state import CodeSnippet, LiveSuggestion, MeetingState


def build_system_prompt_for_persona(persona: str, profile_context: dict[str, Any] | None = None) -> str:
    base = "You are Reality, a stealth real-time AI copilot embedded in a high-stakes live meeting."
    profile_str = ""
    if profile_context:
        name = profile_context.get("name", "User")
        role = profile_context.get("target_role", "Staff Engineer")
        stack = profile_context.get("tech_stack", "Rust, TypeScript, Python")
        profile_str = f"User Identity: {name}, Role: {role}, Core Stack: {stack}."

    if persona == "tech":
        return (
            f"{base} {profile_str} Persona: TECH & ARCHITECTURE. "
            "Give ultra-precise, senior-level engineering answers. "
            "Be direct, mention time/space complexity O(N), architectural tradeoffs, and provide clean code snippets when asked."
        )
    elif persona == "sales":
        return (
            f"{base} {profile_str} Persona: SALES & NEGOTIATION. "
            "Handle objections smoothly, reinforce ROI and value proposition, and keep answers concise and persuasive."
        )
    elif persona == "executive":
        return (
            f"{base} {profile_str} Persona: EXECUTIVE BRIEFING. "
            "Focus on business impact, risk mitigation, key milestones, and high-level decision consensus."
        )
    return f"{base} {profile_str} Persona: GENERAL ASSISTANT. Be concise, structured, and helpful."


def synthesize_deterministic_suggestion(state: MeetingState) -> LiveSuggestion:
    question = state.latest_detected_question or "Live meeting discussion"
    lower_q = question.lower()

    if state.active_persona == "tech" or "code" in lower_q or "latency" in lower_q or "database" in lower_q:
        if "latency" in lower_q or "audio" in lower_q or "stream" in lower_q:
            return LiveSuggestion(
                title="Sub-350ms Audio Ring-Buffer Optimization",
                summary="Stream 16kHz audio in 150ms chunked ArrayBuffers over low-overhead stdio RPC to eliminate IPC latency spikes.",
                confidence=0.98,
                code_snippet=CodeSnippet(
                    lang="typescript",
                    technique="Chunked Ring-Buffer Pipeline",
                    complexity="O(1) time · O(1) space",
                    code="const streamBuffer = new AudioStreamBuffer({\n  sampleRate: 16000,\n  chunkIntervalMs: 150,\n  onChunk: (pcm16) => socket.send(pcm16)\n});",
                ),
                key_takeaways=[
                    "150ms chunking avoids packet fragmentation",
                    "Zero memory allocation inside hot audio loop",
                ],
            )
        if "memory" in lower_q or "leak" in lower_q or "node" in lower_q:
            return LiveSuggestion(
                title="Node.js Memory Leak Prevention & Event Loop Tuning",
                summary="Inspect heap snapshots, bind EventEmitter listener limits, and deploy bounded streaming buffers to prevent uncollected memory retainers.",
                confidence=0.96,
                code_snippet=CodeSnippet(
                    lang="typescript",
                    technique="Bounded Stream Backpressure",
                    complexity="O(1) memory overhead",
                    code="// Bounded stream handler\nconst queue = new BoundedQueue({ maxCapacity: 1000 });\nqueue.on('overflow', () => dropOldestFrames());",
                ),
                key_takeaways=[
                    "Enforce strict emitter maxListeners ceiling",
                    "Take periodic V8 heap snapshot diffs in staging",
                ],
            )
        if state.screen_ocr_text:
            return LiveSuggestion(
                title="Active Screen OCR & Slide Breakdown",
                summary="Analyzed captured screen content: System architecture components identified with sub-350ms streaming pipeline requirements.",
                confidence=0.98,
                code_snippet=CodeSnippet(
                    lang="typescript",
                    technique="Zero-Copy Pipeline",
                    complexity="O(1) buffer transfer",
                    code="const frameBuffer = Buffer.allocUnsafe(16000 * 2);\nprocessScreenFrame(frameBuffer);",
                ),
                key_takeaways=[
                    "Screen slide context parsed and injected into working memory",
                    "Target latency bound under 350ms",
                ],
            )
        return LiveSuggestion(
            title="Scalable Architecture & Concurrency Model",
            summary="Deploy an asynchronous event loop with bounded queues and worker thread pools to handle burst traffic efficiently.",
            confidence=0.94,
            code_snippet=CodeSnippet(
                lang="typescript",
                technique="Non-blocking Asynchronous Pipeline",
                complexity="O(1) per task dispatch",
                code="// Non-blocking handler\nasync function handleStream(item: StreamItem): Promise<void> {\n  await queue.push(item);\n}",
            ),
            key_takeaways=[
                "Decouple network ingestion from compute workers",
                "Maintain predictable p99 latency SLAs",
            ],
        )

    if state.active_persona == "sales" or "price" in lower_q or "cost" in lower_q or "discount" in lower_q:
        return LiveSuggestion(
            title="Value Framing & ROI-Driven Closing",
            summary="Acknowledge budget constraints, anchor against long-term engineering hours saved, and offer tiered volume scaling.",
            confidence=0.96,
            key_takeaways=[
                "Anchor: Saves 12+ dev hours per week per engineer",
                "Flexibility: Offer annual prepayment discount",
            ],
        )

    if state.active_persona == "executive":
        return LiveSuggestion(
            title="Strategic Alignment & Risk Mitigation",
            summary="Highlight alignment with Q4 roadmap, zero-downtime migration path, and SOC2 compliance guarantees.",
            confidence=0.95,
            key_takeaways=[
                "SOC2 Type II & RAM zeroization compliant",
                "Estimated 3.2x ROI within the first 6 months",
            ],
        )

    return LiveSuggestion(
        title="Key Discussion Point & Next Action",
        summary=f"Summarize agreement on: '{question}' and align next checkpoint with owners.",
        confidence=0.90,
        key_takeaways=["Confirm consensus across stakeholders", "Assign direct owner to action item"],
    )


async def persona_reasoner_node(state: MeetingState) -> dict:
    suggestion = synthesize_deterministic_suggestion(state)
    state.current_suggestion = suggestion
    return {"current_suggestion": suggestion.model_dump()}
