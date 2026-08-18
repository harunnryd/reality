from __future__ import annotations

import asyncio
import pytest
from app.graph.orchestrator import MeetingGraphOrchestrator


@pytest.mark.parametrize(
    ("session_id", "persona", "question_utterance", "answer_utterance", "expected_action"),
    [
        (
            "sess-tech-1",
            "tech",
            "How do we handle memory leaks in long-running Node.js processes?",
            "We decided to take heap snapshots and bound all EventEmitter queues.",
            "TECHNICAL_EXPLANATION",
        ),
        (
            "sess-sales-1",
            "sales",
            "Why is your platform priced higher than competitor X?",
            "We agreed to provide volume discount on annual commitment.",
            "OBJECTION_OR_NEGOTIATION",
        ),
    ],
)
def test_orchestrator_multi_turn_session_integration(
    session_id: str,
    persona: str,
    question_utterance: str,
    answer_utterance: str,
    expected_action: str,
) -> None:
    async def _runner() -> None:
        orch = MeetingGraphOrchestrator()
        orch.get_or_create_session(session_id=session_id, title=f"Meeting {session_id}", persona=persona)

        turn_1 = await orch.process_utterance(
            session_id=session_id,
            speaker="Interviewer",
            text=question_utterance,
            channel="speaker",
        )
        assert turn_1.moment_action in (expected_action, "CODING_OR_SCREEN_PROBLEM")
        assert turn_1.current_suggestion is not None

        await orch.process_utterance(
            session_id=session_id,
            speaker="Candidate",
            text=answer_utterance,
            channel="mic",
        )
        await orch.process_utterance(
            session_id=session_id,
            speaker="Lead",
            text="Sarah Lin will send the summary deck before tomorrow.",
            channel="speaker",
        )

        finalized = await orch.finalize_session(session_id)
        assert len(finalized.utterances) == 3
        assert len(finalized.action_items) >= 1
        assert len(finalized.key_decisions) >= 1
        assert len(finalized.executive_summary) > 20

        orch.remove_session(session_id)
        assert session_id not in orch.active_sessions

    asyncio.run(_runner())
