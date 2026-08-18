from __future__ import annotations

import asyncio
import json
import sys

from pydantic import ValidationError

from app.rpc.dispatcher import Dispatcher
from app.rpc.schema import INTERNAL_ERROR, PARSE_ERROR, RpcError, RpcRequest, RpcResponse
from app.services import credentials_service

dispatcher = Dispatcher()


@dispatcher.method("system.ping")
async def handle_ping(params: dict) -> dict:
    return {"pong": True, "echo": params}


@dispatcher.method("credentials.validate_openai_key")
async def handle_validate_openai_key(params: dict) -> dict:
    return await credentials_service.validate_openai_key(params.get("api_key", ""))


def log(message: str) -> None:
    print(message, file=sys.stderr, flush=True)


def write_message(message: RpcResponse) -> None:
    sys.stdout.write(message.model_dump_json(exclude_none=True) + "\n")
    sys.stdout.flush()


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
    except Exception as exc:  # noqa: BLE001
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
