from __future__ import annotations

from app.graph.nodes.meeting_memory import meeting_memory_node
from app.graph.nodes.moment_router import moment_router_node
from app.graph.nodes.persona_reasoner import persona_reasoner_node
from app.graph.state import MeetingState


class MeetingGraphOrchestrator:
    def __init__(self) -> None:
        self.active_sessions: dict[str, MeetingState] = {}

    def get_or_create_session(
        self,
        session_id: str,
        title: str = "Live Meeting",
        persona: str = "tech",
        is_stealth: bool = False,
    ) -> MeetingState:
        if session_id not in self.active_sessions:
            self.active_sessions[session_id] = MeetingState(
                session_id=session_id,
                title=title,
                active_persona=persona,  # type: ignore[arg-type]
                is_stealth=is_stealth,
            )
        return self.active_sessions[session_id]

    async def process_utterance(
        self,
        session_id: str,
        speaker: str,
        text: str,
        channel: str = "speaker",
        is_interim: bool = False,
    ) -> MeetingState:
        state = self.get_or_create_session(session_id)
        state.add_utterance(speaker=speaker, text=text, channel=channel, is_interim=is_interim)  # type: ignore[arg-type]

        if not is_interim:
            await moment_router_node(state)
            if state.moment_action != "IDLE_DISCUSSION":
                await persona_reasoner_node(state)

        return state

    async def finalize_session(self, session_id: str) -> MeetingState:
        state = self.get_or_create_session(session_id)
        await meeting_memory_node(state)
        return state

    def remove_session(self, session_id: str) -> None:
        self.active_sessions.pop(session_id, None)
