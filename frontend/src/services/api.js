// src/services/api.js
// AgriMart Market Intelligence API Client for Django Core (Port 8000) & FastAPI Realtime (Port 8001)

const DJANGO_BASE_URL = import.meta.env.VITE_DJANGO_URL || 'http://127.0.0.1:8000';
const FASTAPI_BASE_URL = import.meta.env.VITE_FASTAPI_URL || 'http://127.0.0.1:8001';

/**
 * Helper to execute fetch with JSON headers and authorization if present
 */
async function apiRequest(endpoint, options = {}, baseUrl = DJANGO_BASE_URL) {
  const token = localStorage.getItem('agrimart_access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData.error || errorData.detail || `Request failed with status ${response.status}`;

    // A server restart or an expired JWT can leave an old token in the browser.
    // Reset it once here so every authenticated feature recovers consistently.
    if (response.status === 401) {
      apiLogout();
      window.dispatchEvent(new Event('agrimart-auth-expired'));
      throw new Error('Your session has expired. Please sign in again.');
    }

    throw new Error(errorMsg);
  }

  return response.json();
}

/**
 * Unified Authentication: Authenticates farmer, merchant, or admin
 */
export async function apiLogin(identifier, password, role) {
  const data = await apiRequest('/api/v1/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ identifier, password, role }),
  });

  if (data.tokens?.access) {
    localStorage.setItem('agrimart_access_token', data.tokens.access);
    localStorage.setItem('agrimart_refresh_token', data.tokens.refresh);
    localStorage.setItem('agrimart_user', JSON.stringify(data.user));
  }
  return data;
}

/**
 * Register a new Farmer or Merchant user
 */
export async function apiRegister(registrationPayload) {
  const data = await apiRequest('/api/v1/auth/register/', {
    method: 'POST',
    body: JSON.stringify(registrationPayload),
  });

  if (data.tokens?.access) {
    localStorage.setItem('agrimart_access_token', data.tokens.access);
    localStorage.setItem('agrimart_refresh_token', data.tokens.refresh);
    localStorage.setItem('agrimart_user', JSON.stringify(data.user));
  }
  return data;
}

/**
 * Fetch Current Authenticated User
 */
export async function apiGetCurrentUser() {
  return apiRequest('/api/v1/auth/me/');
}

/**
 * Clear Local Session on Logout
 */
export function apiLogout() {
  localStorage.removeItem('agrimart_access_token');
  localStorage.removeItem('agrimart_refresh_token');
  localStorage.removeItem('agrimart_user');
}

/**
 * Fetch Live Mandi Daily Tickers
 */
export async function apiGetMandiTickers() {
  return apiRequest('/api/v1/mandi/tickers/');
}

/**
 * Fetch Commodities Master List
 */
export async function apiGetCommodities() {
  return apiRequest('/api/v1/mandi/commodities/');
}

/**
 * Fetch Mandi APMC Master List
 */
export async function apiGetAPMCs() {
  return apiRequest('/api/v1/mandi/apmcs/');
}

/**
 * Fetch Active Mandi Auction Lots
 */
export async function apiGetAuctionLots() {
  return apiRequest('/api/v1/mandi/lots/');
}

export async function apiAssistantChat(message, conversationId, explanationLevel = 'simple', language = 'en') {
  return apiRequest('/api/v1/assistant/chat/', {
    method: 'POST',
    body: JSON.stringify({
      message,
      ...(conversationId ? { conversation_id: conversationId } : {}),
      explanation_level: explanationLevel,
      language,
    }),
  });
}

/**
 * Get Verified Electronic Contract Notes & Escrow Transactions
 */
export async function apiGetTransactions() {
  return apiRequest('/api/v1/transactions/');
}

/**
 * Get APMC Delivery Gate Slot Bookings
 */
export async function apiGetMyBookings() {
  return apiRequest('/api/v1/bookings/my-bookings/');
}

/**
 * Create a Delivery Slot Booking
 */
export async function apiCreateSlotBooking(slotId, commodityCode, quantityQuintals, vehicleNumber, driverPhone) {
  return apiRequest('/api/v1/bookings/create/', {
    method: 'POST',
    body: JSON.stringify({
      slot_id: slotId,
      commodity_code: commodityCode,
      quantity_quintals: quantityQuintals,
      vehicle_number: vehicleNumber,
      driver_phone: driverPhone || '',
    }),
  });
}

/**
 * Place a Bid on an Auction Lot (Django Core with Row-Level Lock & Idempotency)
 */
export async function apiPlaceBid(lotId, bidAmountPerQtl, idempotencyKey) {
  return apiRequest(`/api/v1/mandi/lots/${lotId}/bid/`, {
    method: 'POST',
    body: JSON.stringify({
      bid_amount_per_qtl: bidAmountPerQtl,
      idempotency_key: idempotencyKey || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'idem-' + Date.now()),
    }),
  });
}

/**
 * Place a High-Frequency Realtime Bid (FastAPI Gateway with Redis sliding-window rate limit)
 */
export async function apiPlaceRealtimeBid(lotId, bidAmountPerQtl, idempotencyKey) {
  return apiRequest(
    '/api/v1/mandi/bid',
    {
      method: 'POST',
      body: JSON.stringify({
        lot_id: lotId,
        bid_amount_per_qtl: bidAmountPerQtl,
        idempotency_key: idempotencyKey || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'idem-' + Date.now()),
      }),
    },
    FASTAPI_BASE_URL
  );
}

export { DJANGO_BASE_URL, FASTAPI_BASE_URL };

