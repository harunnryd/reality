from __future__ import annotations

from app.graph.coding_contract import verify_code_snippet_contract
from app.graph.fusion_engine import ContextBlock, ContextFusionEngine
from app.graph.nodes.meeting_memory import meeting_memory_node
from app.graph.nodes.moment_router import moment_router_node
from app.graph.nodes.persona_reasoner import persona_reasoner_node
from app.graph.speakability import format_human_spoken_answer
from app.graph.state import MeetingState


class MeetingGraphOrchestrator:
    def __init__(self) -> None:
        self.active_sessions: dict[str, MeetingState] = {}
        self.fusion_engine = ContextFusionEngine()

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
                blocks: list[ContextBlock] = [
                    ContextBlock(source="live_transcript_hot", content=state.get_hot_transcript_text()),
                ]
                if state.screen_ocr_text:
                    blocks.append(ContextBlock(source="screen_ocr", content=state.screen_ocr_text))
                if state.profile_context:
                    profile_str = ", ".join(f"{k}: {v}" for k, v in state.profile_context.items())
                    blocks.append(ContextBlock(source="profile_identity", content=profile_str))

                self.fusion_engine.fuse(blocks, token_budget=1500)
                await persona_reasoner_node(state)

                if state.current_suggestion:
                    state.current_suggestion.summary = format_human_spoken_answer(
                        state.current_suggestion.summary,
                        persona=state.active_persona,
                        max_sentences=2,
                    )
                    if state.current_suggestion.code_snippet:
                        verify_code_snippet_contract(state.current_suggestion.code_snippet)

        return state

    async def finalize_session(self, session_id: str) -> MeetingState:
        state = self.get_or_create_session(session_id)
        await meeting_memory_node(state)
        return state

    def remove_session(self, session_id: str) -> None:
        self.active_sessions.pop(session_id, None)
