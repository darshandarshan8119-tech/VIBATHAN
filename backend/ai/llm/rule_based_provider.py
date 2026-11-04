import re
from typing import Any, Dict, List, Optional
from ai.llm.base import BaseLLMProvider, ChatMessage, LLMResponse, ToolDefinition


class RuleBasedLLMProvider(BaseLLMProvider):
    """
    Deterministic rule-based LLM provider for zero-external-dependency,
    guaranteed high-availability operation during tests, offline demonstrations,
    and when no commercial API key is set.
    """

    def __init__(self, config=None):
        self.config = config

    def _extract_commodity(self, text: str) -> str:
        text_lower = text.lower()
        if "tomato" in text_lower or "tamatar" in text_lower:
            return "tomato"
        if "mustard" in text_lower or "sarson" in text_lower or "black mustard" in text_lower:
            return "MUST-BLK"
        if "cotton" in text_lower or "kapas" in text_lower or "shankar" in text_lower:
            return "COTTON-S6"
        if "basmati" in text_lower or "1121" in text_lower:
            return "PAD-BASM"
        if "soybean" in text_lower or "soya" in text_lower:
            return "SOY-YEL"
        if "chilli" in text_lower or "mirch" in text_lower or "teja" in text_lower:
            return "CHIL-TEJA"
        if "chana" in text_lower or "gram" in text_lower:
            return "CHNA-DESI"
        if "paddy" in text_lower or "pr-106" in text_lower:
            return "PAD-PR106"
        # default to wheat if wheat mentioned or fallback
        return "WHEAT-SHAR"

    def _extract_quantity(self, text: str) -> float:
        match = re.search(r"(\d+(\.\d+)?)\s*(qtl|quintal|quintals|ton|tons|mt)", text.lower())
        if match:
            qty = float(match.group(1))
            unit = match.group(3)
            if "ton" in unit or "mt" in unit:
                return qty * 10.0  # 1 MT = 10 Quintals
            return qty
        # fallback number search
        match_num = re.search(r"\b(\d{1,4})\b", text)
        if match_num and int(match_num.group(1)) >= 5:
            return float(match_num.group(1))
        return 100.0

    def _extract_market(self, text: str) -> str:
        markets = {
            "ludhiana": "PB-LDH-01",
            "alwar": "RJ-ALW-01",
            "rajkot": "GJ-RJK-01",
            "karnal": "HR-KRN-01",
            "indore": "MP-IND-01",
            "guntur": "AP-GNT-01",
        }
        text_lower = text.lower()
        return next((code for name, code in markets.items() if name in text_lower), "")

    def chat(
        self,
        messages: List[ChatMessage],
        tools: Optional[List[ToolDefinition]] = None,
    ) -> LLMResponse:
        last_message = messages[-1] if messages else ChatMessage(role="user", content="")

        # If previous message was a tool result, synthesize a final answer
        if last_message.role == "tool":
            return LLMResponse(
                content="I have verified the latest verified electronic auction data from APMC trading books and calculated the statutory parameters. See the breakdown below.",
                finish_reason="stop",
            )

        # Domain Guardrail Check
        from ai.agents.guardrails import validate_domain_scope
        is_valid, refusal_msg = validate_domain_scope(last_message.content)
        if not is_valid:
            return LLMResponse(content=refusal_msg, finish_reason="stop")

        user_text = last_message.content.lower()

        # Check if tools are provided to call
        if tools:
            tool_names = {t.name for t in tools}

            if any(k in user_text for k in ["profit when i sell", "profit when i resell", "buy and sell", "buy to sell"]):
                return LLMResponse(
                    content=(
                        "To estimate resale profit, please share the paddy variety, quantity you plan to buy, "
                        "purchase market, expected selling market, transport cost, storage cost per quintal, "
                        "holding period, and quality or moisture limit. I will use available prices for comparison, "
                        "but I cannot guarantee a resale price or future demand date."
                    ),
                    finish_reason="stop",
                )

            if any(k in user_text for k in ["cold storage", "storage capacity", "merchant plan", "apmc business", "warehouse plan"]):
                return LLMResponse(
                    content=(
                        "To prepare a business decision, please share: crop, whether you plan to buy or sell, "
                        "quantity needed, target market, available storage capacity, storage cost per quintal, "
                        "how many days you can hold stock, quality or moisture limits, and your cash-flow need.\n\n"
                        "I can then compare currently available prices and the historical price trend. "
                        "I will not claim an exact future demand date unless verified buyer or order-book data is available."
                    ),
                    finish_reason="stop",
                )

            # 1. Slot Booking intent
            if any(k in user_text for k in ["book slot", "booking", "delivery slot", "gate pass", "reserve slot", "book delivery", "select & book"]):
                if "book_delivery_slot" in tool_names:
                    return LLMResponse(
                        content="Initiating APMC electronic gate slot reservation...",
                        tool_calls=[{
                            "name": "book_delivery_slot",
                            "arguments": {
                                "mandi": self._extract_market(user_text) or "Karnal APMC, Haryana",
                                "commodity_code": self._extract_commodity(user_text),
                                "quantity_quintals": self._extract_quantity(user_text),
                                "vehicle_number": "KA-01-EA-1234",
                            }
                        }]
                    )

            # 2. Buying / procurement comparison ranks lowest quoted price.
            if any(k in user_text for k in ["buy", "purchase", "procure", "procurement", "where to get"]):
                if "get_buy_recommendation" in tool_names:
                    return LLMResponse(
                        content="Checking the available purchase prices and the recent market trend...",
                        tool_calls=[{
                            "name": "get_buy_recommendation",
                            "arguments": {
                                "commodity_code": self._extract_commodity(user_text),
                                "quantity_quintals": self._extract_quantity(user_text),
                                "market": self._extract_market(user_text),
                            },
                        }],
                    )

            # 3. Selling market comparison ranks estimated net proceeds.
            if any(k in user_text for k in ["where should i sell", "where to sell", "sell my"]):
                if "compare_mandis" in tool_names:
                    return LLMResponse(
                        content="Comparing regional mandis for the highest estimated selling proceeds...",
                        tool_calls=[{
                            "name": "compare_mandis",
                            "arguments": {
                                "commodity_code": self._extract_commodity(user_text),
                                "quantity_quintals": self._extract_quantity(user_text),
                                "trade_intent": "sell",
                            },
                        }],
                    )

            # 4. General mandi comparison intent
            if any(k in user_text for k in ["compare", "which mandi", "best mandi", "better price", "highest profit", "net proceeds"]):
                if "compare_mandis" in tool_names:
                    return LLMResponse(
                        content="Running multi-mandi net proceeds comparison across active regional APMCs...",
                        tool_calls=[{
                            "name": "compare_mandis",
                            "arguments": {
                                "commodity_code": self._extract_commodity(user_text),
                                "quantity_quintals": self._extract_quantity(user_text),
                                "trade_intent": "sell",
                            }
                        }]
                    )

            # 5. Market Depth & Liquidity intent
            if any(k in user_text for k in ["liquidity", "depth", "order book", "orderbook", "spread", "bids and asks", "5 level"]):
                if "get_market_liquidity" in tool_names:
                    return LLMResponse(
                        content="Fetching 5-level market depth and order book liquidity for your crop...",
                        tool_calls=[{
                            "name": "get_market_liquidity",
                            "arguments": {
                                "commodity_code": self._extract_commodity(user_text),
                            }
                        }]
                    )

            # 6. Profitability & Deductions intent
            if any(k in user_text for k in ["profit", "deduction", "freight", "cess", "net in hand", "in-hand", "expenses"]):
                if "calculate_net_profit" in tool_names:
                    return LLMResponse(
                        content="Calculating deterministic breakdown of freight, statutory APMC cess, and escrow fees...",
                        tool_calls=[{
                            "name": "calculate_net_profit",
                            "arguments": {
                                "commodity_code": self._extract_commodity(user_text),
                                "quantity_quintals": self._extract_quantity(user_text),
                                "moisture_pct": 11.8,
                            }
                        }]
                    )

            # 7. Sell-or-wait forecast intent
            if any(k in user_text for k in ["forecast", "prediction", "predict", "next week", "trend", "should i sell", "wait or sell"]):
                if "get_sell_wait_recommendation" in tool_names:
                    return LLMResponse(
                        content="Executing time-series price trajectory analysis using historical APMC auction records...",
                        tool_calls=[{
                            "name": "get_sell_wait_recommendation",
                            "arguments": {
                                "commodity_code": self._extract_commodity(user_text),
                                "market": self._extract_market(user_text),
                                "horizon_days": 14,
                                "quantity_quintals": self._extract_quantity(user_text),
                            }
                        }]
                    )

            # 8. Verified Buyers intent
            if any(k in user_text for k in ["buyer", "buyers", "merchant", "institutional", "who will buy"]):
                if "find_verified_buyers" in tool_names:
                    return LLMResponse(
                        content="Querying verified institutional procurement merchants with escrow-backed purchase orders...",
                        tool_calls=[{
                            "name": "find_verified_buyers",
                            "arguments": {
                                "commodity_code": self._extract_commodity(user_text),
                                "quantity_quintals": self._extract_quantity(user_text),
                            }
                        }]
                    )

            # 7. Transaction / Contract Note inquiry
            if any(k in user_text for k in ["transaction", "contract note", "escrow status", "my trades", "settlement"]):
                if "get_transaction_status" in tool_names:
                    return LLMResponse(
                        content="Retrieving your latest APMC contract note and escrow ledger...",
                        tool_calls=[{
                            "name": "get_transaction_status",
                            "arguments": {}
                        }]
                    )

            # 8. Spot price inquiry fallback
            if "get_commodity_price" in tool_names:
                return LLMResponse(
                    content="Querying electronic auction price ticker for latest modal rate...",
                    tool_calls=[{
                        "name": "get_commodity_price",
                        "arguments": {
                            "commodity_code": self._extract_commodity(user_text),
                        }
                    }]
                )

        # Fallback text response
        return LLMResponse(
            content="Namaste! I can assist you with real-time APMC price benchmarks, multi-mandi net proceeds comparison, 5-level market depth, buyer matching, and delivery slot booking. What crop would you like to evaluate?",
            finish_reason="stop",
        )

    def generate(self, prompt: str) -> str:
        return f"Market Intelligence Advisory: {prompt[:100]}..."

