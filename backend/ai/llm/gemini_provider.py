import json
import urllib.request
import urllib.error
from typing import Any, Dict, List, Optional
from ai.llm.base import BaseLLMProvider, ChatMessage, LLMResponse, ToolDefinition


class GeminiProvider(BaseLLMProvider):
    """
    Google Gemini API provider using Python standard library (urllib.request)
    for zero third-party dependency footprint and maximum environment stability.
    """

    def __init__(self, config):
        self.config = config
        self.api_key = config.api_key
        self.model = config.model or "gemini-2.5-flash"
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"

    def _convert_tools_to_gemini(self, tools: List[ToolDefinition]) -> List[Dict[str, Any]]:
        function_declarations = []
        for t in tools:
            function_declarations.append({
                "name": t.name,
                "description": t.description,
                "parameters": t.parameters,
            })
        return [{"function_declarations": function_declarations}]

    def chat(
        self,
        messages: List[ChatMessage],
        tools: Optional[List[ToolDefinition]] = None,
    ) -> LLMResponse:
        url = f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"

        contents = []
        for msg in messages:
            if msg.role == "tool":
                try:
                    resp_obj = json.loads(msg.content) if isinstance(msg.content, str) else msg.content
                    if not isinstance(resp_obj, dict):
                        resp_obj = {"result": resp_obj}
                except Exception:
                    resp_obj = {"result": msg.content}

                contents.append({
                    "role": "user",
                    "parts": [{
                        "functionResponse": {
                            "name": msg.tool_call_id or "tool",
                            "response": {"output": resp_obj}
                        }
                    }]
                })
            elif msg.role in {"assistant", "model"}:
                if msg.raw_parts:
                    contents.append({
                        "role": "model",
                        "parts": msg.raw_parts
                    })
                else:
                    parts = []
                    if msg.content:
                        parts.append({"text": msg.content})
                    if msg.tool_calls:
                        for tc in msg.tool_calls:
                            parts.append({
                                "functionCall": {
                                    "name": tc["name"],
                                    "args": tc.get("arguments", {})
                                }
                            })
                    if not parts:
                        parts = [{"text": ""}]
                    contents.append({
                        "role": "model",
                        "parts": parts
                    })
            else:
                contents.append({
                    "role": "user",
                    "parts": [{"text": msg.content}]
                })

        payload: Dict[str, Any] = {
            "contents": contents,
            "generationConfig": {
                "temperature": self.config.temperature,
                "maxOutputTokens": self.config.max_tokens,
            }
        }

        if tools:
            payload["tools"] = self._convert_tools_to_gemini(tools)

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=self.config.timeout_seconds) as response:
                result = json.loads(response.read().decode("utf-8"))
                candidates = result.get("candidates", [])
                if not candidates:
                    return LLMResponse(content="No response generated.")

                candidate = candidates[0]
                content_obj = candidate.get("content", {})
                parts = content_obj.get("parts", [])

                text_parts = []
                tool_calls = []

                for p in parts:
                    if "text" in p:
                        text_parts.append(p["text"])
                    if "functionCall" in p:
                        fn = p["functionCall"]
                        tool_calls.append({
                            "name": fn.get("name"),
                            "arguments": fn.get("args", {}),
                        })

                return LLMResponse(
                    content="\n".join(text_parts),
                    tool_calls=tool_calls,
                    finish_reason=candidate.get("finishReason", "stop"),
                    raw_response=result,
                    raw_parts=parts,
                )
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            return LLMResponse(
                content=f"Gemini API request encountered an error: {e.code} - {err_body}",
                finish_reason="error",
            )
        except Exception as e:
            return LLMResponse(
                content=f"Gemini API request encountered an error: {str(e)}",
                finish_reason="error",
            )

    def generate(self, prompt: str) -> str:
        res = self.chat([ChatMessage(role="user", content=prompt)])
        return res.content

