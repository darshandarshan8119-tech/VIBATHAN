// src/data/mockData.js
// AgriMart Market Intelligence Master Data: APMC Mandi Commodities, Infrastructure & Contract Ledger

export const LIVE_MANDI_COMMODITIES = [
  {
    id: 'wheat-ludhiana',
    name: 'Wheat (Sharbati/Kharif)',
    mandi: 'Ludhiana APMC, Punjab',
    price: 2450,
    prevPrice: 2390,
    change: '+2.4%',
    isUp: true,
    dayHigh: 2480,
    dayLow: 2410,
    volume: '4,200 Qtl',
    sparkline: [2380, 2395, 2410, 2400, 2430, 2445, 2450],
    image: '/images/mandi-wheat-sacks.jpg',
    cropImage: '/images/seeds-sharbati-wheat.jpg',
    grade: 'Grade-A Sharbati',
    moisture: '11.2%'
  },
  {
    id: 'mustard-alwar',
    name: 'Mustard Seed (Pusa Bold Black)',
    mandi: 'Alwar APMC, Rajasthan',
    price: 5680,
    prevPrice: 5580,
    change: '+1.8%',
    isUp: true,
    dayHigh: 5720,
    dayLow: 5550,
    volume: '2,800 Qtl',
    sparkline: [5500, 5540, 5580, 5610, 5590, 5650, 5680],
    image: '/images/seeds-mustard-sarson.jpg',
    cropImage: '/images/seeds-mustard-sarson.jpg',
    grade: 'High-Oil 42%',
    moisture: '7.8%'
  },
  {
    id: 'cotton-rajkot',
    name: 'Cotton (Shankar-6 Long Staple)',
    mandi: 'Rajkot APMC, Gujarat',
    price: 7140,
    prevPrice: 7180,
    change: '-0.6%',
    isUp: false,
    dayHigh: 7220,
    dayLow: 7110,
    volume: '6,400 Bales',
    sparkline: [7250, 7220, 7200, 7180, 7190, 7160, 7140],
    image: '/images/mandi-cotton-bales.jpg',
    cropImage: '/images/seeds-cotton-shankar.jpg',
    grade: '29mm Micronaire',
    moisture: '8.4%'
  },
  {
    id: 'paddy-karnal',
    name: 'Basmati Paddy 1121 Extra Long',
    mandi: 'Karnal APMC, Haryana',
    price: 4420,
    prevPrice: 4290,
    change: '+3.1%',
    isUp: true,
    dayHigh: 4460,
    dayLow: 4280,
    volume: '5,100 Qtl',
    sparkline: [4220, 4260, 4290, 4320, 4360, 4400, 4420],
    image: '/images/seeds-basmati-paddy.jpg',
    cropImage: '/images/seeds-basmati-paddy.jpg',
    grade: 'Export Grade 8.35mm',
    moisture: '12.0%'
  },
  {
    id: 'soybean-indore',
    name: 'Soybean (Yellow High Protein)',
    mandi: 'Indore APMC, Madhya Pradesh',
    price: 4820,
    prevPrice: 4780,
    change: '+0.9%',
    isUp: true,
    dayHigh: 4850,
    dayLow: 4760,
    volume: '3,700 Qtl',
    sparkline: [4720, 4750, 4780, 4760, 4790, 4810, 4820],
    image: '/images/seeds-soybean-yellow.jpg',
    cropImage: '/images/seeds-soybean-yellow.jpg',
    grade: 'Yellow Food-Grade',
    moisture: '10.5%'
  },
  {
    id: 'maize-davangere',
    name: 'Hybrid Maize / Corn Feed Grade',
    mandi: 'Davangere APMC, Karnataka',
    price: 2280,
    prevPrice: 2210,
    change: '+3.2%',
    isUp: true,
    dayHigh: 2310,
    dayLow: 2190,
    volume: '6,100 Qtl',
    sparkline: [2190, 2210, 2240, 2230, 2260, 2275, 2280],
    image: '/images/seeds-hybrid-maize.jpg',
    cropImage: '/images/seeds-hybrid-maize.jpg',
    grade: 'Starch > 68%',
    moisture: '11.8%'
  }
];

export const MANDI_INFRASTRUCTURE = [
  {
    id: 'silo-terminal',
    title: 'Automated Grain Silo Terminal',
    description: 'Bulk moisture-controlled vertical storage with 50,000 MT capacity, nitrogen-blanketed silos and digital truck discharge.',
    image: '/images/mandi-silo-terminal.jpg',
    tag: 'National APMC Terminal'
  },
  {
    id: 'weighbridge',
    title: 'Electronic Inflow Weighbridge Station',
    description: 'Direct gross & tare axle scale with automated weighment slip generation linked directly to e-NAM digital clearing.',
    image: '/images/mandi-weighbridge-station.jpg',
    tag: 'High-Precision Scales'
  },
  {
    id: 'auction-yard',
    title: 'Regulated Open Pavilion Auction Floor',
    description: 'Licensed commission agent pits with electronic open-outcry bidding and digital live commodity ticker screens.',
    image: '/images/mandi-auction-yard.jpg',
    tag: 'Regulated Market Yard'
  },
  {
    id: 'moisture-lab',
    title: 'Digital NIR Grain Moisture & Assay Lab',
    description: 'Instant NIR spectroscopy testing providing certified Grade A/B laboratory reports before trade escrow settlement.',
    image: '/images/mandi-moisture-meter.jpg',
    tag: 'AGMARK / NCDEX Certified'
  },
  {
    id: 'cotton-depot',
    title: 'Wholesale Baled Cotton Staging Depot',
    description: 'Climate-monitored asphalt staging yard with hydraulic bale clamps, steel banding and fire-safe staging logistics.',
    image: '/images/mandi-cotton-bales.jpg',
    tag: 'Commodity Staging Hub'
  },
  {
    id: 'grain-godown',
    title: 'Tier-1 Ventilated Grain Storage Godown',
    description: 'Multi-layer dunnage burlap jute stacking preserving natural grain quality and grain dust control without chemical fumigants.',
    image: '/images/mandi-wheat-sacks.jpg',
    tag: 'CWC Accredited Storage'
  }
];

// Programmatic Financials Calculation for Mandi Escrow Contracts
export const computeTransactionFinancials = (quantity, rate, freightPerUnit = 18) => {
  const q = Number(quantity) || 0;
  const r = Number(rate) || 0;
  const produceSubtotal = Math.round(q * r);
  const mandiCess = Math.round(produceSubtotal * 0.015); // 1.5% APMC Mandi Cess
  const escrowFee = Math.round(produceSubtotal * 0.005); // 0.5% Escrow Protection Guarantee
  const freight = Math.round(q * freightPerUnit); // Transit freight
  const totalEscrow = produceSubtotal + mandiCess + escrowFee + freight;
  return {
    produceSubtotal,
    mandiCess,
    escrowFee,
    freight,
    totalEscrow
  };
};

// Standardized 6-Step Transaction Lifecycle Timeline
export const TRANSACTION_LIFECYCLE_STEPS = [
  { id: 1, label: 'Order Created', key: 'ORDER_CREATED', desc: 'Trade matched & agreement registered' },
  { id: 2, label: 'Buyer Funds Secured', key: 'ESCROW_SECURED', desc: 'Funds quarantined in Axis Escrow Simulation' },
  { id: 3, label: 'Delivery / Verification', key: 'DELIVERY_VERIFICATION', desc: 'e-NWR electronic transfer or vehicle dispatch' },
  { id: 4, label: 'Gate Weighment', key: 'GATE_WEIGHMENT', desc: 'Gross axle certified at APMC electronic scale' },
  { id: 5, label: 'Final Settlement', key: 'SETTLEMENT_PENDING', desc: 'Assay specs & moisture deductions reconciled' },
  { id: 6, label: 'Payment Released', key: 'PAYMENT_RELEASED', desc: 'T+0 RTGS bank credit released to farmer' }
];

// Distinct, Programmatically Consistent Contract Transactions
export const SAMPLE_CONTRACT_TRANSACTIONS = [
  {
    contractNumber: 'AGX-2026-74741',
    orderId: 'ORD-AGX-48291',
    escrowReference: 'ESC-AXIS-683553',
    commodity: 'Wheat',
    cropFullName: 'Wheat (Sharbati Grade-A)',
    grade: 'Sharbati Grade-A Premium',
    variety: 'C-306 Sharbati Golden',
    mandi: 'Ludhiana APMC, Punjab',
    quantity: 120,
    unit: 'Quintals',
    rate: 2450,
    deliveryMode: 'e-NWR Electronic Warehouse Receipt',
    deliveryCode: 'E_NWR',
    buyer: 'ITC Agri Business Division',
    seller: 'Harpreet Singh (Khanna FPO)',
    lotRef: 'LOT-9821',
    timestamp: '11:51:57 AM',
    date: '17 Sep 2026',
    status: 'Escrow Secured',
    currentStep: 3, // Delivery / Verification
    financials: computeTransactionFinancials(120, 2450, 18),
    disclaimer: 'Electronic transaction record generated by the AgriMart prototype. This prototype demonstrates the proposed transaction workflow and does not constitute a legally binding electronic contract.'
  },
  {
    contractNumber: 'AGX-2026-33965',
    orderId: 'ORD-AGX-39120',
    escrowReference: 'ESC-AXIS-219401',
    commodity: 'Maize',
    cropFullName: 'Maize (Hybrid Grain)',
    grade: 'Hybrid Grade-A',
    variety: 'Pioneer P3302 Yellow',
    mandi: 'Karnal APMC, Haryana',
    quantity: 80,
    unit: 'Quintals',
    rate: 2280,
    deliveryMode: 'Physical Spot / Gate Pickup',
    deliveryCode: 'PHYSICAL_SPOT',
    buyer: 'Cargill Animal Nutrition',
    seller: 'Rajeshwar Tyagi (Karnal FPO)',
    lotRef: 'LOT-9714',
    timestamp: '09:15:20 AM',
    date: '17 Sep 2026',
    status: 'Awaiting Gate Weighment',
    currentStep: 4, // Gate Weighment
    financials: computeTransactionFinancials(80, 2280, 18),
    disclaimer: 'Electronic transaction record generated by the AgriMart prototype. This prototype demonstrates the proposed transaction workflow and does not constitute a legally binding electronic contract.'
  },
  {
    contractNumber: 'AGX-2026-51823',
    orderId: 'ORD-AGX-82194',
    escrowReference: 'ESC-AXIS-554109',
    commodity: 'Rice (Paddy)',
    cropFullName: 'Basmati Paddy 1121',
    grade: 'Export Grade Sona / Basmati',
    variety: 'Pusa 1121 Traditional',
    mandi: 'Karnal APMC, Haryana',
    quantity: 50,
    unit: 'Quintals',
    rate: 3150,
    deliveryMode: 'e-NWR Electronic Warehouse Receipt',
    deliveryCode: 'E_NWR',
    buyer: 'KRBL Limited (India Gate)',
    seller: 'Gurmail Singh Sandhu',
    lotRef: 'LOT-9650',
    timestamp: '04:30:12 PM',
    date: '16 Sep 2026',
    status: 'Settlement Pending',
    currentStep: 5, // Final Settlement
    financials: computeTransactionFinancials(50, 3150, 18),
    disclaimer: 'Electronic transaction record generated by the AgriMart prototype. This prototype demonstrates the proposed transaction workflow and does not constitute a legally binding electronic contract.'
  },
  {
    contractNumber: 'AGX-2026-92410',
    orderId: 'ORD-AGX-11048',
    escrowReference: 'ESC-AXIS-882193',
    commodity: 'Mustard Seed',
    cropFullName: 'Mustard (Sarson High-Oil)',
    grade: 'Sarson Giriraj 42% Oil',
    variety: 'Giriraj High Oil Cultivar',
    mandi: 'Alwar APMC, Rajasthan',
    quantity: 90,
    unit: 'Quintals',
    rate: 5680,
    deliveryMode: 'Physical Spot / Gate Pickup',
    deliveryCode: 'PHYSICAL_SPOT',
    buyer: 'Adani Wilmar Ltd',
    seller: 'Ramavtar Sharma (Bharatpur Lot)',
    lotRef: 'LOT-9823',
    timestamp: '11:20:00 AM',
    date: '15 Sep 2026',
    status: 'Payment Released',
    currentStep: 6, // Payment Released
    financials: computeTransactionFinancials(90, 5680, 18),
    disclaimer: 'Electronic transaction record generated by the AgriMart prototype. This prototype demonstrates the proposed transaction workflow and does not constitute a legally binding electronic contract.'
  },
  {
    contractNumber: 'AGX-2026-18492',
    orderId: 'ORD-AGX-66710',
    escrowReference: 'ESC-AXIS-330198',
    commodity: 'Cotton',
    cropFullName: 'Cotton (Shankar-6 29mm)',
    grade: 'Shankar-6 29mm Long Staple',
    variety: 'Shankar-6 Certified Ginned',
    mandi: 'Rajkot APMC, Gujarat',
    quantity: 85,
    unit: 'Bales',
    rate: 7100,
    deliveryMode: 'e-NWR Electronic Warehouse Receipt',
    deliveryCode: 'E_NWR',
    buyer: 'Vardhman Textiles Procurement',
    seller: 'Bhikhabhai Patel (Gondal Lot)',
    lotRef: 'LOT-9822',
    timestamp: '02:15:45 PM',
    date: '14 Sep 2026',
    status: 'Escrow Secured',
    currentStep: 2, // Buyer Funds Secured
    financials: computeTransactionFinancials(85, 7100, 18),
    disclaimer: 'Electronic transaction record generated by the AgriMart prototype. This prototype demonstrates the proposed transaction workflow and does not constitute a legally binding electronic contract.'
  }
];

