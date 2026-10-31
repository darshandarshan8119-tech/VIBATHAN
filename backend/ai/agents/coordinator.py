"""Bounded coordinator that connects LLM tool calls to deterministic engines."""

import json
from typing import Any, Dict, Optional

from ai.llm.base import ChatMessage
from ai.llm.provider_factory import get_llm_provider
from ai.tools.market_tools import CARD_TYPES, TOOL_DEFINITIONS, execute_tool


class AgentCoordinator:
    MAX_TOOL_ITERATIONS = 5

    def __init__(self, provider=None):
        self.provider = provider or get_llm_provider()

    def run(self, user, user_message: str, conversation_id: Optional[str] = None) -> Dict[str, Any]:
        del user, conversation_id
        messages = [
            ChatMessage(
                role="system",
                content=(
                    "You are AgriMart's market intelligence assistant. Use tools for market facts, "
                    "never invent prices or financial calculations, and explain results briefly."
                ),
            ),
            ChatMessage(role="user", content=user_message),
        ]
        latest_card_type = None
        latest_card_data: Dict[str, Any] = {}

        for _ in range(self.MAX_TOOL_ITERATIONS):
            response = self.provider.chat(messages, tools=TOOL_DEFINITIONS)
            if not response.tool_calls:
                return {
                    "content": response.content or "I could not produce a market response.",
                    "card_type": latest_card_type,
                    "card_data": latest_card_data,
                }

            messages.append(ChatMessage(role="assistant", content=response.content or "", tool_calls=response.tool_calls))
            for tool_call in response.tool_calls:
                tool_name = tool_call.get("name", "")
                try:
                    result = execute_tool(tool_name, tool_call.get("arguments", {}))
                    latest_card_type = CARD_TYPES.get(tool_name)
                    latest_card_data = result
                    tool_content = json.dumps(result, default=str)
                except (TypeError, ValueError) as exc:
                    tool_content = json.dumps({"error": str(exc)})
                messages.append(ChatMessage(role="tool", content=tool_content, tool_call_id=tool_name))

        return {
            "content": "I reached the market-analysis safety limit before completing this request. Please try a more specific question.",
            "card_type": latest_card_type,
            "card_data": latest_card_data,
        }
