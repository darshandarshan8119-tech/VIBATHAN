from ai.config.llm_config import LLMConfig
from ai.llm.base import BaseLLMProvider
from ai.llm.gemini_provider import GeminiProvider
from ai.llm.openai_compatible_provider import OpenAICompatibleProvider
from ai.llm.rule_based_provider import RuleBasedLLMProvider


def get_llm_provider(config: LLMConfig = None) -> BaseLLMProvider:
    if config is None:
        config = LLMConfig.from_env()

    if config.provider == "gemini" and config.api_key:
        return GeminiProvider(config)
    elif config.provider in {"openai", "openrouter", "deepseek", "groq", "ollama"} and config.api_key:
        return OpenAICompatibleProvider(config)
    else:
        return RuleBasedLLMProvider(config)

