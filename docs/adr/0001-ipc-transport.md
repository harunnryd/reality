# 1. Rust ↔ Python IPC over stdio JSON-RPC

## Status

Accepted

## Context

Reality splits work across two processes: the Tauri/Rust shell (windowing,
audio capture, screenshots) and a Python sidecar (LangChain/LangGraph
orchestration, RAG, vector search). They need a request/response channel plus
a way for the Python side to push unsolicited events (streaming LLM tokens)
back to the Rust side.

## Decision

Use the Python process's stdin/stdout as a newline-delimited JSON-RPC 2.0
channel, spawned via `tauri-plugin-shell`'s `Command`. stderr is reserved for
diagnostic logging and never carries protocol messages.

Streaming responses are modeled as notifications (`stream.chunk`,
`stream.done`) correlated by the original request's `id`, rather than trying
to stream inside a single JSON-RPC response.

Audio is never sent through this channel as raw PCM. The Rust side resamples,
runs VAD, and writes segmented WAV files to a temp directory; only the file
path and channel metadata (`mic`/`system`) cross the RPC boundary via a
`transcript.audioSegment` notification.

## Consequences

- No socket/pipe lifecycle to manage — `tauri-plugin-shell` owns spawn,
  stdin/stdout piping, and process cleanup.
- Rust-side calls to `Shell::command()` bypass the frontend permission ACL
  entirely (that ACL only gates `invoke()` calls from JS), so
  `capabilities/default.json` carries no shell permissions — the frontend
  never talks to the sidecar directly, only through `commands.rs`.
- The pydantic schema in `sidecar/app/rpc/schema.py` is the source of truth
  for the wire format; `src-tauri/src/sidecar/protocol.rs` mirrors it by hand
  and must be updated in lockstep.
