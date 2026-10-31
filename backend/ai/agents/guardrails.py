import re
from typing import Tuple

OUT_OF_DOMAIN_PATTERNS = [
    # Programming & Code Generation
    r"\b(write|create|generate|show|debug|fix)\s+([a-z\s]+)?(code|script|program|function|class|method|snippet|query|api)\b",
    r"\b(java|python|javascript|typescript|c\+\+|golang|rust|php|ruby|swift|kotlin|c#|html|css|sql|bash|powershell)\b",
    r"\b(regex|leetcode|algorithm|compiler|recursion|pointers|binary search|dockerfile)\b",
    
    # Creative writing & non-agri requests
    r"\b(write|compose)\s+(a\s+)?(poem|song|story|essay|novel|joke|rap|screenplay|haiku)\b",
    
    # General trivia & entertainment
    r"\b(who\s+is|who\s+was|tell\s+me\s+about)\s+(napoleon|einstein|shakespeare|messi|ronaldo|batman|superman)\b",
    r"\b(president|prime minister|election|parliament|democrat|republican)\b",
    r"\b(movie|cinema|netflix|actor|actress|hollywood|bollywood)\b",
    r"\b(horoscope|zodiac|astrology)\b",
]

DOMAIN_REFUSAL_MESSAGE = (
    "I am AgriMart's Agricultural Market Intelligence Copilot. My capabilities are strictly dedicated to "
    "Indian APMC agricultural commodity pricing, mandi comparison, 5-level order depth, price trajectory forecasting, "
    "delivery slot reservations, and trade settlement.\n\n"
    "I cannot assist with programming, code generation, or non-agricultural topics.\n\n"
    "🌾 You can ask me:\n"
    "• \"What is the modal price of Wheat in Ludhiana APMC?\"\n"
    "• \"Compare net proceeds for 100 Qtl Mustard across regional mandis\"\n"
    "• \"Show 5-level order book depth for Cotton\"\n"
    "• \"What is the 14-day price forecast for Basmati 1121?\"\n"
    "• \"Book a delivery slot at Gate #1 for tomorrow\""
)


def validate_domain_scope(user_message: str) -> Tuple[bool, str]:
    """
    Validates whether the incoming user query is within the agricultural commodity
    and APMC mandi trading domain. Rejects out-of-domain requests (such as coding,
    general trivia, or unrelated essays) before invoking the LLM provider.
    """
    if not user_message or not user_message.strip():
        return False, "Please enter an agricultural commodity or APMC mandi inquiry."

    text_lower = user_message.strip().lower()

    # Fast-check out-of-domain patterns
    for pattern in OUT_OF_DOMAIN_PATTERNS:
        if re.search(pattern, text_lower):
            # Exclude false positives if explicitly combined with agricultural crops
            # e.g., if someone says "python" but no agricultural terms
            agri_keywords = ["wheat", "mustard", "cotton", "paddy", "soybean", "chilli", "chana", "mandi", "apmc", "crop", "qtl", "quintal", "harvest"]
            has_agri = any(k in text_lower for k in agri_keywords)
            
            # If asking to write code, always reject even if mentioning a crop
            is_coding = bool(re.search(r"\b(code|script|program|class|function|java|python|c\+\+|javascript|sql)\b", text_lower))
            if is_coding or not has_agri:
                return False, DOMAIN_REFUSAL_MESSAGE

    return True, ""

