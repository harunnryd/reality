from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import Any

from app.rpc.schema import METHOD_NOT_FOUND, RpcError, RpcRequest, RpcResponse

Handler = Callable[[dict[str, Any]], Awaitable[Any]]


class Dispatcher:
    def __init__(self) -> None:
        self._handlers: dict[str, Handler] = {}

    def register(self, method: str, handler: Handler) -> None:
        self._handlers[method] = handler

    def method(self, name: str) -> Callable[[Handler], Handler]:
        def decorator(handler: Handler) -> Handler:
            self.register(name, handler)
            return handler

        return decorator

    async def dispatch(self, request: RpcRequest) -> RpcResponse:
        handler = self._handlers.get(request.method)
        if handler is None:
            return RpcResponse(
                id=request.id,
                error=RpcError(
                    code=METHOD_NOT_FOUND,
                    message=f"unknown method: {request.method}",
                ),
            )
        result = await handler(request.params)
        return RpcResponse.ok(request.id, result)

    async def dispatch_notification(self, method: str, params: dict[str, Any]) -> None:
        handler = self._handlers.get(method)
        if handler is not None:
            await handler(params)
