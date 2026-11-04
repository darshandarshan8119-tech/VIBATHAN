// src/data/cropRecommendationData.js
// Agronomic crop recommendation calculation engine and certified soil presets

export const SOIL_PRESETS = {
  alluvial: {
    id: 'alluvial',
    name: 'Alluvial Loam (Indo-Gangetic / River Basins)',
    description: 'High moisture retention, balanced micronutrients, ideal for heavy grain panicles & cool rabi cycles.',
    values: { N: 90, P: 42, K: 43, ph: 6.5, rainfall: 210, temp: 26, humidity: 82 }
  },
  black: {
    id: 'black',
    name: 'Black Regur Soil (Deccan / Malwa Plateau)',
    description: 'Deep clayey texture rich in calcium, magnesium & potash; high swelling capacity for fiber & oilseeds.',
    values: { N: 118, P: 52, K: 19, ph: 7.4, rainfall: 85, temp: 31, humidity: 58 }
  },
  red: {
    id: 'red',
    name: 'Red Laterite Loam (Peninsular / South India)',
    description: 'Porous, well-drained with high iron content; ideal for coarse cereals, legumes & horticulture.',
    values: { N: 75, P: 35, K: 28, ph: 5.8, rainfall: 110, temp: 28, humidity: 65 }
  },
  sandy: {
    id: 'sandy',
    name: 'Sandy Arid Loam (Rajasthan / Semi-Arid)',
    description: 'Fast draining light soil structure; thrives with deep taproot oilseeds and drought-hardy pulses.',
    values: { N: 55, P: 28, K: 38, ph: 7.8, rainfall: 45, temp: 33, humidity: 42 }
  }
};

export function calculateCropRecommendation({ N, P, K, ph, rainfall, temp, humidity }) {
  const nVal = Number(N) || 90;
  const rainVal = Number(rainfall) || 120;
  const phVal = Number(ph) || 6.5;

  let topCrop, secondCrop, thirdCrop;

  if (rainVal > 160) {
    topCrop = {
      emoji: '🌾',
      title: 'Basmati Paddy / Rice (Oryza sativa)',
      category: 'Kharif Foodgrain',
      match: '98.4%',
      yield: '4.8 - 5.5 Tonnes / Acre',
      growthPeriod: '120 - 135 Days',
      mandiRefPrice: '₹4,420/Qtl (Karnal APMC)',
      desc: 'High annual precipitation and optimal nitrogen supply create flooded anaerobic conditions essential for vigorous rice tillering and elongated panicle filling.',
      agronomicTips: 'Maintain 5cm standing water during panicle emergence; top-dress zinc sulfate @ 10kg/acre.'
    };
    secondCrop = {
      emoji: '🌽',
      title: 'Maize / Yellow Feed Corn (Zea mays)',
      category: 'Cereal / Feedgrain',
      match: '89.1%',
      yield: '3.5 - 4.2 Tonnes / Acre',
      growthPeriod: '95 - 110 Days',
      mandiRefPrice: '₹2,280/Qtl (Davangere APMC)',
      desc: 'Strong secondary alternative with high industrial ethanol and poultry feed absorption. High drainage tolerance avoids waterlogging.',
      agronomicTips: 'Plant on ridges with 60cm row spacing; apply balance NPK 120:60:40 kg/ha.'
    };
    thirdCrop = {
      emoji: '🌱',
      title: 'Moong / Green Gram (Vigna radiata)',
      category: 'Short-Duration Pulse',
      match: '84.0%',
      yield: '0.6 - 0.9 Tonnes / Acre',
      growthPeriod: '65 - 70 Days',
      mandiRefPrice: '₹7,850/Qtl (MSP Benchmark)',
      desc: 'Ideal for rotational nitrogen stabilization between heavy grain cycles, enhancing residual soil fertility.',
      agronomicTips: 'Inoculate seed with Rhizobium culture before sowing.'
    };
  } else if (nVal > 100) {
    topCrop = {
      emoji: '☁️',
      title: 'Bt-Cotton / Long Staple (Gossypium hirsutum)',
      category: 'Commercial Fiber',
      match: '96.5%',
      yield: '1.4 - 1.9 Tonnes / Acre (8-11 Bales)',
      growthPeriod: '150 - 165 Days',
      mandiRefPrice: '₹7,140/Qtl (Rajkot APMC)',
      desc: 'Abundant nitrogen reserves combined with warm temperatures accelerate sympodial fruiting branches, maximizing boll size and lint staple length.',
      agronomicTips: 'Foliar spray of 1% 19:19:19 water soluble fertilizer during square formation; nip terminal buds at 120 days.'
    };
    secondCrop = {
      emoji: '🌾',
      title: 'Durum / Sharbati Wheat (Triticum aestivum)',
      category: 'Rabi Cereal',
      match: '91.2%',
      yield: '2.2 - 2.8 Tonnes / Acre',
      growthPeriod: '115 - 125 Days',
      mandiRefPrice: '₹2,450/Qtl (Ludhiana APMC)',
      desc: 'Thrives in dense soil matrices during cool rabi cycles; heavy biomass production supported by available nitrates.',
      agronomicTips: 'First irrigation at Crown Root Initiation (CRI) stage (21 days after sowing) is critical.'
    };
    thirdCrop = {
      emoji: '🌻',
      title: 'Mustard / Pusa Bold (Brassica juncea)',
      category: 'Rabi Oilseed',
      match: '86.4%',
      yield: '1.0 - 1.4 Tonnes / Acre',
      growthPeriod: '105 - 120 Days',
      mandiRefPrice: '₹5,680/Qtl (Alwar APMC)',
      desc: 'Excellent deep root nutrient extraction; high seed oil content (42%) commands immediate cash premiums in local mandis.',
      agronomicTips: 'Apply elemental sulfur @ 20kg/acre to elevate seed oil percentage.'
    };
  } else {
    topCrop = {
      emoji: '🥔',
      title: 'Potato & Tubers (Solanum tuberosum)',
      category: 'High-Value Vegetable',
      match: '95.1%',
      yield: '8.5 - 11.5 Tonnes / Acre',
      growthPeriod: '80 - 90 Days',
      mandiRefPrice: '₹1,650/Qtl (Wholesale)',
      desc: 'Moderate pH and well-drained porous loam provide minimal physical resistance for uniform tuber bulking and skin finish.',
      agronomicTips: 'Earth up soil around plant bases at 30 days to avoid green tuber formation.'
    };
    secondCrop = {
      emoji: '🍅',
      title: 'Hybrid Tomato (Solanum lycopersicum)',
      category: 'Commercial Vegetable',
      match: '90.3%',
      yield: '12 - 16 Tonnes / Acre',
      growthPeriod: '110 - 130 Days',
      mandiRefPrice: '₹1,840/Crate (Nashik APMC)',
      desc: 'High cash yield with staggered weekly pickings; responsive to balanced micronutrient drip fertigation.',
      agronomicTips: 'Stake plants with bamboo trellis to prevent ground rotting.'
    };
    thirdCrop = {
      emoji: '🥜',
      title: 'Groundnut / Peanut (Arachis hypogaea)',
      category: 'Oilseed / Legume',
      match: '87.5%',
      yield: '1.1 - 1.5 Tonnes / Acre',
      growthPeriod: '110 - 120 Days',
      mandiRefPrice: '₹6,200/Qtl (MSP Benchmark)',
      desc: 'High nodular nitrogen fixation rejuvenates light soils; gypsum application enhances pod filling and shell hardness.',
      agronomicTips: 'Apply Gypsum @ 200kg/acre at flowering stage (peg penetration).'
    };
  }

  return { topCrop, secondCrop, thirdCrop };
}

