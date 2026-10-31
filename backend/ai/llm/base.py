from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class ChatMessage:
    role: str  # 'system', 'user', 'assistant', 'tool'
    content: str
    tool_calls: Optional[List[Dict[str, Any]]] = None
    tool_call_id: Optional[str] = None
    raw_parts: Optional[Any] = None


@dataclass
class ToolDefinition:
    name: str
    description: str
    parameters: Dict[str, Any]


@dataclass
class LLMResponse:
    content: str
    tool_calls: List[Dict[str, Any]] = field(default_factory=list)
    finish_reason: str = "stop"
    raw_response: Optional[Any] = None
    raw_parts: Optional[Any] = None


class BaseLLMProvider(ABC):
    @abstractmethod
    def chat(
        self,
        messages: List[ChatMessage],
        tools: Optional[List[ToolDefinition]] = None,
    ) -> LLMResponse:
        """Sends a conversation history and optional tools to the LLM and returns response."""
        pass

    @abstractmethod
    def generate(self, prompt: str) -> str:
        """Single turn text generation."""
        pass

