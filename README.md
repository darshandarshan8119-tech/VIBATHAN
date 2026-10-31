# AgriMart-Market-Intelligence

**AgriMart Market Intelligence** is a standalone, high-performance APMC agricultural commodity exchange and mandi market intelligence platform extracted from AgriMart.

This project delivers real-time commodity price discovery, AGMARKNET statutory modal rate benchmarks, 5-level market depth, standardized moisture assay deductions, transparent bid/ask spreads, wholesale lot auctions, and T+0 escrow clearing—while preserving AgriMart's full authentication and architectural design system, completely independent of the e-commerce store, product catalog, cart, and machinery rentals.

---

## 1. Project Overview & Architecture

The architecture consists of a decoupled frontend and dual-service backend:

```
AgriMart-Market-Intelligence/
├── backend/
│   ├── agrimart/            # Django Core Project configuration (Settings, URLs, Celery, WSGI/ASGI)
│   ├── common/              # Outbox pattern, idempotency keys, audit logs, security middleware, seed commands
│   ├── users/               # CustomUser, FarmerProfile, MerchantProfile, JWT & registration endpoints
│   ├── mandi/               # APMC mandis, commodities, daily tickers, auction lots, merchant bids, settlements
│   ├── realtime/            # FastAPI & Redis gateway for high-frequency bids & live market WebSockets
│   ├── tests/               # Pytest suite for Auth, Mandi APIs, Realtime schemas, and security
│   ├── market_intelligence.db.sqlite3 # Independent development database
│   ├── manage.py
│   ├── pyproject.toml
│   └── requirements.txt
├── frontend/
│   ├── public/              # Image assets for commodities, mandi terminals, and estate photography
│   ├── src/
│   │   ├── components/      # Standalone Market terminal views, Skanvi authentication, Navbar, Footer
│   │   │   ├── AgriStockExchangeView.jsx    # Complete Market Intelligence terminal (Charts, Depth, Escrow, Lots)
│   │   │   ├── MandiMarketTerminal.jsx       # APMC Mandi radar & harvest lot listing
│   │   │   ├── MandiTicker.jsx               # Real-time national mandi price strip
│   │   │   ├── MarketLandingPage.jsx         # Public landing portal focused on Market Intelligence
│   │   │   ├── SkanviLoginPage.jsx           # Scandinavian dual-mode login & registration
│   │   │   ├── Interactive3DLoginPage.jsx    # 3D interactive login modal
│   │   │   ├── Navbar.jsx                    # Navigation specialized for Market Intelligence
│   │   │   ├── Footer.jsx                    # Regulatory disclosures & APMC hubs footer
│   │   │   ├── SearchModal.jsx               # Dedicated commodity & mandi search modal
│   │   │   └── AestheticTransitionLoader.jsx # View transition loader
│   │   ├── data/            # Master market commodities, infrastructure, and contract ledger
│   │   │   └── mockData.js
│   │   ├── services/        # API client for Django Core (Port 8000) and FastAPI Realtime (Port 8001)
│   │   │   └── api.js
│   │   ├── App.jsx          # Standalone application controller
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 2. Preserved Features

### Authentication & User Management
* **Dual-mode Skanvi Login & Registration Page**: Preserved full UI styling, typography, and interactive responsive layout.
* **Role-Based Profiles**: `FarmerProfile` (cultivation acreage, soil type, irrigation) and `MerchantProfile` (company name, APMC license, credit limit, risk status).
* **JWT & Session Security**: Token-based authentication via SimpleJWT (`/api/v1/auth/login/`, `/api/v1/auth/register/`, `/api/v1/auth/me/`, `/api/v1/auth/token/refresh/`).
* **Argon2 & PBKDF2 Password Hashing**: Enterprise-grade password hashing retained.
* **1-Click Demo Testing**: Instant login credentials for Kisan Member (`Devinder Singh`) and APMC Merchant (`Rajkot Agri-Exports Pvt Ltd`).

### Market Intelligence & Commodity Exchange
* **Market Terminal Dashboard (`AgriStockExchangeView`)**: Full terminal layout with real-time tickers, arrivals, auction lots, merchant bids, and contracts.
* **1D, 1W, 1M, and 1Y Price Charts**: Interactive timeframe filtering with dynamic canvas charts and high/low tracking.
* **5-Level Market Depth & Spread**: Top 5 buyer bids vs top 5 seller asks, depth visualization, and real-time bid/ask spread.
* **AGMARKNET Modal Benchmarks**: Comparison of live market bids against statutory AGMARKNET benchmark rates.
* **Transparent Moisture Assays**: Algorithmic moisture discount deductions based on standard basis bands.
* **Real-Time Arrivals & Weighbridge Queue**: Inflow monitoring with vehicle numbers, net weights, and moisture readings across APMC gates.
* **Contract Notes & Escrow Ledger**: Complete 6-step transaction lifecycle (Order Created &rarr; Escrow Secured &rarr; Verification &rarr; Gate Weighment &rarr; Final Settlement &rarr; Payment Released) with downloadable PDF contract summaries.
* **Kisan Auction Desk**: Farmers can list harvest lots specifying reserve price, quantity in quintals, and moisture percentage.
* **Mandi Search Modal (`Cmd+K`)**: Instant search for commodities (Wheat, Mustard, Cotton, Basmati Paddy, Soybean, Maize) and APMC mandis.

---

## 3. Removed E-commerce & Unrelated Modules

The following e-commerce components and routes have been completely removed from this project:
1. **General Inputs Store**: Product catalog, category carousels, seed/fertilizer product cards (`ProductCard.jsx`, `CategoryCarousel.jsx`, `CategoryBar.jsx`).
2. **Shopping Cart & Checkout**: Slide-over cart drawer (`CartDrawer.jsx`), cart item counters, add-to-cart handlers, and consumer checkout workflows.
3. **Equipment Rental Marketplace**: Heavy machinery rental fleet (`TractorRentalHub.jsx`, `rentals` Django app, tractor booking ACID transactions).
4. **AI Crop Disease Diagnostics**: AI Crop Doctor leaf scanner (`CropDoctorScanner.jsx`, `ai` Django app, OCR parsers, ML classifier models).
5. **E-commerce Order Management**: `store` Django app, consumer shopping orders, inventory ledgers, and consumer payment workflows.

All API routes under `/api/v1/store/` and `/api/v1/rentals/` have been unmounted and return `404 Not Found`.

---

## 4. Database Setup & Seeding

The application uses an independent SQLite database (`market_intelligence.db.sqlite3`) for local development, with full PostgreSQL support via `DATABASE_URL`.

### Apply Migrations
```bash
cd backend
python manage.py migrate
```

### Seed Master Market Catalog
An independent management command seeds 3 core users, 6 APMCs, 10 standardized commodities with AGMARKNET rates, daily tickers, and active auction lots:
```bash
python manage.py seed_market
```

#### Seeded Credentials
| Role | Identifier (Phone) | Password | Full Name / Organization |
|---|---|---|---|
| **Admin** | `9999999999` | `AdminPassword@2026` | AgriMart Systems Administrator |
| **Farmer** | `9876543210` | `FarmerPassword@2026` | Devinder Singh (Punjab Estate) |
| **Merchant** | `9123456780` | `MerchantPassword@2026` | Rajkot Agri-Exports Pvt Ltd |

---

## 5. Installation & Execution Guide

### Prerequisites
* Python 3.12+
* Node.js 18+ and npm
* (Optional) Redis (for FastAPI high-frequency bidding & WebSocket channels)

### Backend Startup

1. **Navigate to backend and create virtual environment**:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Initialize Database**:
   ```bash
   python manage.py migrate
   python manage.py seed_market
   ```

3. **Start Django Core Server (Port 8000)**:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

4. **(Optional) Start FastAPI Realtime Gateway (Port 8001)**:
   ```bash
   uvicorn realtime.main:app --host 0.0.0.0 --port 8001 --reload
   ```

### Frontend Startup

1. **Navigate to frontend**:
   ```bash
   cd frontend
   npm install
   ```

2. **Run Vite Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

3. **Production Build**:
   ```bash
   npm run build
   ```

---

## 6. Verification & Test Suite

The test suite covers authentication, commodity endpoints, APMC mandis, active auction lots, bidding idempotency, realtime schemas, and verifies that removed e-commerce routes are completely inaccessible:

```bash
cd backend
pytest tests -v
```

### Test Results
```
tests/test_api_endpoints.py::test_mandi_health_endpoint PASSED
tests/test_api_endpoints.py::test_commodities_endpoint_returns_success PASSED
tests/test_api_endpoints.py::test_mandi_tickers_endpoint_returns_success PASSED
tests/test_api_endpoints.py::test_apmcs_endpoint_returns_success PASSED
tests/test_api_endpoints.py::test_auction_lots_endpoint_returns_success PASSED
tests/test_api_endpoints.py::test_auth_login_endpoint_issues_jwt PASSED
tests/test_api_endpoints.py::test_auth_register_endpoint PASSED
tests/test_api_endpoints.py::test_removed_ecommerce_routes_return_404 PASSED
tests/test_realtime_schemas.py::test_bid_request_validation PASSED
tests/test_security_utils.py::test_constant_time_equal PASSED
tests/test_security_utils.py::test_stable_json_hash_key_ordering PASSED
tests/test_security_utils.py::test_hash_external_key PASSED

12 passed in 1.16s
```

