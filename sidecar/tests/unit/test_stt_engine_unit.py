from __future__ import annotations

import asyncio
import base64
from app.services.stt_engine import DeepgramStreamingSTT

def test_stt_engine_empty_key():
    async def _runner():
        events = []
        engine = DeepgramStreamingSTT(lambda name, data: events.append((name, data)))
        result = await engine.configure("")
        assert result["status"] == "error"
        assert not engine.is_active

    asyncio.run(_runner())

def test_stt_engine_feed_audio_buffering():
    async def _runner():
        events = []
        engine = DeepgramStreamingSTT(lambda name, data: events.append((name, data)))
        pcm_bytes = b"\x00\x00" * 100
        pcm_b64 = base64.b64encode(pcm_bytes).decode("utf-8")

        await engine.feed_audio(pcm_b64)
        assert len(engine._buffer) == 1
        assert engine._buffer[0] == pcm_bytes

        stop_res = await engine.stop()
        assert stop_res["status"] == "ok"
        assert len(engine._buffer) == 0

    asyncio.run(_runner())
