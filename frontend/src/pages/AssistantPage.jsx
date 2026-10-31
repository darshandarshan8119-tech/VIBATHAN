// src/pages/AssistantPage.jsx
import React, { useState } from 'react';
import ConversationSidebar from '../assistant/ConversationSidebar';
import ChatWindow from '../assistant/ChatWindow';

export default function AssistantPage({
  user,
  onLogout,
  onNavigateView, // 'assistant' | 'terminal' | 'transactions' | 'profile'
  activeView,
  onSelectCommodityForTerminal,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Conversations State
  const [conversations, setConversations] = useState([
    { id: 'conv-1', title: 'Wheat Liquidation & Best APMC Mandi', createdAt: 'Today, 10:15 AM' },
    { id: 'conv-2', title: 'Mustard 5-Level Depth & Buyers', createdAt: 'Yesterday' },
  ]);
  const [activeConversationId, setActiveConversationId] = useState('conv-1');

  // Messages State for Active Thread
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      role: 'assistant',
      timestamp: '10:15 AM',
      content: `Namaste ${user?.name ? user.name.split(' ')[0] : 'Kisan Member'}! I am your AgriMart Market Copilot.\n\nI have live telemetry connected to APMC electronic auction pits, AGMARKNET statutory benchmarks, and verified institutional buyer order books.\n\nHow can I assist your crop marketing today?`,
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [agentActivity, setAgentActivity] = useState(null);

  // Handle New Conversation
  const handleNewConversation = () => {
    const newId = `conv-${Date.now()}`;
    const newConv = { id: newId, title: 'New Market Inquiry', createdAt: 'Just now' };
    setConversations([newConv, ...conversations]);
    setActiveConversationId(newId);
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        timestamp: 'Just now',
        content: `Started a new conversation thread. How can I help analyze or liquidate your produce?`,
      }
    ]);
  };

  // Handle Delete Conversation
  const handleDeleteConversation = (convId) => {
    const filtered = conversations.filter(c => c.id !== convId);
    setConversations(filtered);
    if (activeConversationId === convId) {
      if (filtered.length > 0) {
        setActiveConversationId(filtered[0].id);
      } else {
        handleNewConversation();
      }
    }
  };

  // Agentic Query Dispatcher & Deterministic Pipeline Simulator (Phase 1 conversational UI engine)
  const handleSendMessage = (text) => {
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const lower = text.toLowerCase();

    // 1. COMPARISON INTENT (e.g. "which mandi", "compare", "best mandi", "100 quintals")
    if (lower.includes('compare') || lower.includes('best mandi') || lower.includes('which mandi') || lower.includes('proceeds')) {
      setAgentActivity({
        currentAction: 'Querying Regional APMC Mandi Feeds...',
        toolName: 'mandi_comparison_engine',
        steps: [
          'Fetching AGMARKNET modal prices for Ludhiana, Karnal, and Alwar APMCs',
          'Calculating transportation freight tariffs @ ₹18/Qtl/100km',
          'Applying 1.5% APMC Mandi Cess & 0.5% Escrow Protection guarantee',
        ]
      });

      setTimeout(() => {
        setIsLoading(false);
        setAgentActivity(null);

        const comparisonCard = {
          type: 'comparison',
          data: {
            commodity: 'Wheat (Sharbati Grade-A)',
            quantity: 100,
            unit: 'Quintals',
            recommendationReason: 'Ludhiana APMC yields ₹7,400 higher net proceeds than Karnal despite transportation distance.',
            mandis: [
              {
                mandiName: 'Ludhiana APMC, Punjab',
                quotedRate: 2450,
                distanceKm: 42,
                buyerDemandQty: 4200,
                estimatedFreight: 3200,
                mandiCess: 3675,
                estimatedNetProceeds: 238125,
              },
              {
                mandiName: 'Karnal APMC, Haryana',
                quotedRate: 2380,
                distanceKm: 85,
                buyerDemandQty: 2900,
                estimatedFreight: 4100,
                mandiCess: 3570,
                estimatedNetProceeds: 230330,
              },
              {
                mandiName: 'Alwar APMC, Rajasthan',
                quotedRate: 2340,
                distanceKm: 140,
                buyerDemandQty: 1800,
                estimatedFreight: 6200,
                mandiCess: 3510,
                estimatedNetProceeds: 224290,
              }
            ]
          }
        };

        const replyMsg = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `I analyzed 3 regional APMC mandis for your **100 quintals of Sharbati Wheat**.\n\nWhile quoted market rates appear close, **Ludhiana APMC** yields the highest net realization of **₹2,38,125** after factoring verified freight (42 km) and statutory APMC cess.`,
          card: comparisonCard,
          actions: [
            { label: 'Check Ludhiana 5-Level Depth', type: 'VIEW_DEPTH', payload: { commodity: 'Wheat', mandi: 'Ludhiana APMC' } },
            { label: 'Calculate Net Profit Breakdown', type: 'CALCULATE_PROFIT', payload: { commodity: 'Wheat', quantity: 100, mandi: 'Ludhiana APMC' } },
          ]
        };

        setMessages(prev => [...prev, replyMsg]);
      }, 1200);

    // 2. DEPTH & LIQUIDITY INTENT (e.g. "depth", "order book", "spread", "liquidity")
    } else if (lower.includes('depth') || lower.includes('order book') || lower.includes('spread') || lower.includes('liquidity')) {
      setAgentActivity({
        currentAction: 'Subscribing to Real-Time APMC Electronic Order Book...',
        toolName: 'fetch_order_depth',
        steps: [
          'Connecting to Ludhiana APMC electronic bidding pit',
          'Aggregating top 5 bids and asks',
          'Computing bid/ask spread and order imbalance ratio',
        ]
      });

      setTimeout(() => {
        setIsLoading(false);
        setAgentActivity(null);

        const liquidityCard = {
          type: 'liquidity',
          data: {
            commodity: 'Wheat (Sharbati)',
            mandi: 'Ludhiana APMC, Punjab',
            bestBid: 2450,
            bestAsk: 2470,
            spread: 20,
            spreadPct: '0.81%',
            totalBidQty: 450,
            totalAskQty: 380,
            unit: 'Qtl',
            imbalance: 'Bid Dominant (+18.4%)',
            bids: [
              { price: 2450, qty: 120, orders: 3 },
              { price: 2445, qty: 90, orders: 2 },
              { price: 2440, qty: 110, orders: 4 },
              { price: 2435, qty: 80, orders: 2 },
              { price: 2430, qty: 50, orders: 1 },
            ],
            asks: [
              { price: 2470, qty: 80, orders: 2 },
              { price: 2475, qty: 100, orders: 3 },
              { price: 2480, qty: 90, orders: 2 },
              { price: 2485, qty: 60, orders: 1 },
              { price: 2490, qty: 50, orders: 2 },
            ],
          }
        };

        const replyMsg = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `Here is the live **5-level market depth** for **Wheat (Sharbati)** at Ludhiana APMC.\n\nThe market is currently **Bid Dominant (+18.4%)** with a tight spread of **₹20/Qtl (0.81%)**, showing healthy institutional buying liquidity for lots under 300 Quintals.`,
          card: liquidityCard,
          actions: [
            { label: 'Open in Full Terminal', type: 'OPEN_TERMINAL', payload: { tab: 'exchange', commodity: 'Wheat' } },
            { label: 'Match Verified Institutional Buyers', type: 'MATCH_BUYERS', payload: { commodity: 'Wheat', mandi: 'Ludhiana APMC' } },
          ]
        };

        setMessages(prev => [...prev, replyMsg]);
      }, 1100);

    // 3. PROFITABILITY INTENT (e.g. "profit", "net proceeds", "expenses", "calculate")
    } else if (lower.includes('profit') || lower.includes('net') || lower.includes('calculate') || lower.includes('expenses')) {
      setAgentActivity({
        currentAction: 'Executing Deterministic Net Realization Engine...',
        toolName: 'calculate_net_profitability',
        steps: [
          'Calculating gross selling value @ ₹2,450/Qtl',
          'Itemizing transit freight, APMC cess, and escrow reserve',
          'Verifying moisture tolerance standard (11.0% basis)',
        ]
      });

      setTimeout(() => {
        setIsLoading(false);
        setAgentActivity(null);

        const profitCard = {
          type: 'profitability',
          data: {
            commodity: 'Wheat (Sharbati)',
            mandi: 'Ludhiana APMC, Punjab',
            quantity: 100,
            unit: 'Quintals',
            sellingPrice: 2450,
            grossValue: 245000,
            expenses: {
              transportation: 3200,
              mandiCess: 3675,
              escrowFee: 1225,
              qualityDeductions: 0,
              unloadingCharges: 400,
            },
            totalExpenses: 8500,
            estimatedNetProceeds: 236500,
          }
        };

        const replyMsg = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `I computed the deterministic expense breakdown for your **100 Quintals** at **₹2,450/Qtl**.\n\n* **Gross Selling Value**: ₹2,45,000\n* **Verified Deductions**: ₹8,500\n* **Estimated Net Proceeds**: **₹2,36,500**\n\n*(Note: This represents trade realization cash. Final farming profit depends on your individual crop production cost).*`,
          card: profitCard,
          actions: [
            { label: 'Book Weighbridge Slot', type: 'BOOK_SLOT', payload: { commodity: 'Wheat', mandi: 'Ludhiana APMC', quantity: 100 } }
          ]
        };

        setMessages(prev => [...prev, replyMsg]);
      }, 1000);

    // 4. FORECASTING INTENT (e.g. "forecast", "future", "predict", "trend", "price next week")
    } else if (lower.includes('forecast') || lower.includes('future') || lower.includes('predict') || lower.includes('trend')) {
      setAgentActivity({
        currentAction: 'Executing Historical Time-Series ARIMA Forecasting Engine...',
        toolName: 'forecast_commodity_price',
        steps: [
          'Loading 90-day historical AGMARKNET daily observations',
          'Fitting ARIMA(1,1,1) seasonal baseline',
          'Computing 95% confidence interval bounds',
        ]
      });

      setTimeout(() => {
        setIsLoading(false);
        setAgentActivity(null);

        const forecastCard = {
          type: 'forecast',
          data: {
            commodity: 'Wheat (Sharbati)',
            mandi: 'Ludhiana APMC, Punjab',
            horizon: '7-Day Ahead',
            currentPrice: 2450,
            predictedPrice: 2510,
            lowerRange: 2460,
            upperRange: 2560,
            modelName: 'Time-Series ARIMA(1,1,1) Baseline',
            evaluationMetric: 'MAPE: 2.14% on 90-day test window',
            direction: 'Moderate Bullish (+2.45%)',
          }
        };

        const replyMsg = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `Based on historical Agmarknet daily price observations, our statistical time-series model projects a **moderate bullish trend (+2.45%)** over the next 7 days, targeting **₹2,510/Qtl** (expected band: ₹2,460 - ₹2,560).\n\nIf your storage conditions permit, consider holding a portion of the harvest lot to capture this upward movement.`,
          card: forecastCard,
          actions: [
            { label: 'Check Live Order Depth', type: 'VIEW_DEPTH', payload: { commodity: 'Wheat', mandi: 'Ludhiana APMC' } }
          ]
        };

        setMessages(prev => [...prev, replyMsg]);
      }, 1200);

    // 5. BUYERS & PROCUREMENT INTENT (e.g. "buyer", "procurement", "merchants", "bids")
    } else if (lower.includes('buyer') || lower.includes('merchant') || lower.includes('bids') || lower.includes('who can buy')) {
      setAgentActivity({
        currentAction: 'Scanning Verified APMC Institutional Buyers Registry...',
        toolName: 'match_institutional_buyers',
        steps: [
          'Filtering licensed APMC merchants with active procurement mandates',
          'Verifying Axis Escrow pre-funded credit limits',
          'Matching quantity capacity against 100 Qtl target',
        ]
      });

      setTimeout(() => {
        setIsLoading(false);
        setAgentActivity(null);

        const buyerCard = {
          type: 'buyer',
          data: {
            commodity: 'Wheat (Sharbati)',
            mandi: 'Ludhiana APMC, Punjab',
            quantity: 100,
            buyers: [
              {
                id: 'buyer-1',
                name: 'Rajkot Agri-Exports Pvt Ltd',
                apmcLicense: 'APMC-RJK-2024-8841',
                offeredRate: 2465,
                requestedQty: 300,
                remainingCapacity: 180,
                settlementMode: 'Axis Escrow T+0 RTGS',
                isVerified: true,
                trustScore: '98.5%',
              },
              {
                id: 'buyer-2',
                name: 'Malwa Grain Commercial Traders',
                apmcLicense: 'APMC-LDH-2023-4109',
                offeredRate: 2450,
                requestedQty: 150,
                remainingCapacity: 150,
                settlementMode: 'Axis Escrow T+0 RTGS',
                isVerified: true,
                trustScore: '96.0%',
              }
            ]
          }
        };

        const replyMsg = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `I found **2 verified institutional APMC buyers** with pre-funded escrow looking for **Wheat (Sharbati)** at Ludhiana APMC.\n\n**Rajkot Agri-Exports** is currently offering a premium bid of **₹2,465/Qtl** with 180 Qtl of unfulfilled capacity.`,
          card: buyerCard,
          actions: [
            { label: 'Book Weighbridge Slot', type: 'BOOK_SLOT', payload: { commodity: 'Wheat', mandi: 'Ludhiana APMC' } }
          ]
        };

        setMessages(prev => [...prev, replyMsg]);
      }, 1000);

    // 6. SLOT BOOKING INTENT (e.g. "book slot", "slot", "delivery", "weighbridge", "tomorrow")
    } else if (lower.includes('book') || lower.includes('slot') || lower.includes('weighbridge') || lower.includes('delivery')) {
      setAgentActivity({
        currentAction: 'Verifying APMC Gate Weighbridge Capacity...',
        toolName: 'check_slot_availability',
        steps: [
          'Checking Ludhiana APMC Gate 2 automated scale schedule',
          'Confirming vehicle capacity for tractor trolley PB-10-DT-4821',
          'Generating priority reservation token',
        ]
      });

      setTimeout(() => {
        setIsLoading(false);
        setAgentActivity(null);

        const bookingCard = {
          type: 'booking',
          data: {
            mandi: 'Ludhiana APMC, Punjab',
            gate: 'Gate No. 2 (Bulk Grain Scales)',
            date: 'Tomorrow, 1 Nov 2026',
            timeSlot: '08:00 AM - 11:30 AM',
            commodity: 'Wheat (Sharbati)',
            quantity: 100,
            unit: 'Quintals',
            vehicleNo: 'PB-10-DT-4821',
            status: 'PENDING_CONFIRMATION',
          }
        };

        const replyMsg = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `I identified an open delivery window at **Ludhiana APMC Gate 2** for tomorrow morning.\n\nPlease review the booking details below and click **Authorize & Confirm Delivery Slot** to commit the reservation in the APMC scale ledger.`,
          card: bookingCard,
        };

        setMessages(prev => [...prev, replyMsg]);
      }, 950);

    // 7. GENERAL COMMODITY SPOT PRICE QUERY
    } else {
      setAgentActivity({
        currentAction: 'Querying Official APMC Spot Feeds...',
        toolName: 'get_commodity_price',
      });

      setTimeout(() => {
        setIsLoading(false);
        setAgentActivity(null);

        const priceCard = {
          type: 'price',
          data: {
            commodity: 'Wheat (Sharbati)',
            mandi: 'Ludhiana APMC, Punjab',
            currentPrice: 2450,
            prevPrice: 2390,
            change: '+2.4%',
            isUp: true,
            dayHigh: 2480,
            dayLow: 2410,
            source: 'AGMARKNET Daily Modal',
            agmarknetBenchmark: 2275,
          }
        };

        const replyMsg = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `The verified modal price for **Wheat (Sharbati)** at **Ludhiana APMC** is currently **₹2,450/Qtl** (+2.4% today), comfortably above the standard statutory MSP benchmark of ₹2,275/Qtl.`,
          card: priceCard,
          actions: [
            { label: 'Compare Regional Mandis', type: 'COMPARE_MANDIS', payload: { commodity: 'Wheat' } },
            { label: 'View 5-Level Depth Book', type: 'VIEW_DEPTH', payload: { commodity: 'Wheat', mandi: 'Ludhiana APMC' } },
          ]
        };

        setMessages(prev => [...prev, replyMsg]);
      }, 900);
    }
  };

  // Handle Actions Dispatched by Interactive Cards or Action Pills
  const handleAction = (type, payload) => {
    switch (type) {
      case 'OPEN_TERMINAL':
      case 'VIEW_DEPTH':
        if (onSelectCommodityForTerminal && payload?.commodity) {
          onSelectCommodityForTerminal(payload.commodity);
        }
        if (onNavigateView) onNavigateView('terminal');
        break;

      case 'VIEW_CONTRACT_NOTE':
        if (onNavigateView) onNavigateView('transactions');
        break;

      case 'COMPARE_MANDIS':
        handleSendMessage(`Compare regional APMC mandis for ${payload?.commodity || 'Wheat'}`);
        break;

      case 'CALCULATE_PROFIT':
        handleSendMessage(`Calculate net profitability for ${payload?.quantity || 100} quintals of ${payload?.commodity || 'Wheat'}`);
        break;

      case 'MATCH_BUYERS':
        handleSendMessage(`Show verified APMC buyers for ${payload?.commodity || 'Wheat'}`);
        break;

      case 'BOOK_SLOT':
        handleSendMessage(`Book delivery slot at ${payload?.mandi || 'Ludhiana APMC'} for ${payload?.commodity || 'Wheat'}`);
        break;

      case 'SLOT_CONFIRMED': {
        const confirmMsg = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `✅ **Slot ${payload.bookingId} Confirmed!**\n\nYour priority weighbridge arrival token for **${payload.mandi}** on **${payload.date}** has been registered in the APMC gate ledger.\n\nYou can present this digital slip at Gate 2 for gross weight certification.`,
          actions: [
            { label: 'View in My Transactions', type: 'VIEW_CONTRACT_NOTE', payload: {} },
            { label: 'Open Market Terminal', type: 'OPEN_TERMINAL', payload: {} },
          ]
        };
        setMessages(prev => [...prev, confirmMsg]);
        break;
      }

      default:
        console.log('Action dispatched:', type, payload);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4.5rem)] overflow-hidden">
      {/* ChatGPT-style Left Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        activeView={activeView}
        onSelectView={onNavigateView}
        user={user}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Conversation Window */}
      <ChatWindow
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        agentActivity={agentActivity}
        conversationTitle={conversations.find(c => c.id === activeConversationId)?.title || 'Market Intelligence'}
        onClearMessages={() => setMessages([])}
        onOpenSidebar={() => setSidebarOpen(true)}
        onAction={handleAction}
      />
    </div>
  );
}
