import json
import urllib.request
from typing import Any, Dict, List, Optional
from ai.llm.base import BaseLLMProvider, ChatMessage, LLMResponse, ToolDefinition


class OpenAICompatibleProvider(BaseLLMProvider):
    """
    OpenAI-compatible chat completion provider (works with OpenAI, DeepSeek, Groq, Ollama, etc.)
    using Python standard library (urllib.request).
    """

    def __init__(self, config):
        self.config = config
        self.api_key = config.api_key
        self.model = config.model or "gpt-4o-mini"
        self.base_url = (config.base_url or "https://api.openai.com/v1").rstrip("/")

    def chat(
        self,
        messages: List[ChatMessage],
        tools: Optional[List[ToolDefinition]] = None,
    ) -> LLMResponse:
        url = f"{self.base_url}/chat/completions"

        formatted_msgs = []
        for msg in messages:
            if msg.role == "tool":
                formatted_msgs.append({
                    "role": "tool",
                    "content": msg.content,
                    "tool_call_id": msg.tool_call_id or "call_0",
                })
            elif msg.role in {"assistant", "model"} and msg.tool_calls:
                formatted_msgs.append({
                    "role": "assistant",
                    "content": msg.content or "",
                    "tool_calls": [
                        {
                            "id": tc.get("id", msg.tool_call_id or "call_0"),
                            "type": "function",
                            "function": {
                                "name": tc["name"],
                                "arguments": json.dumps(tc.get("arguments", {})) if isinstance(tc.get("arguments"), dict) else str(tc.get("arguments", "{}")),
                            }
                        }
                        for tc in msg.tool_calls
                    ]
                })
            else:
                formatted_msgs.append({
                    "role": msg.role,
                    "content": msg.content,
                })

        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": formatted_msgs,
            "temperature": self.config.temperature,
            "max_tokens": self.config.max_tokens,
        }

        if tools:
            payload["tools"] = [
                {
                    "type": "function",
                    "function": {
                        "name": t.name,
                        "description": t.description,
                        "parameters": t.parameters,
                    }
                }
                for t in tools
            ]

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "AgriMart Market Intelligence",
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=self.config.timeout_seconds) as response:
                result = json.loads(response.read().decode("utf-8"))
                choice = result.get("choices", [{}])[0]
                message = choice.get("message", {})

                tool_calls = []
                for tc in message.get("tool_calls", []):
                    fn = tc.get("function", {})
                    args = fn.get("arguments", "{}")
                    try:
                        args_dict = json.loads(args) if isinstance(args, str) else args
                    except Exception:
                        args_dict = {}
                    tool_calls.append({
                        "id": tc.get("id"),
                        "name": fn.get("name"),
                        "arguments": args_dict,
                    })

                return LLMResponse(
                    content=message.get("content") or "",
                    tool_calls=tool_calls,
                    finish_reason=choice.get("finish_reason", "stop"),
                    raw_response=result,
                )
        except Exception as e:
            return LLMResponse(
                content=f"OpenAI API provider error: {str(e)}",
                finish_reason="error",
            )

    def generate(self, prompt: str) -> str:
        res = self.chat([ChatMessage(role="user", content=prompt)])
        return res.content

