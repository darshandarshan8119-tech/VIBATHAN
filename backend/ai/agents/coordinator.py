"""Bounded coordinator that connects LLM tool calls to deterministic engines with strict domain guardrails."""

import json
from typing import Any, Dict, Optional

from ai.agents.guardrails import validate_domain_scope
from ai.llm.base import ChatMessage
from ai.llm.provider_factory import get_llm_provider
from ai.tools.market_tools import CARD_TYPES, TOOL_DEFINITIONS, execute_tool

SYSTEM_PROMPT = (
    "You are AgriMart's specialized Agricultural Market Intelligence Copilot for Indian farmers, traders, and FPOs.\n\n"
    "YOUR ROLE:\n"
    "- Help agricultural producers evaluate APMC commodity spot rates, compare regional mandis by net in-hand proceeds, "
    "inspect 5-level order book liquidity, review statistical price forecasts, book delivery slots, and track contract notes.\n"
    "- ALWAYS invoke the available tools to retrieve market data, execute mathematical deductions, or query records. "
    "NEVER invent prices, buyer demand, freight rates, or financial calculations.\n\n"
    "STRICT DOMAIN BOUNDARIES (NON-NEGOTIABLE):\n"
    "- You MUST ONLY answer queries related to agricultural commodities, APMC mandis, crop marketing, freight tariffs, "
    "statutory cess (1.5%), escrow protection (0.5%), moisture discounts, and trade settlement.\n"
    "- You are STRICTLY FORBIDDEN from writing computer code (e.g. Java, Python, C++, etc.), explaining general "
    "software engineering, answering non-agricultural general knowledge/trivia, or writing creative stories/poems.\n"
    "- If the user asks an out-of-domain question (such as 'write java code', 'who was Napoleon', 'write a poem', etc.), "
    "you MUST politely and concisely decline, stating that you are dedicated exclusively to agricultural market "
    "intelligence, and redirect them to crop marketing."
)


class AgentCoordinator:
    MAX_TOOL_ITERATIONS = 5

    def __init__(self, provider=None):
        self.provider = provider or get_llm_provider()

    def run(self, user, user_message: str, conversation_id: Optional[str] = None) -> Dict[str, Any]:
        del user, conversation_id

        # Tier 1 Guardrail: Pre-execution domain validation
        is_valid, refusal_message = validate_domain_scope(user_message)
        if not is_valid:
            return {
                "content": refusal_message,
                "card_type": None,
                "card_data": {},
            }

        messages = [
            ChatMessage(role="system", content=SYSTEM_PROMPT),
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
