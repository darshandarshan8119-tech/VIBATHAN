# AgriMart Agentic AI Architecture & Execution Lifecycle

This document provides a comprehensive technical specification of the **Agentic AI Architecture** powering AgriMart's Agricultural Market Intelligence and Decision-Support Platform. It details the complete 14-step execution lifecycle, agent orchestration, multi-turn tool calling, deterministic calculation boundaries, domain guardrails, and explainable AI generation.

---

## 1. High-Level Architectural Topology

AgriMart separates natural-language cognitive reasoning from mission-critical financial and econometric computations. The Large Language Model (LLM) acts as an **orchestrator and natural-language interface**, while deterministic backend engines execute all mathematical deductions, historical time-series forecasting, market depth analysis, and transactional locking.

### End-to-End System Diagram

```mermaid
flowchart TD
    subgraph Client["Client Layer (React / Vite)"]
        UI["User Interface (ChatWindow / Cards / Terminal)"]
        AuthContext["Auth Context (JWT / Role: Farmer | Merchant)"]
    end

    subgraph Gateway["API & Transport Layer"]
        DjangoAPI["Django REST Framework (/api/v1/assistant/chat/)"]
        Guardrails["Tier-1 Domain Guardrails (Keyword & AST Refusal)"]
    end

    subgraph Orchestrator["Agentic Core (backend/ai/agents/)"]
        Coordinator["AgentCoordinator (Bounded Loop, Max 5 Iterations)"]
        SystemPrompt["Role-Calibrated System Prompt"]
        ProviderFactory["Provider Factory (Decoupled LLM Switcher)"]
    end

    subgraph LLM["LLM Provider Layer (backend/ai/llm/)"]
        GeminiClient["Google Gemini Provider (v1beta REST)"]
        OpenRouterClient["OpenRouter Provider (OpenAI Compatible)"]
        RuleFallback["Rule-Based High-Availability Engine"]
    end

    subgraph ToolRegistry["Deterministic Market Tools (backend/ai/tools/)"]
        ToolRouter["Tool Dispatcher (execute_tool)"]
        PriceTool["get_commodity_price"]
        MandiCompTool["compare_mandis / get_buy_rec"]
        DepthTool["get_market_liquidity"]
        ProfitTool["calculate_net_profit"]
        ForecastTool["get_price_forecast / get_sell_wait_rec"]
        BuyerTool["find_verified_buyers"]
        BookingTool["book_delivery_slot"]
    end

    subgraph Engines["Deterministic Backend Engines"]
        ProfitCalc["Profit Calculator (Cess, Escrow, Freight Tariff ₹0.18/Qtl/km)"]
        HoltModel["Econometric Forecaster (Holt Linear Trend & 95% Confidence)"]
        DepthEngine["Liquidity Engine (5-Level Bids/Asks & Order Imbalance)"]
        BuyerEngine["Buyer Matching (Institutional Quotas & Verification)"]
        BookingService["Slot Booking (Pessimistic Row-Level Lock select_for_update)"]
        EscrowLedger["Escrow Ledger (SHA-256 Digest Verification)"]
    end

    subgraph Persistence["Storage & Database Layer"]
        PostgresSQLite[("SQLite / PostgreSQL Database")]
        TickersTable[("mandi_dailyticker (90-Day Series)")]
        TransactionsTable[("transactions_markettransaction")]
        SlotsTable[("bookings_deliveryslot / slotbooking")]
    end

    subgraph ResponsePipeline["Explanation & Card Dispatcher"]
        ExplanationService["FarmerExplanationService (Simple | Detailed | Technical)"]
        CardFormatter["Structured Interactive Card Payload Dispatcher"]
    end

    UI -->|Natural Language Query + JWT| DjangoAPI
    DjangoAPI --> Guardrails
    Guardrails -->|Valid Agri Intent| Coordinator
    Guardrails -->|Out-of-Domain Refusal| UI
    Coordinator --> ProviderFactory
    ProviderFactory --> GeminiClient & OpenRouterClient & RuleFallback
    GeminiClient & OpenRouterClient & RuleFallback -->|Tool Call Specification| ToolRouter
    ToolRouter --> PriceTool & MandiCompTool & DepthTool & ProfitTool & ForecastTool & BuyerTool & BookingTool
    PriceTool & MandiCompTool & DepthTool & ProfitTool & ForecastTool & BuyerTool & BookingTool --> ProfitCalc & HoltModel & DepthEngine & BuyerEngine & BookingService & EscrowLedger
    ProfitCalc & HoltModel & DepthEngine & BuyerEngine & BookingService & EscrowLedger --> PostgresSQLite & TickersTable & TransactionsTable & SlotsTable
    PostgresSQLite & TickersTable & TransactionsTable & SlotsTable --> ToolRouter
    ToolRouter -->|Deterministic JSON Payload| Coordinator
    Coordinator --> ExplanationService
    Coordinator --> CardFormatter
    CardFormatter -->|Structured JSON + Card Component Payload| UI
```

---

## 2. The 14-Step Agent Execution Lifecycle

Every user query submitted to AgriMart passes through a strictly bounded, deterministic 14-step execution pipeline:

```
[1. User Auth] ──> [2. Query Ingestion] ──> [3. Guardrail Check] ──> [4. Context Extraction]
                                                                              │
┌─────────────────────────────────────────────────────────────────────────────┘
▼
[5. Plan Analysis] ──> [6. Tool Selection] ──> [7. DB Data Fetch] ──> [8. Historical Analysis]
                                                                              │
┌─────────────────────────────────────────────────────────────────────────────┘
▼
[9. Forecasting] ──> [10. Deterministic Math] ──> [11. Mandi Ranking] ──> [12. LLM Synthesis]
                                                                              │
┌─────────────────────────────────────────────────────────────────────────────┘
▼
[13. Evidence Construction] ──> [14. Interactive Card Delivery]
```

### Detailed Lifecycle Stages

| Step | Stage Name | Technical Operation | Relevant Codebase File |
|---|---|---|---|
| **1** | **User Authentication & Role Identification** | Validates JWT bearer token, resolving user persona (`farmer`, `merchant`, `admin`) and geographical origin pincode. | `backend/users/models.py`, `backend/conversations/views.py` |
| **2** | **Natural-Language Input Ingestion** | Captures user prompt, target conversation ID, selected language (`en`, `kn`), and explanation depth level (`simple`, `detailed`, `technical`). | `backend/conversations/views.py` |
| **3** | **Pre-Execution Guardrail Validation** | Tier-1 domain boundary filter validates prompt against agricultural domain dictionaries. Rejects software coding (Java/Python), creative writing, and out-of-scope queries prior to LLM invocation. | `backend/ai/agents/guardrails.py` |
| **4** | **Context & Parameter Extraction** | Extracts semantic entities: crop variety (e.g. `WHEAT-SHAR`, `PAD-SONA`), volume in quintals, target mandi, and trade intent (`buy` vs `sell`). | `backend/ai/llm/rule_based_provider.py` |
| **5** | **Analysis Planning** | Formulates plan: identifies whether the query requires price retrieval, spatial mandi comparison, order depth, forecasting, or delivery gate reservation. | `backend/ai/agents/coordinator.py` |
| **6** | **Tool Selection** | LLM outputs structured function call matching OpenAPI-compatible schemas registered in `TOOL_DEFINITIONS`. | `backend/ai/tools/market_tools.py` |
| **7** | **Database Retrieval** | Fetches live APMC modal prices, statutory mandi cess rates, operational godowns, and assay moisture benchmarks. | `backend/mandi/models.py` |
| **8** | **Historical Observation Analysis** | Queries up to 90 consecutive daily trading session tickers (`DailyTicker`) to calculate rolling volatility, minimum, maximum, and median prices. | `backend/ai/forecasting/data_loader.py` |
| **9** | **Econometric Forecasting** | Fits Holt's linear double exponential smoothing model to compute 14-day trajectory, 95% confidence intervals, and MAPE/RMSE goodness-of-fit metrics. | `backend/ai/forecasting/model.py` |
| **10** | **Deterministic Financial Deductions** | Pure algorithmic deduction: calculates gross harvest value, APMC cess (1.5%), Axis escrow fee (0.5%), freight tariffs (₹0.18/qtl/km), and moisture penalty. LLM is strictly forbidden from doing math. | `backend/analytics/profit_calculator.py` |
| **11** | **Mandi Opportunity Ranking** | Compares competing APMC markets by true net in-hand realization (for sellers) or lowest total acquisition cost (for buyers). | `backend/analytics/mandi_comparison.py` |
| **12** | **Cognitive Synthesis & Explanation** | LLM evaluates backend payload and produces natural-language narrative strictly bounded by the deterministic facts. | `backend/ai/agents/coordinator.py` |
| **13** | **Evidence & Grounding Construction** | Formulates explainable reasoning: cites specific freight differentials, confidence bounds, and storage trade-offs in farmer-friendly language. | `backend/ai/explanations/service.py` |
| **14** | **Interactive Card Delivery** | Synthesizes response into dual presentation: conversational text narrative + dynamic React component card (e.g. `CommodityPriceCard`, `BookingCard`, `TransactionCard`). | `frontend/src/assistant/cards/` |

---

## 3. Sequence Diagram: Farmer Decision Workflow

The sequence below illustrates a farmer inquiring: *"Compare mandis for 100 quintals of Sharbati Wheat and advise whether to sell now or wait"*.

```mermaid
sequenceDiagram
    autonumber
    actor Farmer as Farmer (Devinder Singh)
    participant UI as React ChatWindow
    participant API as Django REST API (/assistant/chat/)
    participant Coord as AgentCoordinator
    participant LLM as LLM Provider (Gemini / OpenRouter)
    participant Tools as ToolDispatcher (execute_tool)
    participant DB as SQLite / PostgreSQL (DailyTicker & APMC)
    participant Holt as Holt Linear Forecaster
    participant Calc as Profit Calculator
    participant Expl as FarmerExplanationService

    Farmer->>UI: "Compare mandis for 100 Qtl Wheat and advise sell now or wait"
    UI->>API: POST /api/v1/assistant/chat/ (message, role="farmer")
    API->>Coord: run(user, message, conversation_history)
    Coord->>Coord: validate_domain_scope(message) -> Valid
    Coord->>LLM: chat(messages, tools=TOOL_DEFINITIONS)
    LLM-->>Coord: tool_call: compare_mandis(WHEAT-SHAR, 100, "sell")
    Coord->>Tools: execute_tool("compare_mandis", {...})
    Tools->>DB: Query APMC modal rates for Ludhiana, Karnal, Rajkot
    Tools->>Calc: calculate_net_profit(quantity=100, rate=2450, km=60)
    Calc-->>Tools: Gross: ₹2,45,000 | Cess: ₹3,675 | Freight: ₹1,080 | Net: ₹2,39,020
    Tools-->>Coord: comparison_payload: [{mandi: "Karnal", net: 242000}, {mandi: "Ludhiana", net: 239020}]
    
    Coord->>LLM: chat(messages + tool_result, tools)
    LLM-->>Coord: tool_call: get_sell_wait_recommendation(WHEAT-SHAR, "Ludhiana APMC", 14)
    Coord->>Tools: execute_tool("get_sell_wait_recommendation", {...})
    Tools->>DB: Fetch 90-day DailyTicker series
    Tools->>Holt: fit(series) -> predict(horizon=14)
    Holt-->>Tools: Forecast: ₹2,510/Qtl (+2.45%) | 95% CI: [₹2,420, ₹2,600] | MAPE: 2.1%
    Tools-->>Coord: forecast_payload: {direction: "BULLISH", recommendation: "HOLD"}
    
    Coord->>LLM: chat(messages + tool_result, tools)
    LLM-->>Coord: "Karnal APMC yields ₹2,980 higher net proceeds. 14-day trend is bullish..."
    Coord->>Expl: explain("comparison", data, level="simple", lang="en")
    Expl-->>Coord: "Wheat prices may increase slightly over the next two weeks..."
    Coord-->>API: {content, card_type: "comparison", card_data: {...}, actions: [...]}
    API-->>UI: HTTP 201 Created (JSON Message + Interactive Card)
    UI-->>Farmer: Renders Mandi Comparison Card + Forecast Insight + [⚡ Select & Book Slot] Action
```

---

## 4. Multi-Turn State Management & Tool Calling Protocols

AgriMart maintains conversations through `Conversation` and `Message` models in PostgreSQL/SQLite.

### 1. Loop Prevention & Iteration Budget
Agent execution is bounded by `MAX_TOOL_ITERATIONS = 5`. If an LLM repeatedly invokes tools without concluding, the coordinator aborts the loop and returns a safe fallback message with the latest compiled card data.

### 2. Google Gemini v1beta Format Compatibility
Google's Gemini API enforces unique multi-turn REST constraints:
* **Function Call Role**: The model emits function calls under `role: "model"`.
* **Function Response Role**: Tool execution outputs must be echoed back under `role: "user"` using the structure:
  ```json
  {
    "role": "user",
    "parts": [{
      "functionResponse": {
        "name": "compare_mandis",
        "response": {"output": { ... }}
      }
    }]
  }
  ```
* **Thought Signature Preservation**: When Gemini 2.5/3.5 generates tool calls, it attaches internal encrypted `thought_signature` tokens. AgriMart preserves `raw_parts` verbatim in `ChatMessage` and `LLMResponse`, preventing HTTP 400 Bad Request errors on subsequent conversation turns.

### 3. OpenRouter / OpenAI Compatible Format
For OpenRouter and OpenAI models:
* Tool definitions follow the standard JSON Schema `type: "function"` structure.
* Tool call responses are fed back as `role: "tool"` with matching `tool_call_id`.
* Required HTTP headers (`HTTP-Referer` and `X-Title: AgriMart Market Intelligence`) are injected for analytics and model routing.

---

## 5. Resilience & Circuit-Breaker Architecture

If commercial APIs experience outages, rate limits (HTTP 429), or invalid credentials, AgriMart triggers its internal circuit breaker:

```mermaid
stateDiagram-v2
    [*] --> PrimaryExternalLLM: User Submits Query
    PrimaryExternalLLM --> ActiveExecution: 200 OK & Tool Call Emitted
    ActiveExecution --> CardDispatcher: Tool Result Synthesized
    
    PrimaryExternalLLM --> CircuitBreaker: HTTP 401 / 403 / 429 / Timeout
    CircuitBreaker --> RuleBasedFallback: Fallback Triggered (0ms downtime)
    RuleBasedFallback --> ActiveExecution: Deterministic Tool Call Formulated
    
    CardDispatcher --> [*]: Render Response & Cards to User
```

1. **Error Interception**: `AgentCoordinator` wraps LLM communication in a try-catch block inspecting error substrings (`"encountered an error"`, `"API key not valid"`, `"401"`, `"403"`, `"429"`).
2. **Deterministic Fallback**: The coordinator instantiates `RuleBasedLLMProvider(self.provider.config)`, formulating exact tool calls using regex entity parsing.
3. **Zero UI Disruption**: The farmer always receives verified APMC market cards, price forecasts, and booking tokens, regardless of external cloud API status.
