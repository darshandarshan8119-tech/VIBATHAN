import os
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

try:
    from dotenv import load_dotenv
    # Load backend/.env if present
    env_path = Path(__file__).resolve().parent.parent.parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)
    else:
        load_dotenv()
except ImportError:
    pass


@dataclass
class LLMConfig:
    provider: str
    api_key: Optional[str]
    model: str
    base_url: Optional[str]
    temperature: float = 0.2
    max_tokens: int = 1500
    timeout_seconds: int = 25

    @classmethod
    def from_env(cls) -> "LLMConfig":
        provider = os.getenv("LLM_PROVIDER", "rule_based").strip().lower()
        base_url = os.getenv("LLM_BASE_URL")

        if provider == "gemini":
            api_key = os.getenv("GEMINI_API_KEY") or os.getenv("LLM_API_KEY")
            model = os.getenv("GEMINI_MODEL") or os.getenv("LLM_MODEL") or "gemini-3.5-flash-lite"
        elif provider == "openrouter":
            api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("LLM_API_KEY")
            model = os.getenv("OPENROUTER_MODEL") or os.getenv("LLM_MODEL")
            if not model or model.startswith("gemini-"):
                model = "meta-llama/llama-3.3-70b-instruct:free"
            if not base_url:
                base_url = "https://openrouter.ai/api/v1"
        else:
            api_key = (
                os.getenv("OPENAI_API_KEY")
                or os.getenv("LLM_API_KEY")
                or os.getenv("GEMINI_API_KEY")
                or os.getenv("OPENROUTER_API_KEY")
            )
            model = os.getenv("LLM_MODEL", "gpt-4o-mini")

        # If provider is configured as an external API but no API key is supplied,
        # fallback safely to 'rule_based' so the app never crashes or hangs
        if provider in {"gemini", "openai", "openrouter", "deepseek", "groq"} and not api_key:
            provider = "rule_based"

        return cls(
            provider=provider,
            api_key=api_key,
            model=model,
            base_url=base_url,
            temperature=float(os.getenv("LLM_TEMPERATURE", "0.2")),
            max_tokens=int(os.getenv("LLM_MAX_TOKENS", "1500")),
            timeout_seconds=int(os.getenv("LLM_TIMEOUT_SECONDS", "25")),
        )

