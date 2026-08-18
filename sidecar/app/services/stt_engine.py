from __future__ import annotations

import asyncio
import base64
import json
import sys
from typing import Any, Callable

from pydantic import BaseModel


class TranscriptResult(BaseModel):
    text: str
    is_final: bool
    confidence: float = 1.0
    speaker: str = "You (Live Mic)"


class DeepgramStreamingSTT:
    def __init__(self, emit_notification: Callable[[str, dict[str, Any]], None]) -> None:
        self._emit = emit_notification
        self._api_key: str = ""
        self._live: Any = None
        self._is_active = False
        self._buffer: list[bytes] = []
        self._keepalive_task: asyncio.Task | None = None

    @property
    def is_active(self) -> bool:
        return self._is_active

    async def configure(self, api_key: str) -> dict[str, Any]:
        self._api_key = api_key.strip()
        if not self._api_key:
            return {"status": "error", "message": "empty api key"}

        if self._is_active and self._live is not None:
            return {"status": "ok", "provider": "deepgram", "model": "nova-2", "reused": True}

        await self._connect()
        return {"status": "ok", "provider": "deepgram", "model": "nova-2"}

    async def _connect(self) -> None:
        await self.stop()

        try:
            from deepgram import DeepgramClient, LiveOptions, LiveTranscriptionEvents

            client = DeepgramClient(self._api_key)
            self._live = client.listen.asyncwebsocket.v("1")

            options = LiveOptions(
                model="nova-2",
                smart_format=True,
                interim_results=True,
                encoding="linear16",
                sample_rate=16000,
                channels=1,
                endpointing=300,
                utterance_end_ms=1000,
                vad_events=True,
            )

            self._live.on(LiveTranscriptionEvents.Open, self._on_open)
            self._live.on(LiveTranscriptionEvents.Transcript, self._on_transcript)
            self._live.on(LiveTranscriptionEvents.Close, self._on_close)
            self._live.on(LiveTranscriptionEvents.Error, self._on_error)

            started = await self._live.start(options)
            if started:
                self._is_active = True
                self._start_keepalive()
                self._log("connected to Deepgram Nova-2 via AsyncLiveWebSocket")
                await self._flush_buffer()
            else:
                self._log("failed to start Deepgram async connection")

        except Exception as exc:
            self._log(f"connection error: {exc}")
            self._is_active = False

    async def _on_open(self, *args: Any, **kwargs: Any) -> None:
        self._is_active = True
        self._log("websocket opened")
        if self._live:
            try:
                await self._live.send(json.dumps({"type": "KeepAlive"}))
            except Exception:
                pass
        await self._flush_buffer()

    async def _on_transcript(self, *args: Any, **kwargs: Any) -> None:
        try:
            result = kwargs.get("result")
            if not result:
                for a in args:
                    if hasattr(a, "channel"):
                        result = a
                        break

            if not result or not hasattr(result, "channel"):
                return

            alt = result.channel.alternatives[0]
            transcript = alt.transcript
            if not transcript or not transcript.strip():
                return

            is_final = getattr(result, "is_final", False) or getattr(result, "speech_final", False)
            confidence = getattr(alt, "confidence", 1.0)

            self._log(f"transcript received: {transcript.strip()}")

            self._emit(
                "transcript.delta",
                {
                    "text": transcript.strip(),
                    "speaker": "Meeting (Live)",
                    "is_final": is_final,
                    "confidence": confidence,
                    "channel": "mic",
                },
            )
        except Exception as exc:
            self._log(f"transcript parse error: {exc}")

    async def _on_close(self, *args: Any, **kwargs: Any) -> None:
        self._is_active = False
        self._log("websocket closed")

    async def _on_error(self, *args: Any, **kwargs: Any) -> None:
        self._log(f"websocket error: {args} {kwargs}")

    async def feed_audio(self, pcm_base64: str) -> None:
        try:
            raw = base64.b64decode(pcm_base64)
        except Exception:
            return

        if not self._is_active or self._live is None:
            self._buffer.append(raw)
            if len(self._buffer) > 500:
                self._buffer.pop(0)
            return

        try:
            await self._live.send(raw)
        except Exception as exc:
            self._log(f"send error: {exc}")

    async def _flush_buffer(self) -> None:
        if not self._live:
            return
        buffered = self._buffer[:]
        self._buffer.clear()
        for chunk in buffered:
            try:
                await self._live.send(chunk)
            except Exception:
                pass
        if buffered:
            self._log(f"flushed {len(buffered)} buffered chunks")

    async def stop(self) -> dict[str, Any]:
        self._is_active = False

        if self._keepalive_task and not self._keepalive_task.done():
            self._keepalive_task.cancel()
            self._keepalive_task = None

        if self._live:
            try:
                await self._live.finish()
            except Exception:
                pass
            self._live = None

        self._buffer.clear()
        self._log("stopped")
        return {"status": "ok"}

    def _start_keepalive(self) -> None:
        async def _keepalive_loop() -> None:
            while self._is_active and self._live:
                await asyncio.sleep(3)
                if self._is_active and self._live:
                    try:
                        await self._live.send(json.dumps({"type": "KeepAlive"}))
                    except Exception:
                        pass

        self._keepalive_task = asyncio.create_task(_keepalive_loop())

    def _log(self, message: str) -> None:
        print(f"[stt_engine] {message}", file=sys.stderr, flush=True)
