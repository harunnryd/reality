from __future__ import annotations

import asyncio
import json
import sys

from pydantic import ValidationError

from app.graph.orchestrator import MeetingGraphOrchestrator
from app.rpc.dispatcher import Dispatcher
from app.rpc.schema import INTERNAL_ERROR, PARSE_ERROR, RpcError, RpcNotification, RpcRequest, RpcResponse
from app.services import credentials_service
from app.services.stt_engine import DeepgramStreamingSTT

dispatcher = Dispatcher()
orchestrator = MeetingGraphOrchestrator()


def write_message(message: RpcResponse | RpcNotification) -> None:
    sys.stdout.write(message.model_dump_json(exclude_none=True) + "\n")
    sys.stdout.flush()


def emit_notification(method: str, params: dict) -> None:
    write_message(RpcNotification(method=method, params=params))


stt_engine = DeepgramStreamingSTT(emit_notification)


@dispatcher.method("system.ping")
async def handle_ping(params: dict) -> dict:
    return {"pong": True, "echo": params}


@dispatcher.method("credentials.validate_openai_key")
async def handle_validate_openai_key(params: dict) -> dict:
    return await credentials_service.validate_openai_key(params.get("api_key", ""))


@dispatcher.method("ai.process_utterance")
async def handle_process_utterance(params: dict) -> dict:
    session_id = params.get("session_id", "default")
    speaker = params.get("speaker", "Speaker")
    text = params.get("text", "")
    channel = params.get("channel", "speaker")
    is_interim = params.get("is_interim", False)

    state = await orchestrator.process_utterance(
        session_id=session_id,
        speaker=speaker,
        text=text,
        channel=channel,
        is_interim=is_interim,
    )
    return {
        "moment_action": state.moment_action,
        "latest_detected_question": state.latest_detected_question,
        "current_suggestion": state.current_suggestion.model_dump() if state.current_suggestion else None,
    }


@dispatcher.method("ai.finalize_meeting")
async def handle_finalize_meeting(params: dict) -> dict:
    session_id = params.get("session_id", "default")
    state = await orchestrator.finalize_session(session_id)
    return {
        "session_id": state.session_id,
        "title": state.title,
        "executive_summary": state.executive_summary,
        "action_items": [a.model_dump() for a in state.action_items],
        "key_decisions": [d.model_dump() for d in state.key_decisions],
    }


@dispatcher.method("ai.reset_session")
async def handle_reset_session(params: dict) -> dict:
    session_id = params.get("session_id", "default")
    orchestrator.remove_session(session_id)
    return {"status": "ok", "session_id": session_id}


@dispatcher.method("stt.configure")
async def handle_stt_configure(params: dict) -> dict:
    api_key = params.get("api_key", "")
    return await stt_engine.configure(api_key)


@dispatcher.method("stt.stop")
async def handle_stt_stop(params: dict) -> dict:
    return await stt_engine.stop()


@dispatcher.method("audio.chunk")
async def handle_audio_chunk(params: dict) -> dict:
    pcm_base64 = params.get("pcm_base64", "")
    session_id = params.get("session_id", "default")
    if pcm_base64:
        stt_engine.feed_audio(pcm_base64)
    return {"status": "ok"}


def log(message: str) -> None:
    print(message, file=sys.stderr, flush=True)


async def handle_line(line: str) -> None:
    try:
        payload = json.loads(line)
    except json.JSONDecodeError as exc:
        log(f"parse error: {exc}")
        return

    try:
        request = RpcRequest.model_validate(payload)
    except ValidationError as exc:
        log(f"invalid request: {exc}")
        write_message(
            RpcResponse(
                id=str(payload.get("id", "")),
                error=RpcError(code=PARSE_ERROR, message="invalid request shape"),
            )
        )
        return

    try:
        response = await dispatcher.dispatch(request)
    except Exception as exc:
        log(f"handler error for {request.method}: {exc}")
        response = RpcResponse.fail(request.id, INTERNAL_ERROR, str(exc))

    write_message(response)


async def main() -> None:
    log("reality-sidecar: ready")
    loop = asyncio.get_running_loop()
    reader = asyncio.StreamReader()
    protocol = asyncio.StreamReaderProtocol(reader)
    await loop.connect_read_pipe(lambda: protocol, sys.stdin)

    pending: set[asyncio.Task] = set()

    while True:
        line = await reader.readline()
        if not line:
            break
        stripped = line.decode("utf-8").strip()
        if not stripped:
            continue
        task = asyncio.create_task(handle_line(stripped))
        pending.add(task)
        task.add_done_callback(pending.discard)

    if pending:
        await asyncio.gather(*pending)

    log("reality-sidecar: stdin closed, exiting")


if __name__ == "__main__":
    asyncio.run(main())
