"""Explain deterministic tool payloads without altering their calculated facts."""

from typing import Any, Dict


class FarmerExplanationService:
    LEVELS = {"simple", "detailed", "technical"}

    def __init__(self, provider):
        self.provider = provider

    def explain(self, card_type: str, card_data: Dict[str, Any], level: str = "simple", language: str = "en") -> str:
        level = level if level in self.LEVELS else "simple"
        if language == "kn":
            return self._fallback_kannada(card_type, card_data)
        # Explanations are composed solely from the verified result payload.
        # An unconstrained text completion could reverse buy/sell advice or add
        # a claim that is not present in the backend calculation.
        return self._fallback(card_type, card_data, level)

    def _fallback(self, card_type: str, data: Dict[str, Any], level: str) -> str:
        if card_type == "forecast":
            current = data.get("currentPrice")
            predicted = data.get("predictedPrice")
            difference = round(float(predicted) - float(current), 2) if current is not None and predicted is not None else None
            direction = data.get("direction", "the available trend")
            quantity_note = ""
            if data.get("quantity") is not None and difference is not None:
                quantity_note = f" For {data['quantity']} quintals, that is about Rs {round(difference * float(data['quantity']), 2)} before other costs."
            base = (
                f"Based on the available website data, {data.get('commodity', 'this crop')} is showing {direction}. "
                f"The current price is Rs {current} per quintal and the model estimate for {data.get('horizon', 'the selected period')} is Rs {predicted} per quintal"
                f" (a difference of Rs {difference} per quintal).{quantity_note} "
                f"The possible model range is Rs {data.get('lowerRange')} to Rs {data.get('upperRange')}, so this is not a guaranteed price. "
                "Before storing produce, consider storage cost, crop perishability, quality risk, and your cash needs."
            )
            if level == "technical":
                return f"{base} Model: {data.get('modelName')}. Past-fit measures: {data.get('evaluationMetric')}."
            if level == "detailed":
                return f"{base} This estimate uses historical DailyTicker observations, not a promise about the next market session."
            return base

        if card_type == "comparison":
            top = (data.get("mandis") or [{}])[0]
            if data.get("tradeIntent") == "buy" and not data.get("isMockData"):
                timing = data.get("purchaseTiming") or {}
                timing_note = (
                    f" The 14-day historical model moves from about Rs {timing.get('currentPrice')} to Rs {timing.get('predictedPrice')} per quintal "
                    f"({timing.get('direction')}). This is only an estimate, so it cannot guarantee whether waiting will save money."
                    if timing else
                    " A historical timing estimate is not available, so this result cannot confirm whether waiting will reduce the price."
                )
                return (
                    f"Based on the available website data, {top.get('mandiName', 'the first listed mandi')} has the lowest listed price for buying: "
                    f"Rs {top.get('quotedRate')} per quintal. For {data.get('quantity')} quintals, the crop amount is about Rs {top.get('estimatedPurchaseCost')}. "
                    "This ranking uses the current crop quote only. Transport, loading, quality checks, moisture deductions, and local fees can change your final bill."
                    f"{timing_note} Check the actual local quote and crop quality before paying."
                )
            if data.get("isMockData"):
                action = "buying" if data.get("tradeIntent") == "buy" else "selling"
                return (
                    f"This is demo market data for chat illustration only, not live APMC data. For this example, "
                    f"{top.get('mandiName')} ranks first for {action}. Check real local quotes, transport, quality, "
                    "and buyer availability before making a decision."
                )
            return (
                f"Based on the available website data, {top.get('mandiName', 'the top listed mandi')} gives the highest estimated net proceeds: "
                f"Rs {top.get('estimatedNetProceeds')}. This estimate already includes shown freight and mandi cess. "
                "Check transport availability, produce quality, queue time, and buyer demand before deciding where to sell."
            )

        if card_type == "profitability":
            return (
                f"Based on the available website data, selling {data.get('quantity')} quintals at Rs {data.get('sellingPrice')} per quintal gives "
                f"estimated net proceeds of Rs {data.get('estimatedNetProceeds')} after listed trade deductions. "
                "This is estimated sale money after deductions, not your final farm profit because cultivation costs are separate."
            )

        if card_type == "liquidity":
            return (
                f"Based on the available website data, the best buyer bid is Rs {data.get('bestBid')} and the lowest seller ask is Rs {data.get('bestAsk')}. "
                f"The gap is Rs {data.get('spread')}. Liquidity means how easily you may find a buyer at the displayed prices; "
                "larger lots can receive a different final price."
            )

        if card_type == "buyer":
            count = len(data.get("buyers") or [])
            return (
                f"Based on the available website data, {count} verified buyer records match this search. "
                "A listed buyer is not a guaranteed purchase. Confirm the live bid, quantity, quality requirements, and internal escrow status before proceeding."
            )

        if card_type == "price":
            return (
                f"Based on the available website data, the current modal price is Rs {data.get('currentPrice')} per quintal. "
                "Modal price means the price at which most trading happened. Your final rate can vary with quality, moisture, quantity, and the buyer's bid."
            )

        return "This explanation uses the currently available website data. Please review the result card before making a sale, booking, or settlement decision."

    def _fallback_kannada(self, card_type: str, data: Dict[str, Any]) -> str:
        """Short Kannada summaries with the exact backend values inserted unchanged."""
        if card_type == "forecast":
            difference = round(float(data.get("predictedPrice", 0)) - float(data.get("currentPrice", 0)), 2)
            return (
                f"ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ಈಗ ಲಭ್ಯವಿರುವ ಮಾಹಿತಿಯ ಪ್ರಕಾರ, ಇಂದಿನ ಬೆಲೆ ಪ್ರತಿ ಕ್ವಿಂಟಲ್‌ಗೆ Rs {data.get('currentPrice')} ಆಗಿದೆ. "
                f"{data.get('horizon')} ಅಂದಾಜು ಬೆಲೆ Rs {data.get('predictedPrice')} ಆಗಿದೆ; ವ್ಯತ್ಯಾಸ Rs {difference} ಪ್ರತಿ ಕ್ವಿಂಟಲ್‌ಗೆ. "
                f"ಸಂಭಾವ್ಯ ಬೆಲೆ ವ್ಯಾಪ್ತಿ Rs {data.get('lowerRange')} ರಿಂದ Rs {data.get('upperRange')} ವರೆಗೆ ಇದೆ. ಇದು ಖಾತರಿಯ ಬೆಲೆ ಅಲ್ಲ. "
                "ಸಂಗ್ರಹಿಸುವ ಮೊದಲು ಗೋದಾಮು ವೆಚ್ಚ, ಬೆಳೆ ಹಾಳಾಗುವ ಅಪಾಯ ಮತ್ತು ನಿಮ್ಮ ಹಣದ ಅಗತ್ಯವನ್ನು ಪರಿಗಣಿಸಿ."
            )
        if card_type == "comparison":
            top = (data.get("mandis") or [{}])[0]
            return (
                f"ಲಭ್ಯವಿರುವ ಮಾಹಿತಿಯ ಪ್ರಕಾರ, {top.get('mandiName')} ನಲ್ಲಿ ಅಂದಾಜು ನಿವ್ವಳ ಮೊತ್ತ Rs {top.get('estimatedNetProceeds')} ಆಗಿದ್ದು, ಇದು ಪಟ್ಟಿಯಲ್ಲಿರುವ ಅತ್ಯಧಿಕ ಮೊತ್ತ. "
                "ಸಾಗಣೆ, ಗುಣಮಟ್ಟ, ಕ್ಯೂ ಸಮಯ ಮತ್ತು ಖರೀದಿದಾರರ ಬೇಡಿಕೆಯನ್ನು ಪರಿಶೀಲಿಸಿ ನಂತರ ನಿರ್ಧಾರ ಮಾಡಿ."
            )
        if card_type == "profitability":
            return (
                f"Rs {data.get('sellingPrice')} ಪ್ರತಿ ಕ್ವಿಂಟಲ್ ದರದಲ್ಲಿ {data.get('quantity')} ಕ್ವಿಂಟಲ್ ಮಾರಾಟಕ್ಕೆ, ತೋರಿಸಿರುವ ಕಡಿತಗಳ ನಂತರ ಅಂದಾಜು ನಿವ್ವಳ ಮೊತ್ತ Rs {data.get('estimatedNetProceeds')} ಆಗಿದೆ. "
                "ಇದು ಬೆಳೆ ಬೆಳೆಯುವ ವೆಚ್ಚವನ್ನು ಒಳಗೊಂಡ ಅಂತಿಮ ಲಾಭವಲ್ಲ."
            )
        if card_type == "liquidity":
            return (
                f"ಅತ್ಯುತ್ತಮ ಖರೀದಿ ದರ Rs {data.get('bestBid')} ಮತ್ತು ಕಡಿಮೆ ಮಾರಾಟ ದರ Rs {data.get('bestAsk')} ಆಗಿದೆ. ವ್ಯತ್ಯಾಸ Rs {data.get('spread')}. "
                "ಲಿಕ್ವಿಡಿಟಿ ಎಂದರೆ ತೋರಿಸಿರುವ ದರದಲ್ಲಿ ಖರೀದಿದಾರರನ್ನು ಎಷ್ಟು ಸುಲಭವಾಗಿ ಸಿಗಬಹುದು ಎಂಬುದು; ದೊಡ್ಡ ಪ್ರಮಾಣಕ್ಕೆ ಅಂತಿಮ ದರ ಬದಲಾಗಬಹುದು."
            )
        if card_type == "buyer":
            return (
                f"ಲಭ್ಯವಿರುವ ಮಾಹಿತಿಯ ಪ್ರಕಾರ, ಈ ಹುಡುಕಾಟಕ್ಕೆ {len(data.get('buyers') or [])} ಪರಿಶೀಲಿತ ಖರೀದಿದಾರರ ದಾಖಲೆಗಳು ಹೊಂದಿವೆ. "
                "ಮಾರಾಟದ ಮೊದಲು ನೇರ ಬಿಡ್, ಪ್ರಮಾಣ, ಗುಣಮಟ್ಟದ ನಿಯಮಗಳು ಮತ್ತು ಎಸ್ಕ್ರೋ ಸ್ಥಿತಿಯನ್ನು ದೃಢೀಕರಿಸಿ."
            )
        if card_type == "price":
            return (
                f"ಲಭ್ಯವಿರುವ ಮಾಹಿತಿಯ ಪ್ರಕಾರ, ಈಗಿನ ಮೋಡಲ್ ಬೆಲೆ ಪ್ರತಿ ಕ್ವಿಂಟಲ್‌ಗೆ Rs {data.get('currentPrice')} ಆಗಿದೆ. "
                "ಮೋಡಲ್ ಬೆಲೆ ಎಂದರೆ ಹೆಚ್ಚು ವ್ಯವಹಾರ ನಡೆದ ದರ. ಗುಣಮಟ್ಟ, ತೇವಾಂಶ, ಪ್ರಮಾಣ ಮತ್ತು ಖರೀದಿದಾರರ ಬಿಡ್‌ನಿಂದ ನಿಮ್ಮ ಅಂತಿಮ ದರ ಬದಲಾಗಬಹುದು."
            )
        return "ಈ ವಿವರಣೆ ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ಈಗ ಲಭ್ಯವಿರುವ ಮಾಹಿತಿಯನ್ನು ಆಧರಿಸಿದೆ. ಮಾರಾಟ, ಬುಕಿಂಗ್ ಅಥವಾ ಪಾವತಿ ನಿರ್ಧಾರಕ್ಕೆ ಮೊದಲು ಕಾರ್ಡ್‌ನ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ."
