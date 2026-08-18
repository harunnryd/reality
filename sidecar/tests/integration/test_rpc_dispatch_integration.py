from __future__ import annotations

import asyncio
import pytest
from app.main import dispatcher
from app.rpc.schema import RpcRequest


@pytest.mark.parametrize(
    ("method", "params", "expected_key"),
    [
        ("system.ping", {"hello": "world"}, "pong"),
        (
            "ai.process_utterance",
            {
                "session_id": "rpc-test-1",
                "speaker": "Interviewer",
                "text": "How do you optimize vector search latency?",
                "channel": "speaker",
            },
            "moment_action",
        ),
        (
            "ai.finalize_meeting",
            {"session_id": "rpc-test-1"},
            "executive_summary",
        ),
        (
            "ai.reset_session",
            {"session_id": "rpc-test-1"},
            "status",
        ),
    ],
)
def test_rpc_dispatch_roundtrip_table(method: str, params: dict, expected_key: str) -> None:
    async def _runner() -> None:
        req = RpcRequest(id="req-123", method=method, params=params)
        res = await dispatcher.dispatch(req)
        assert res.id == "req-123"
        assert res.error is None
        assert res.result is not None
        assert expected_key in res.result

    asyncio.run(_runner())
