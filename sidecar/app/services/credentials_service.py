from __future__ import annotations

import httpx

OPENAI_MODELS_URL = "https://api.openai.com/v1/models"
OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions"


async def validate_openai_key(api_key: str) -> dict:
    clean_key = (api_key or "").strip()
    if not clean_key:
        return {"valid": False, "error": "API key cannot be empty"}

    # Basic structural check
    if not (clean_key.startswith("sk-") or clean_key.startswith("sess-")):
        return {"valid": False, "error": "OpenAI API keys typically start with 'sk-'"}

    headers = {
        "Authorization": f"Bearer {clean_key}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            # 1. Probe /v1/models first (fastest, 0 token cost)
            resp = await client.get(OPENAI_MODELS_URL, headers=headers)

            if resp.status_code == 200:
                return {"valid": True}

            # If models endpoint returned 401 or 403 (e.g., project-restricted / fine-grained keys),
            # verify via minimal chat completion probe (gpt-4o-mini, 1 token)
            probe_resp = await client.post(
                OPENAI_CHAT_URL,
                headers=headers,
                json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": "ping"}],
                    "max_tokens": 1,
                },
            )

            if probe_resp.status_code == 200:
                return {"valid": True}

            # 429 indicates rate limit / quota exceeded, but confirms the API key is VALID
            if probe_resp.status_code == 429:
                return {"valid": True}

            # Extract detailed error message from OpenAI response
            for r in (probe_resp, resp):
                try:
                    data = r.json()
                    err_message = data.get("error", {}).get("message")
                    if err_message:
                        return {"valid": False, "error": err_message}
                except Exception:
                    pass

            if resp.status_code == 401 or probe_resp.status_code == 401:
                return {"valid": False, "error": "Invalid API key. Please check your key on platform.openai.com"}

            return {"valid": False, "error": f"Validation failed with status {resp.status_code}"}

    except httpx.RequestError as exc:
        return {"valid": False, "error": f"Network error connecting to OpenAI: {exc}"}
