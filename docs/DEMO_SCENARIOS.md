# AgriMart Demonstration Walkthroughs

This document provides two complete, reproducible demonstration scenarios showcasing the capabilities of the AgriMart Agentic AI platform.

---

## Scenario 1: Farmer Crop Liquidation & Holding Decision

* **Persona**: Devinder Singh (Kisan Member, Punjab)
* **Commodity**: Wheat (Sharbati) — Code: `WHEAT-SHAR`
* **Local Market**: Ludhiana APMC, Punjab
* **Harvest Volume**: 100 Quintals
* **Key Decision**: Should I sell my 100 quintals in Ludhiana today, transport to Karnal, or hold in godown for 14 days?

---

### Phase 1: Natural-Language Input & Intent Discovery

The farmer logs into the AgriMart platform and enters the conversational AI Copilot:

> **Farmer Input**:  
> *"I have 100 quintals of Sharbati Wheat harvested in Ludhiana. Should I sell here, take it to Karnal, or wait two weeks? Give me estimated in-hand money after transport and cess."*

### Phase 2: Agent Orchestration & Tool Invocations

1. **Pre-Execution Guardrail**:  
   `validate_domain_scope` verifies agricultural relevance (Crop: Wheat, Markets: Ludhiana & Karnal, Action: Selling & Holding).

2. **Step 1 — Mandi Comparison**:  
   The agent calls `compare_mandis`:
   ```json
   {
     "commodity_code": "WHEAT-SHAR",
     "quantity_quintals": 100.0,
     "trade_intent": "sell"
   }
   ```
   * **Ludhiana APMC**: Spot Quote = ₹2,450/Qtl | Distance = 0 km (local)
     * Gross: ₹2,45,000 | Cess (1.5%): ₹3,675 | Freight: ₹0 | **Est. Net: ₹2,40,100**
   * **Karnal APMC**: Spot Quote = ₹2,510/Qtl | Distance = 140 km
     * Gross: ₹2,51,000 | Cess (1.5%): ₹3,765 | Freight (₹0.18 × 140 × 100): ₹2,520 | **Est. Net: ₹2,43,460**
   * *Differential*: Transporting to Karnal yields **+₹3,360 higher in-hand cash**, as the +₹60/Qtl rate premium exceeds the ₹25.20/Qtl freight tariff.

3. **Step 2 — Econometric Trend Forecast**:  
   The agent calls `get_sell_wait_recommendation`:
   ```json
   {
     "commodity_code": "WHEAT-SHAR",
     "market": "Ludhiana APMC",
     "horizon_days": 14,
     "quantity_quintals": 100.0
   }
   ```
   * Fits Holt's linear trend model over 90 historical `DailyTicker` records.
   * **Trajectory**: Current price = ₹2,450/Qtl &rarr; 14-day projection = **₹2,510/Qtl (+2.45%)**.
   * **95% Confidence Bounds**: [₹2,420, ₹2,600] / Qtl.
   * **Goodness-of-Fit**: MAPE = 2.14%, RMSE = 18.42.
   * **Agronomic Advice**: *Moderate Bullish Trend*. Potential gain of ~₹6,000 on 100 quintals if held, but must be balanced against local godown storage costs (~₹15/qtl/month) and rain risk.

---

### Phase 3: Response Presentation & Card Rendering

The assistant returns a dual response:

1. **Conversational Synthesis & Farmer-Friendly Explanation**:
   > *"If you want to sell today, Karnal APMC yields about ₹3,360 more in-hand cash (₹2,43,460 vs ₹2,40,100) even after paying ₹2,520 for truck transport. Over the next two weeks, Ludhiana prices are projected to rise gradually toward ₹2,510/Qtl. If you have safe, dry storage that costs less than ₹20/Qtl, holding is worth considering; otherwise, selling at Karnal secures immediate profit."*

2. **Interactive UI Cards**:
   * Renders `MandiComparisonCard` showing Ludhiana vs Karnal with breakdown pills.
   * Displays the green action button: **`[⚡ Select & Book Delivery Slot &rarr;]`**.

---

### Phase 4: Delivery Gate Slot Reservation

The farmer clicks **`[⚡ Select & Book Delivery Slot]`** (or types *"Book slot at Karnal"*):

1. `AssistantPage.jsx` dispatches `SELECT_MANDI` with `{ mandi: "Karnal APMC", commodity: "Wheat", quantity: 100 }`.
2. The agent executes `book_delivery_slot`:
   * Locks gate capacity with `select_for_update()` in `DeliverySlot`.
   * Provisions `Gate #1 (North Inward Electronic Weighbridge)`.
   * Date: Tomorrow, 08:00 AM – 10:00 AM.
   * Generates digital token: `RES-0584E6A1`.
   * Automatically registers persistent `MarketTransaction` (`CN-2026-KRN-4821`).
3. Renders `BookingCard` with a 1-click shortcut: **`[📋 View in Transactions & Escrow &rarr;]`**.
4. The farmer clicks the shortcut and is redirected to `TransactionsPage`, where the trade note appears under **`🌾 SELLING CONTRACT`** with live 6-step settlement tracking.

---

## Scenario 2: Merchant Arbitrage & Resale Margin Analysis

* **Persona**: Rajkot Agri-Exports Pvt Ltd (Wholesale Merchant, APMC License: `MER-GJ-7821`)
* **Commodity**: Onion (Nashik Red Grade-A) — Code: `ONI-RED`
* **Procurement Volume**: 200 Quintals (20 Metric Tonnes)
* **Objective**: Evaluate buying wholesale lots at Nashik (Lasalgaon) and reselling into high-demand consuming terminal mandis (Azadpur, Delhi).

---

### Phase 1: Natural-Language Input & Intent Discovery

The merchant logs into the platform with institutional credentials and inputs:

> **Merchant Input**:  
> *"Looking to procure 200 quintals of Onion. Compare procurement at Lasalgaon vs Azadpur resale. Calculate gross margin, transport freight, APMC cess, and net expected margin."*

### Phase 2: Agent Tool Calling & Margin Modeling

1. **Step 1 — Purchase Discovery (`get_buy_recommendation`)**:
   * Evaluates available harvest lots and daily spot rates across producing hubs.
   * **Lasalgaon APMC (Nashik)**: Spot Quote = **₹1,850/Qtl**.
   * Total Crop Cost (200 Qtl): **₹3,70,000**.

2. **Step 2 — Resale Market Discovery (`compare_mandis`)**:
   * Checks consuming terminal markets for high-value demand.
   * **Azadpur Mandi, Delhi**: Terminal Wholesale Rate = **₹2,420/Qtl**.
   * Gross Realization (200 Qtl): **₹4,84,000**.
   * **Gross Trading Spread**: $₹4,84,000 - ₹3,70,000 = \mathbf{₹1,14,000}$ (+₹570/Qtl).

3. **Step 3 — Deterministic Expense Breakdown (`calculate_net_profit`)**:
   * **Distance**: Nashik &rarr; Delhi (~1,250 km).
   * **Freight Tariff**: 200 Qtl × 1,250 km × ₹0.18/Qtl/km = **₹45,000** (Full truckload 20 MT).
   * **APMC Statutory Cess (1.5%)**: ₹4,84,000 × 0.015 = **₹7,260**.
   * **Axis Escrow Guarantee Fee (0.5%)**: ₹4,84,000 × 0.005 = **₹2,420**.
   * **Transit Shrink / Spoilage Reserve (1.5%)**: 3 Qtl × ₹1,850 = **₹5,550**.
   * **Handling & Loading / Unloading Charges**: **₹4,000**.
   * **Total Operating Expenses**: ₹45,000 + ₹7,260 + ₹2,420 + ₹5,550 + ₹4,000 = **₹64,230**.

4. **Step 4 — Net Realized Margin Calculation**:
   $$\text{Net In-Hand Trading Margin} = \text{Gross Spread} - \text{Total Expenses}$$
   $$\text{Net Margin} = ₹1,14,000 - ₹64,230 = \mathbf{₹49,770} \quad (\mathbf{+13.45\%} \text{ ROI on capital})$$

5. **Step 5 — 5-Level Liquidity Verification (`get_market_liquidity`)**:
   * Inspects Azadpur order book to confirm depth:
     * Bid Level 1: 450 Qtl @ ₹2,420 (BigBasket Procurement)
     * Bid Level 2: 600 Qtl @ ₹2,410 (Mother Dairy Safal)
   * Confirms that Azadpur can absorb 200 quintals without price depression.

---

### Phase 3: Ethical Disclosure & Grounding

The agent presents the complete breakdown while enforcing transparency:

> **Important Disclosure**:  
> *"The ₹2,420/Qtl resale quote at Azadpur Mandi is based on today's AGMARKNET terminal modal rate and active institutional bids. It is not an irrevocable forward contract. Because onion is a perishable commodity subject to transit shrink (estimated at 1.5%), ensure climate-ventilated freight before dispatch."*

### Phase 4: Order Commitment & Escrow Locking

1. The merchant approves the trade.
2. The agent registers `MarketTransaction`:
   * Buyer: Rajkot Agri-Exports Pvt Ltd
   * Seller: Lasalgaon Farmer Producer Organisation
   * Escrow Hash: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
   * Escrow Status: `ESCROW_FUNDED (100% Funds Quarantined)`
3. The transaction is immediately accessible in the **Transactions & Escrow** page under **`🛒 BUYING ORDER`**, with live transit tracking.
