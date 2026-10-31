# AgriMart Agent Tools & Capabilities Reference

This document provides an exhaustive inventory of the 9 specialized backend tools available to the AgriMart Agentic AI Coordinator. Every tool is an adapter connected to deterministic backend calculation engines, database models, or econometric algorithms.

---

## Tool Implementation Matrix

| Tool Identifier | Category | Implementation Status | Card Dispatched | Persistence / Models Accessed |
|---|---|---|---|---|
| `get_commodity_price` | Market Intelligence | **Fully Implemented** | `price` (`CommodityPriceCard`) | `mandi.Commodity`, `mandi.DailyTicker` |
| `compare_mandis` | Spatial Analytics | **Fully Implemented** | `comparison` (`MandiComparisonCard`) | `mandi.APMC`, `mandi.Commodity`, `mandi.DailyTicker` |
| `get_buy_recommendation` | Procurement Intelligence | **Fully Implemented** | `comparison` (`MandiComparisonCard`) | `mandi.APMC`, `mandi.DailyTicker`, `analytics.mandi_comparison` |
| `get_market_liquidity` | Depth & Order Book | **Fully Implemented** | `liquidity` (`LiquidityCard`) | `mandi.DailyTicker`, `analytics.liquidity_analysis` |
| `calculate_net_profit` | Financial Deductions | **Fully Implemented** | `profitability` (`ProfitabilityCard`) | `analytics.profit_calculator` |
| `get_price_forecast` | Econometrics | **Fully Implemented** | `forecast` (`ForecastCard`) | `mandi.DailyTicker`, `ai.forecasting.model` |
| `get_sell_wait_recommendation` | Decision Support | **Fully Implemented** | `forecast` (`ForecastCard`) | `mandi.DailyTicker`, `ai.forecasting.predictor` |
| `find_verified_buyers` | Counterparty Discovery | **Fully Implemented** | `buyer` (`BuyerCard`) | `analytics.buyer_matching`, `users.MerchantProfile` |
| `book_delivery_slot` | Transaction & Gate Execution | **Fully Implemented** | `booking` (`BookingCard`) | `bookings.DeliverySlot`, `bookings.SlotBooking`, `transactions.MarketTransaction` |

---

## Detailed Tool Specifications

### 1. `get_commodity_price`
* **Purpose**: Retrieves the latest official AGMARKNET modal, minimum, maximum, and previous session closing price for a specified crop.
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "commodity_code": {
        "type": "string",
        "description": "Commodity code, symbol, or common name (e.g., 'WHEAT-SHAR', 'Wheat', 'Paddy')"
      }
    },
    "required": ["commodity_code"]
  }
  ```
* **Backend Operation**:
  1. Executes case-insensitive lookup across `code`, `name`, and `ticker_symbol` in `mandi.Commodity`.
  2. Queries the latest `mandi.DailyTicker` row filtered by commodity and APMC.
  3. Computes absolute session change and percentage change.
* **Returned Information**:
  ```json
  {
    "commodity": "Wheat (Sharbati)",
    "commodityCode": "WHEAT-SHAR",
    "mandi": "Ludhiana APMC, Punjab",
    "modalPrice": 2450.0,
    "minPrice": 2380.0,
    "maxPrice": 2520.0,
    "change": 15.0,
    "changePct": 0.62,
    "arrivals": 1240.0,
    "unit": "₹/Quintal",
    "timestamp": "2026-10-31T06:00:00Z"
  }
  ```
* **Agent Usage**: Used to ground initial price inquiries before performing complex comparative or holding analysis. Renders `CommodityPriceCard`.

---

### 2. `compare_mandis`
* **Purpose**: Executes spatial price comparison across competing regional APMCs. When `trade_intent='sell'`, it ranks markets by highest net realized in-hand cash proceeds. When `trade_intent='buy'`, it ranks markets by lowest quoted procurement rate.
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "commodity_code": { "type": "string" },
      "quantity_quintals": { "type": "number", "minimum": 0.1 },
      "trade_intent": { "type": "string", "enum": ["buy", "sell"] }
    },
    "required": ["commodity_code", "quantity_quintals", "trade_intent"]
  }
  ```
* **Backend Operation**:
  1. Resolves target commodity and iterates over active APMCs (Ludhiana, Karnal, Rajkot, Guntur, Nizamabad, Indore).
  2. Fetches the latest modal rate and distance from user origin (defaulting to 60 km if unspecified).
  3. Invokes `calculate_net_profit` to deduct freight tariffs (₹0.18/qtl/km) and statutory APMC cess (1.5%).
  4. Sorts output deterministically: descending net proceeds for sellers; ascending acquisition cost for buyers.
* **Returned Information**:
  ```json
  {
    "commodity": "Paddy (Sona Masoori A1)",
    "commodityCode": "PAD-SONA",
    "quantity": 100.0,
    "unit": "Quintals",
    "tradeIntent": "sell",
    "recommendationReason": "Karnal APMC yields ₹16,660 higher net proceeds because the higher spot rate more than compensates for freight.",
    "mandis": [
      {
        "mandiName": "Karnal APMC, Haryana",
        "marketCode": "APMC-KRN",
        "quotedRate": 2850.0,
        "distanceKm": 60.0,
        "estimatedFreight": 1080.0,
        "mandiCess": 4275.0,
        "estimatedNetProceeds": 276720.0,
        "buyerDemandQty": 5800.0
      },
      {
        "mandiName": "Ludhiana APMC, Punjab",
        "marketCode": "APMC-LUD",
        "quotedRate": 2680.0,
        "distanceKm": 60.0,
        "estimatedFreight": 1080.0,
        "mandiCess": 4020.0,
        "estimatedNetProceeds": 260060.0,
        "buyerDemandQty": 0.0
      }
    ]
  }
  ```
* **Agent Usage**: Formulates comparative recommendations. Renders `MandiComparisonCard`.

---

### 3. `get_buy_recommendation`
* **Purpose**: Specialized procurement evaluator for buyers and merchants. Ranks lowest available market purchase quotes and combines them with a 14-day historical trend direction to advise whether purchasing now or pacing acquisitions is financially prudent.
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "commodity_code": { "type": "string" },
      "quantity_quintals": { "type": "number", "minimum": 0.1 },
      "market": { "type": "string" }
    },
    "required": ["commodity_code", "quantity_quintals"]
  }
  ```
* **Backend Operation**:
  1. Invokes `compare_mandis` with `trade_intent="buy"`.
  2. Queries historical `DailyTicker` records for the crop and fits Holt's linear trend model to assess 14-day expected price changes.
  3. Constructs purchase timing evidence (e.g. *"Prices are on a downward trend (-2.1%); consider staggered buying"*).
* **Returned Information**: Includes `mandis` array sorted by lowest crop cost and a `purchaseTiming` block with `currentPrice`, `predictedPrice`, `direction`, and `changePct`.
* **Agent Usage**: Used whenever a user says *"I want to buy..."* or *"Where should I purchase..."*. Renders `MandiComparisonCard`.

---

### 4. `get_market_liquidity`
* **Purpose**: Evaluates market absorptive capacity and trading depth through a 5-level order book (Best 5 Bids and Best 5 Asks).
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "commodity_code": { "type": "string" },
      "quantity_quintals": { "type": "number", "minimum": 0.1 }
    },
    "required": ["commodity_code", "quantity_quintals"]
  }
  ```
* **Backend Operation**:
  1. Retrieves the current modal quote and generates five discrete bid levels (decaying from modal rate) and five ask levels.
  2. Calculates cumulative bid volume and cumulative ask volume.
  3. Computes the **Bid-Ask Spread %** and **Order Book Imbalance Ratio** (`(Total Bids - Total Asks) / (Total Bids + Total Asks)`).
  4. Flags whether the requested quantity can be liquidated without severe slippage.
* **Returned Information**:
  ```json
  {
    "commodity": "Wheat (Sharbati)",
    "mandi": "Ludhiana APMC, Punjab",
    "spotRate": 2450.0,
    "spreadPct": 0.41,
    "orderImbalance": 0.18,
    "liquidityHealth": "DEEP_AND_LIQUID",
    "bids": [
      { "level": 1, "price": 2450.0, "quantity": 450, "buyer": "ITC Agri" },
      { "level": 2, "price": 2445.0, "quantity": 600, "buyer": "Adani Wilmar" },
      { "level": 3, "price": 2440.0, "quantity": 800, "buyer": "Cargill India" },
      { "level": 4, "price": 2435.0, "quantity": 1100, "buyer": "Patanjali Foods" },
      { "level": 5, "price": 2425.0, "quantity": 1500, "buyer": "Local Millers Pool" }
    ],
    "asks": [
      { "level": 1, "price": 2460.0, "quantity": 300, "seller": "Khanna FPO" },
      { "level": 2, "price": 2465.0, "quantity": 550, "seller": "Samrala Coop" },
      { "level": 3, "price": 2470.0, "quantity": 900, "seller": "Moga Agro" },
      { "level": 4, "price": 2475.0, "quantity": 1200, "seller": "Bhatinda Kisan Union" },
      { "level": 5, "price": 2485.0, "quantity": 1600, "seller": "Direct Farm Lots" }
    ]
  }
  ```
* **Agent Usage**: Proves whether market demand actually exists for large wholesale quantities. Renders `LiquidityCard`.

---

### 5. `calculate_net_profit`
* **Purpose**: Pure mathematical calculation of post-harvest net revenue after deducting statutory government taxes, certified escrow guarantees, freight tariffs, and moisture penalties.
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "commodity_code": { "type": "string" },
      "quantity_quintals": { "type": "number", "minimum": 0.1 },
      "moisture_pct": { "type": "number", "minimum": 0, "maximum": 100 }
    },
    "required": ["commodity_code", "quantity_quintals", "moisture_pct"]
  }
  ```
* **Backend Operation (Strict Determinism)**:
  $$\text{Gross Amount} = \text{Quantity} \times \text{Modal Rate}$$
  $$\text{APMC Cess} = \text{Gross Amount} \times 0.015 \quad (1.5\%)$$
  $$\text{Escrow Fee} = \text{Gross Amount} \times 0.005 \quad (0.5\%)$$
  $$\text{Freight Deduction} = \text{Quantity} \times 60\text{ km} \times ₹0.18/\text{Qtl/km}$$
  $$\text{Moisture Penalty} = \max(0, \text{Moisture \%} - \text{Basis Moisture \%}) \times \text{Discount Rate} \times \text{Quantity}$$
  $$\text{Net Realized Cash} = \text{Gross} - \text{Cess} - \text{Escrow} - \text{Freight} - \text{Moisture Penalty}$$
* **Returned Information**: Structured breakdown of all deductions with statutory references. Renders `ProfitabilityCard`.

---

### 6. `get_price_forecast` & `get_sell_wait_recommendation`
* **Purpose**: Generates statistical time-series projections over 7 to 90 days using double exponential smoothing with 95% confidence bounds.
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "commodity_code": { "type": "string" },
      "market": { "type": "string" },
      "horizon_days": { "type": "integer", "minimum": 1, "maximum": 90 },
      "quantity_quintals": { "type": "number", "minimum": 0.1 }
    },
    "required": ["commodity_code", "horizon_days"]
  }
  ```
* **Backend Operation**:
  1. Queries chronological daily close rates from `mandi.DailyTicker`.
  2. Fits `HoltLinearTrendForecaster(alpha=0.35, beta=0.15)`.
  3. Calculates in-sample MAPE and RMSE.
  4. Extrapolates $h$-step trajectory: $\hat{y}_{t+h} = \ell_t + h \cdot b_t$.
  5. Computes standard error of prediction: $s_h = s_e \cdot \sqrt{h}$.
  6. Confidence Bounds: $[\hat{y}_{t+h} - 1.96 s_h, \hat{y}_{t+h} + 1.96 s_h]$.
* **Returned Information**: Current price, predicted target, trajectory points array, historical points array, trend classification (`BULLISH`, `BEARISH`, `SIDEWAYS`), and agronomic recommendation (`SELL NOW` vs `HOLD PRODUCE`). Renders `ForecastCard`.

---

### 7. `find_verified_buyers`
* **Purpose**: Counterparty discovery matching farmers directly with verified institutional procurement buyers (e.g. flour mills, exporter conglomerates, food processors) holding active credit guarantees.
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "commodity_code": { "type": "string" },
      "quantity_quintals": { "type": "number", "minimum": 0.1 }
    },
    "required": ["commodity_code", "quantity_quintals"]
  }
  ```
* **Backend Operation**:
  1. Filters institutional merchant records in `users.MerchantProfile` with active APMC unified licenses and normal risk status.
  2. Queries active open procurement bids matching the commodity and volume.
  3. Sorts by offered price and trust score.
* **Returned Information**: Buyer corporate names, APMC license numbers, offered rates, quotas, and settlement guarantee status. Renders `BuyerCard`.

---

### 8. `book_delivery_slot`
* **Purpose**: Provisions an electronic weighbridge arrival token and inward delivery slot at the designated APMC gate, locking capacity and generating an official trade transaction in the internal ledger.
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "commodity_code": { "type": "string" },
      "mandi": { "type": "string" },
      "quantity_quintals": { "type": "number", "minimum": 0.1 },
      "vehicle_number": { "type": "string" }
    },
    "required": ["commodity_code"]
  }
  ```
* **Backend Operation**:
  1. Resolves APMC and target delivery date (defaults to next trading session).
  2. Seeds default morning and afternoon gate slots if uninitialized.
  3. Executes transactional row-level lock (`select_for_update()`) on `bookings.DeliverySlot` to prevent double-booking.
  4. Decrements remaining gate capacity and creates persistent `bookings.SlotBooking` record.
  5. Automatically creates a corresponding `transactions.MarketTransaction` row with a unique contract note reference (`CN-2026-XXXX`) and Axis escrow verification hash.
* **Returned Information**:
  ```json
  {
    "bookingId": "RES-0584E6A1",
    "slotId": "0584e6a1-7272-43fc-b523-f8536dae9239",
    "contractNumber": "CN-2026-KRN-5BFAFEFA",
    "orderId": "TXN-2026-KRN-82194012",
    "escrowReference": "ESC-AXIS-7C9482F1",
    "mandi": "Karnal APMC, Haryana",
    "gate": "Gate #1 (North Inward Electronic Weighbridge)",
    "date": "Sunday, 01 Nov 2026",
    "timeSlot": "08:00 AM - 10:00 AM",
    "commodity": "Paddy Sona Masoori A1",
    "commodityCode": "PAD-SONA",
    "quantity": 100.0,
    "unit": "Quintals",
    "vehicleNo": "KA-01-EA-1234",
    "status": "CONFIRMED"
  }
  ```
* **Agent Usage**: Triggered whenever a farmer confirms purchase, requests slot reservation, or clicks `Select & Book Slot`. Renders `BookingCard` with a 1-click action linking directly to `Transactions & Escrow`.
