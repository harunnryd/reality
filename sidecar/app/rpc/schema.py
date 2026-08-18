from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel


class RpcRequest(BaseModel):
    jsonrpc: Literal["2.0"] = "2.0"
    id: str
    method: str
    params: dict[str, Any] = {}


class RpcError(BaseModel):
    code: int
    message: str
    data: dict[str, Any] | None = None


class RpcResponse(BaseModel):
    jsonrpc: Literal["2.0"] = "2.0"
    id: str
    result: Any | None = None
    error: RpcError | None = None

    @classmethod
    def ok(cls, request_id: str, result: Any) -> "RpcResponse":
        return cls(id=request_id, result=result)

    @classmethod
    def fail(cls, request_id: str, code: int, message: str) -> "RpcResponse":
        return cls(id=request_id, error=RpcError(code=code, message=message))


class RpcNotification(BaseModel):
    jsonrpc: Literal["2.0"] = "2.0"
    method: str
    params: dict[str, Any] = {}


PARSE_ERROR = -32700
METHOD_NOT_FOUND = -32601
INVALID_PARAMS = -32602
INTERNAL_ERROR = -32000
