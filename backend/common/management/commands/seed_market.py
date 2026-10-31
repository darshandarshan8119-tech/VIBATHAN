from datetime import date, timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone

from mandi.models import APMC, AuctionLot, Commodity, DailyTicker
from users.models import CustomUser, FarmerProfile, MerchantProfile


class Command(BaseCommand):
    help = "Seed independent AgriMart Market Intelligence database with users, APMCs, commodities, tickers, and lots"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("[*] Seeding AgriMart Market Intelligence Master Catalog..."))

        # 1. Users
        admin_user, _ = CustomUser.objects.get_or_create(
            phone="9999999999",
            defaults={
                "email": "admin@agrimart.in",
                "full_name": "AgriMart Systems Administrator",
                "role": CustomUser.Role.ADMIN,
                "village_pincode": "110001",
                "is_verified": True,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        admin_user.set_password("AdminPassword@2026")
        admin_user.save()

        farmer_user, _ = CustomUser.objects.get_or_create(
            phone="9876543210",
            defaults={
                "email": "devinder.singh@kisan.in",
                "full_name": "Devinder Singh",
                "role": CustomUser.Role.FARMER,
                "village_pincode": "141001",
                "is_verified": True,
            },
        )
        farmer_user.set_password("FarmerPassword@2026")
        farmer_user.save()

        FarmerProfile.objects.get_or_create(
            user=farmer_user,
            defaults={
                "farm_acreage": Decimal("18.5"),
                "soil_type": "Alluvial Silty Loam",
                "irrigation_type": "Canal + Solar Borewell",
                "kisan_card_number_last4": "4091",
            },
        )

        merchant_user, _ = CustomUser.objects.get_or_create(
            phone="9123456780",
            defaults={
                "email": "trader@rajkotmandi.com",
                "full_name": "Rajkot Agri-Exports Pvt Ltd",
                "role": CustomUser.Role.MERCHANT,
                "village_pincode": "360001",
                "is_verified": True,
            },
        )
        merchant_user.set_password("MerchantPassword@2026")
        merchant_user.save()

        MerchantProfile.objects.get_or_create(
            user=merchant_user,
            defaults={
                "company_name": "Rajkot Agri-Exports Pvt Ltd",
                "apmc_license_no": "GJ-RJK-2024-8841",
                "credit_limit": Decimal("1500000.00"),
                "risk_status": MerchantProfile.RiskStatus.NORMAL,
                "gst_number_last4": "1Z5A",
            },
        )
        self.stdout.write(self.style.SUCCESS("  [+] Seeded 3 Core Users (Admin, Farmer, Merchant)"))

        # 2. Mandi APMCs
        apmcs = [
            ("Ludhiana APMC", "Punjab", "Ludhiana", "PB-LDH-01", 30.9010, 75.8573),
            ("Alwar APMC", "Rajasthan", "Alwar", "RJ-ALW-01", 27.5530, 76.6346),
            ("Rajkot APMC", "Gujarat", "Rajkot", "GJ-RJK-01", 22.3039, 70.8022),
            ("Karnal APMC", "Haryana", "Karnal", "HR-KRN-01", 29.6857, 76.9905),
            ("Indore APMC", "Madhya Pradesh", "Indore", "MP-IND-01", 22.7196, 75.8577),
            ("Guntur APMC", "Andhra Pradesh", "Guntur", "AP-GNT-01", 16.3067, 80.4365),
        ]
        apmc_map = {}
        for name, state, dist, code, lat, lon in apmcs:
            a, _ = APMC.objects.get_or_create(
                market_code=code,
                defaults={"name": name, "state": state, "district": dist, "latitude": Decimal(str(lat)), "longitude": Decimal(str(lon))},
            )
            apmc_map[code] = a
        self.stdout.write(self.style.SUCCESS("  [+] Seeded 6 APMC Mandis"))

        # 3. Commodities & Daily Tickers
        commodities = [
            ("Wheat Sharbati Golden", "WHEAT-SHAR", "WHT-SHAR-G1", "Sharbati High-Gluten Golden Grain", "Cereals", Decimal("2275.00"), Decimal("3250.00"), "PB-LDH-01", 2450, 2410, 2480, 4200, Decimal("10.50"), Decimal("0.50"), Decimal("40.00")),
            ("Mustard Seed (Black)", "MUST-BLK", "MUST-BLK-B1", "Bold Black Sarson High Oil Purity", "Oilseeds", Decimal("5450.00"), Decimal("5580.00"), "RJ-ALW-01", 5680, 5550, 5720, 2800, Decimal("11.00"), Decimal("0.50"), Decimal("30.00")),
            ("Cotton Shankar-6 29mm", "COTTON-S6", "COTN-GUJ-S6", "Shankar-6 Machine Picked 29mm Staple", "Fibre", Decimal("6620.00"), Decimal("7050.00"), "GJ-RJK-01", 7140, 7110, 7220, 6400, Decimal("8.50"), Decimal("0.50"), Decimal("60.00")),
            ("Basmati Paddy 1121", "PAD-BASM", "PDY-BASM-1121", "Extra Long Slender Basmati Paddy", "Cereals", Decimal("3800.00"), Decimal("4290.00"), "HR-KRN-01", 4420, 4280, 4460, 5100, Decimal("11.00"), Decimal("0.50"), Decimal("30.00")),
            ("Soybean (Yellow Seed)", "SOY-YEL", "SOY-IND-Y1", "Yellow Seed High-Protein Food Grade", "Oilseeds", Decimal("4600.00"), Decimal("4780.00"), "MP-IND-01", 4820, 4760, 4850, 3700, Decimal("11.00"), Decimal("0.50"), Decimal("30.00")),
            ("Red Chilli (Teja Variety)", "CHIL-TEJA", "CHL-GNT-TJ", "Teja Guntur Hot Red Chilli Dried", "Spices", Decimal("14000.00"), Decimal("17800.00"), "AP-GNT-01", 18500, 17600, 18900, 1950, Decimal("11.00"), Decimal("0.50"), Decimal("30.00")),
            ("Paddy Sona Masoori A1", "PAD-SONA", "PDY-SONA-A1", "Sona Masoori Grade-A (Aged 12m)", "Cereals", Decimal("2300.00"), Decimal("2680.00"), "HR-KRN-01", 2850, 2780, 2890, 5800, Decimal("11.00"), Decimal("0.50"), Decimal("35.00")),
            ("Paddy Gujarat PR-106", "PAD-PR106", "PDY-GUJ-PR1", "PR-106 Export Slender Grain", "Cereals", Decimal("2183.00"), Decimal("2180.00"), "GJ-RJK-01", 2240, 2190, 2280, 4200, Decimal("12.00"), Decimal("0.50"), Decimal("30.00")),
            ("Mustard Seed Yellow 42%", "MUST-YEL", "MUST-RAJ-O42", "Yellow Sarson High-Oil Purity 98%", "Oilseeds", Decimal("5450.00"), Decimal("5450.00"), "RJ-ALW-01", 5720, 5600, 5780, 2800, Decimal("8.00"), Decimal("0.50"), Decimal("50.00")),
            ("Desi Chana Machine Clean", "CHNA-DESI", "CHNA-DESI-B", "Desi Chana Bold Kernel Machine Cleaned", "Pulses", Decimal("5440.00"), Decimal("5600.00"), "MP-IND-01", 5820, 5740, 5880, 3100, Decimal("9.50"), Decimal("0.50"), Decimal("45.00")),
        ]
        today = date.today()
        for cname, code, ticker, variety, cat, msp, agmarknet, apmc_code, modal, min_p, max_p, volume, basis_m, tol_m, disc_m in commodities:
            c, _ = Commodity.objects.update_or_create(
                code=code,
                defaults={
                    "name": cname,
                    "ticker_symbol": ticker,
                    "variety": variety,
                    "category": cat,
                    "standard_msp_rate": msp,
                    "agmarknet_modal_rate": agmarknet,
                    "basis_moisture_pct": basis_m,
                    "moisture_tolerance_pct": tol_m,
                    "moisture_discount_rate_per_pct": disc_m,
                    "max_rejection_moisture_pct": Decimal("14.00"),
                },
            )
            DailyTicker.objects.update_or_create(
                mandi=apmc_map[apmc_code],
                commodity=c,
                recorded_at=today,
                source="AGMARKNET",
                defaults={
                    "modal_price": Decimal(str(modal)),
                    "min_price": Decimal(str(min_p)),
                    "max_price": Decimal(str(max_p)),
                    "arrivals_volume": Decimal(str(volume)),
                },
            )
        self.stdout.write(self.style.SUCCESS("  [+] Seeded 10 Standardized Ticker Contracts with Live APMC Tickers"))

        # 4. Initial Active Auction Lots
        wheat_comm = Commodity.objects.get(code="WHEAT-SHAR")
        must_comm = Commodity.objects.get(code="MUST-BLK")
        paddy_comm = Commodity.objects.get(code="PAD-BASM")

        lots_data = [
            (farmer_user, wheat_comm, apmc_map["PB-LDH-01"], Decimal("150.000"), Decimal("11.2"), Decimal("2400.00")),
            (farmer_user, must_comm, apmc_map["RJ-ALW-01"], Decimal("80.000"), Decimal("7.8"), Decimal("5600.00")),
            (farmer_user, paddy_comm, apmc_map["HR-KRN-01"], Decimal("220.000"), Decimal("12.5"), Decimal("4350.00")),
        ]
        for farmer, comm, apmc, qty, moist, reserve in lots_data:
            AuctionLot.objects.get_or_create(
                farmer=farmer,
                commodity=comm,
                apmc=apmc,
                defaults={
                    "quantity_quintals": qty,
                    "moisture_pct": moist,
                    "reserve_price": reserve,
                    "current_highest_bid": reserve,
                    "status": AuctionLot.Status.ACTIVE,
                    "expires_at": timezone.now() + timedelta(days=2),
                },
            )
        self.stdout.write(self.style.SUCCESS("  [+] Seeded 3 Active Mandi Auction Lots"))
        self.stdout.write(self.style.SUCCESS("[OK] Market Intelligence catalog successfully seeded!"))

