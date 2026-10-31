from dataclasses import dataclass
from typing import Dict, Any


@dataclass
class ProfitBreakdown:
    commodity_name: str
    quantity_quintals: float
    mandi_rate_per_quintal: float
    gross_value: float
    freight_cost: float
    mandi_cess: float
    escrow_fee: float
    loading_unloading_cost: float
    moisture_deduction: float
    total_deductions: float
    net_proceeds: float
    effective_price_per_quintal: float
    deduction_percentage: float
    distance_km: float

    def to_dict(self) -> Dict[str, Any]:
        return {
            "commodity_name": self.commodity_name,
            "quantity_quintals": round(self.quantity_quintals, 2),
            "mandi_rate_per_quintal": round(self.mandi_rate_per_quintal, 2),
            "gross_value": round(self.gross_value, 2),
            "freight_cost": round(self.freight_cost, 2),
            "mandi_cess": round(self.mandi_cess, 2),
            "escrow_fee": round(self.escrow_fee, 2),
            "loading_unloading_cost": round(self.loading_unloading_cost, 2),
            "moisture_deduction": round(self.moisture_deduction, 2),
            "total_deductions": round(self.total_deductions, 2),
            "net_proceeds": round(self.net_proceeds, 2),
            "effective_price_per_quintal": round(self.effective_price_per_quintal, 2),
            "deduction_percentage": round(self.deduction_percentage, 2),
            "distance_km": round(self.distance_km, 1),
        }


def calculate_net_profit(
    quantity_quintals: float,
    rate_per_quintal: float,
    distance_km: float = 40.0,
    freight_rate_per_km_quintal: float = 0.18,
    moisture_pct: float = 11.0,
    basis_moisture_pct: float = 11.0,
    moisture_discount_rate_per_pct: float = 30.0,
    mandi_cess_pct: float = 1.5,
    escrow_fee_pct: float = 0.5,
    loading_unloading_rate_per_qtl: float = 15.0,
    commodity_name: str = "Commodity Lot",
) -> ProfitBreakdown:
    """
    Deterministic net profit calculator accounting for statutory APMC mandi cess (1.5%),
    escrow protection fee (0.5%), loading charges, freight, and moisture assay deductions.
    """
    qty = max(float(quantity_quintals), 0.1)
    rate = max(float(rate_per_quintal), 0.0)
    dist = max(float(distance_km), 0.0)

    gross = qty * rate

    # Freight cost: freight tariff * distance * quantity
    freight = round(dist * freight_rate_per_km_quintal * qty, 2)

    # Statutory APMC Cess (1.5%)
    cess = round(gross * (mandi_cess_pct / 100.0), 2)

    # Escrow Protection Guarantee (0.5%)
    escrow = round(gross * (escrow_fee_pct / 100.0), 2)

    # Mandi Handling / Loading / Unloading (₹15/qtl)
    loading = round(qty * loading_unloading_rate_per_qtl, 2)

    # Moisture deduction if exceeds standard basis
    moisture_ded = 0.0
    if moisture_pct > basis_moisture_pct:
        excess_pct = moisture_pct - basis_moisture_pct
        moisture_ded = round(excess_pct * moisture_discount_rate_per_pct * qty, 2)

    total_ded = round(freight + cess + escrow + loading + moisture_ded, 2)
    net_proc = round(max(gross - total_ded, 0.0), 2)
    eff_price = net_proc / qty if qty > 0 else 0.0
    ded_pct = (total_ded / gross * 100.0) if gross > 0 else 0.0

    return ProfitBreakdown(
        commodity_name=commodity_name,
        quantity_quintals=qty,
        mandi_rate_per_quintal=rate,
        gross_value=gross,
        freight_cost=freight,
        mandi_cess=cess,
        escrow_fee=escrow,
        loading_unloading_cost=loading,
        moisture_deduction=moisture_ded,
        total_deductions=total_ded,
        net_proceeds=net_proc,
        effective_price_per_quintal=eff_price,
        deduction_percentage=ded_pct,
        distance_km=dist,
    )

