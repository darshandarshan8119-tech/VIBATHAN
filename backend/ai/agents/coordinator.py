"""Bounded coordinator that connects LLM tool calls to deterministic engines with strict domain guardrails."""

import json
import logging
import re
from typing import Any, Dict, List, Optional

from ai.agents.guardrails import validate_domain_scope
from ai.explanations.service import FarmerExplanationService
from ai.llm.base import ChatMessage
from ai.llm.provider_factory import get_llm_provider
from ai.llm.rule_based_provider import RuleBasedLLMProvider
from ai.tools.market_tools import CARD_TYPES, TOOL_DEFINITIONS, execute_tool

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are AgriMart's specialized Agricultural Market Intelligence Copilot for Indian farmers, traders, and FPOs.\n\n"
    "YOUR ROLE:\n"
    "- Help agricultural producers evaluate APMC commodity spot rates, compare regional mandis by net in-hand proceeds, "
    "inspect 5-level order book liquidity, review statistical price forecasts, book delivery slots, and track contract notes.\n"
    "- ALWAYS invoke the available tools to retrieve market data, execute mathematical deductions, or query records. "
    "NEVER invent prices, buyer demand, freight rates, or financial calculations.\n\n"
    "MARKET DECISIONS:\n"
    "- For sell-or-wait questions, call get_sell_wait_recommendation with the crop, market, horizon, and quantity when supplied. "
    "Treat its result as an estimate, never a guaranteed future price.\n"
    "- For selling or where-to-sell questions, call compare_mandis with trade_intent='sell'. "
    "For buying, procurement, or where-to-buy questions, call get_buy_recommendation.\n"
    "- When a user asks to book a delivery slot, reserve a slot, select a mandi for arrival, or obtain an APMC gate pass, ALWAYS IMMEDIATELY invoke the 'book_delivery_slot' tool. Do NOT ask for vehicle registration number, driver contact, or date upfront; call the tool immediately so the interactive delivery slot card is generated for the farmer to review and confirm.\n\n"
    "FARMER SIMPLE MODE:\n"
    "- A farmer may use a short natural request such as 'I want to buy 100 quintals of paddy near Bengaluru'. "
    "Do not ask them to write a long prompt. Infer the crop, quantity, and buying intent, then return the available-market comparison.\n"
    "- Explain in everyday language: the lowest listed market price, estimated crop purchase amount for the stated quantity, "
    "whether the historical trend suggests buying now or waiting, and risks from transport, quality, moisture, storage, and changing prices. "
    "Use only tool results and clearly state when a charge or local market quote is unavailable.\n"
    "- Farmers receive a concise explanation and result card. Merchant-only trend charts must not be shown to farmer accounts.\n\n"
    "MERCHANT / APMC / STORAGE MODE:\n"
    "- When a merchant, APMC operator, or cold-storage operator asks for a business decision but has not supplied the operating facts, "
    "ask for crop, buy-or-sell intent, quantity, target market, storage capacity, storage cost, holding period, quality constraints, and cash-flow need.\n"
    "- Do not invent a future demand-start date, storage availability, or buyer commitment. Explain that demand timing needs verified order-book or buyer data.\n\n"
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

    def run(
        self,
        user,
        user_message: str,
        conversation_id: Optional[str] = None,
        explanation_level: str = "simple",
        language: str = "en",
        conversation_history: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        del conversation_id

        confirmation = self._purchase_confirmation(
            user_message, conversation_history or [], explanation_level, language
        )
        if confirmation:
            return confirmation

        # Tier 1 Guardrail: Pre-execution domain validation
        is_valid, refusal_message = validate_domain_scope(user_message)
        if not is_valid:
            return {
                "content": refusal_message,
                "card_type": None,
                "card_data": {},
                "farmer_explanation": "",
            }

        farmer_buy_result = self._farmer_buy_request(
            user, user_message, explanation_level, language
        )
        if farmer_buy_result:
            return farmer_buy_result

        messages = [
            ChatMessage(
                role="system",
                content=(
                    f"{SYSTEM_PROMPT}\n\nLANGUAGE:\n"
                    "Reply in Kannada using simple farmer-friendly wording." if language == "kn" else SYSTEM_PROMPT
                ),
            ),
            ChatMessage(role="user", content=user_message),
        ]
        latest_card_type = None
        latest_card_data: Dict[str, Any] = {}

        active_provider = self.provider

        for _ in range(self.MAX_TOOL_ITERATIONS):
            try:
                response = active_provider.chat(messages, tools=TOOL_DEFINITIONS)
                if (
                    not isinstance(active_provider, RuleBasedLLMProvider)
                    and response.content
                    and any(err in response.content for err in ["encountered an error", "API key not valid", "request failed", "401", "403", "429"])
                    and not response.tool_calls
                ):
                    logger.warning("External LLM error: %s. Falling back to RuleBasedLLMProvider.", response.content[:100])
                    active_provider = RuleBasedLLMProvider(getattr(self.provider, "config", None))
                    response = active_provider.chat(messages, tools=TOOL_DEFINITIONS)
            except Exception as exc:
                if not isinstance(active_provider, RuleBasedLLMProvider):
                    logger.warning("External LLM exception: %s. Falling back to RuleBasedLLMProvider.", exc)
                    active_provider = RuleBasedLLMProvider(getattr(self.provider, "config", None))
                    response = active_provider.chat(messages, tools=TOOL_DEFINITIONS)
                else:
                    raise exc

            if not response.tool_calls:
                result = {
                    "content": self._clean_display_text(response.content or "I could not produce a market response."),
                    "card_type": latest_card_type,
                    "card_data": latest_card_data,
                }
                if latest_card_type:
                    result["farmer_explanation"] = FarmerExplanationService(active_provider).explain(
                        latest_card_type,
                        latest_card_data,
                        explanation_level,
                        language,
                    )
                else:
                    result["farmer_explanation"] = ""
                return result

            messages.append(ChatMessage(role="assistant", content=response.content or "", tool_calls=response.tool_calls, raw_parts=response.raw_parts))
            for tool_call in response.tool_calls:
                tool_name = tool_call.get("name", "")
                try:
                    result = execute_tool(tool_name, tool_call.get("arguments", {}))
                    result["merchantAnalysis"] = bool(getattr(user, "role", "") == "merchant")
                    latest_card_type = CARD_TYPES.get(tool_name)
                    latest_card_data = result
                    return {
                        "content": self._verified_card_intro(latest_card_type, latest_card_data),
                        "card_type": latest_card_type,
                        "card_data": latest_card_data,
                        "farmer_explanation": FarmerExplanationService(active_provider).explain(
                            latest_card_type, latest_card_data, explanation_level, language
                        ) if latest_card_type else "",
                    }
                except (TypeError, ValueError) as exc:
                    tool_content = json.dumps({"error": str(exc)})
                messages.append(
                    ChatMessage(role="tool", content=tool_content, tool_call_id=tool_call.get("id") or tool_name)
                )

        return {
            "content": "I reached the market-analysis safety limit before completing this request. Please try a more specific question.",
            "card_type": latest_card_type,
            "card_data": latest_card_data,
            "farmer_explanation": "",
        }

    @staticmethod
    def _verified_card_intro(card_type: Optional[str], card_data: Dict[str, Any]) -> str:
        if card_type == "comparison":
            if card_data.get("tradeIntent") == "buy":
                return "I compared the available purchase prices. The first market in the card has the lowest listed quote."
            return "I compared the available markets. The first market in the card has the strongest estimated selling proceeds."
        if card_type == "forecast":
            return "Here is the price estimate based on the available historical market data."
        if card_type == "profitability":
            return "Here is the backend-calculated proceeds breakdown."
        if card_type == "liquidity":
            return "Here is the available market-depth result."
        if card_type == "buyer":
            return "Here are the verified buyer records that match the available search data."
        return "Here is the verified result from the available website data."

    def _purchase_confirmation(
        self,
        user_message: str,
        history: List[Dict[str, Any]],
        explanation_level: str,
        language: str,
    ) -> Optional[Dict[str, Any]]:
        normalized = user_message.lower().strip()
        confirms_purchase = bool(re.search(
            r"\b(?:buy|purchase|procure)(?:\s+(?:that|this|the|it|paddy|crop)){0,4}\s+now\b",
            normalized,
        )) or any(phrase in normalized for phrase in ("go ahead and buy", "i will buy"))
        if not confirms_purchase:
            return None

        previous = next(
            (
                item for item in reversed(history)
                if item.get("card_type") == "comparison"
                and isinstance(item.get("card_data"), dict)
                and item["card_data"].get("tradeIntent") == "buy"
            ),
            None,
        )
        if previous is None:
            prior_buy_message = next(
                (
                    item.get("content", "") for item in reversed(history)
                    if item.get("role") == "user"
                    and any(word in item.get("content", "").lower() for word in ("buy", "purchase", "procure"))
                ),
                "",
            )
            if not prior_buy_message:
                return None
            parser = RuleBasedLLMProvider()
            card_data = execute_tool(
                "get_buy_recommendation",
                {
                    "commodity_code": parser._extract_commodity(prior_buy_message),
                    "quantity_quintals": parser._extract_quantity(prior_buy_message),
                    "market": parser._extract_market(prior_buy_message),
                },
            )
            card_data["merchantAnalysis"] = False
        else:
            card_data = previous["card_data"]
        top = (card_data.get("mandis") or [{}])[0]
        content = (
            f"Okay. Using the comparison you just reviewed, {top.get('mandiName', 'the top listed market')} is the lowest listed option "
            f"at Rs {top.get('quotedRate')} per quintal. For {card_data.get('quantity')} quintals, the crop amount is about "
            f"Rs {top.get('estimatedPurchaseCost')}. Please confirm the live quote, quality, transport, and any local charges before placing an order."
        )
        return {
            "content": content,
            "card_type": "comparison",
            "card_data": card_data,
            "farmer_explanation": FarmerExplanationService(self.provider).explain(
                "comparison", card_data, explanation_level, language
            ),
        }

    def _farmer_buy_request(
        self,
        user,
        user_message: str,
        explanation_level: str,
        language: str,
    ) -> Optional[Dict[str, Any]]:
        """Keep a farmer's short buying request on verified backend tools."""
        if getattr(user, "role", "") != "farmer":
            return None
        normalized = user_message.lower()
        if not any(word in normalized for word in ("buy", "purchase", "procure")):
            return None

        parser = RuleBasedLLMProvider()
        card_data = execute_tool(
            "get_buy_recommendation",
            {
                "commodity_code": parser._extract_commodity(user_message),
                "quantity_quintals": parser._extract_quantity(user_message),
                "market": parser._extract_market(user_message),
            },
        )
        card_data["merchantAnalysis"] = False
        return {
            "content": self._verified_card_intro("comparison", card_data),
            "card_type": "comparison",
            "card_data": card_data,
            "farmer_explanation": FarmerExplanationService(self.provider).explain(
                "comparison", card_data, explanation_level, language
            ),
        }

    @staticmethod
    def _clean_display_text(content: str) -> str:
        """Keep chat messages readable when a provider responds with Markdown."""
        content = re.sub(r"\*\*(.*?)\*\*", r"\1", content)
        content = re.sub(r"__(.*?)__", r"\1", content)
        content = re.sub(r"`([^`]+)`", r"\1", content)
        content = re.sub(r"^#{1,6}\s*", "", content, flags=re.MULTILINE)
        return content.strip()
