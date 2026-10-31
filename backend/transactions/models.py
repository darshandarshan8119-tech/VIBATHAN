import hashlib
import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models

from common.models import TimeStampedModel, UUIDPrimaryKeyModel
from mandi.models import APMC, Commodity


class MarketTransaction(UUIDPrimaryKeyModel, TimeStampedModel):
    class LifecycleStatus(models.TextChoices):
        CONTRACT_ISSUED = "contract_issued", "Contract Note Issued"
        ESCROW_FUNDED = "escrow_funded", "Escrow Funded (100%)"
        GOODS_DISPATCHED = "goods_dispatched", "Goods Dispatched to Mandi"
        ASSAY_PASSED = "assay_passed", "APMC Quality Assay Passed"
        BUYER_ACCEPTED = "buyer_accepted", "Buyer Accepted Electronic Inward"
        FUNDS_RELEASED = "funds_released", "Funds Settled to Farmer Bank"

    transaction_id = models.CharField(max_length=40, unique=True, db_index=True, editable=False)
    contract_note_number = models.CharField(max_length=40, unique=True, db_index=True, editable=False)
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="sales_transactions")
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="purchase_transactions")
    commodity = models.ForeignKey(Commodity, on_delete=models.PROTECT)
    apmc = models.ForeignKey(APMC, on_delete=models.PROTECT)
    quantity_quintals = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0.1)])
    agreed_rate = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    gross_amount = models.DecimalField(max_digits=14, decimal_places=2, validators=[MinValueValidator(0)])
    mandi_cess = models.DecimalField(max_digits=12, decimal_places=2)
    escrow_fee = models.DecimalField(max_digits=12, decimal_places=2)
    freight_deduction = models.DecimalField(max_digits=12, decimal_places=2)
    assay_deduction = models.DecimalField(max_digits=12, decimal_places=2)
    net_seller_payable = models.DecimalField(max_digits=14, decimal_places=2, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=30, choices=LifecycleStatus.choices, default=LifecycleStatus.CONTRACT_ISSUED)
    escrow_deposit_hash = models.CharField(max_length=64, editable=False)
    contract_note_pdf_url = models.CharField(max_length=255, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["seller", "-created_at"]),
            models.Index(fields=["buyer", "-created_at"]),
            models.Index(fields=["status"]),
        ]

    def _reference(self, prefix: str) -> str:
        return f"{prefix}-2026-{self.apmc.market_code[-3:].upper()}-{uuid.uuid4().hex[:8].upper()}"

    def save(self, *args, **kwargs):
        if not self.transaction_id:
            self.transaction_id = self._reference("TXN")
        if not self.contract_note_number:
            self.contract_note_number = self._reference("CN")
        if not self.escrow_deposit_hash:
            raw = f"{self.transaction_id}:{self.seller_id}:{self.buyer_id}:{self.gross_amount}"
            self.escrow_deposit_hash = hashlib.sha256(raw.encode("utf-8")).hexdigest()
        super().save(*args, **kwargs)

    def transition(self, action: str, actor) -> None:
        transitions = {
            "fund_escrow": (self.LifecycleStatus.CONTRACT_ISSUED, self.LifecycleStatus.ESCROW_FUNDED, self.buyer_id),
            "dispatch_goods": (self.LifecycleStatus.ESCROW_FUNDED, self.LifecycleStatus.GOODS_DISPATCHED, self.seller_id),
            "pass_assay": (self.LifecycleStatus.GOODS_DISPATCHED, self.LifecycleStatus.ASSAY_PASSED, None),
            "accept_inward": (self.LifecycleStatus.ASSAY_PASSED, self.LifecycleStatus.BUYER_ACCEPTED, self.buyer_id),
            "release_funds": (self.LifecycleStatus.BUYER_ACCEPTED, self.LifecycleStatus.FUNDS_RELEASED, self.buyer_id),
        }
        expected_status, new_status, required_actor_id = transitions[action]
        if self.status != expected_status:
            raise ValidationError("Invalid escrow lifecycle transition.")
        if required_actor_id and actor.id != required_actor_id and not actor.is_agrimart_admin:
            raise ValidationError("You are not permitted to perform this escrow action.")
        if required_actor_id is None and actor.id not in {self.seller_id, self.buyer_id} and not actor.is_agrimart_admin:
            raise ValidationError("You are not permitted to verify this escrow action.")
        previous_status = self.status
        self.status = new_status
        self.save(update_fields=["status", "updated_at"])
        TransactionLifecycleEvent.objects.create(
            transaction=self,
            actor=actor,
            action=action,
            from_status=previous_status,
            to_status=new_status,
            verification_hash=hashlib.sha256(
                f"{self.escrow_deposit_hash}:{previous_status}:{new_status}:{action}".encode("utf-8")
            ).hexdigest(),
        )


class TransactionLifecycleEvent(UUIDPrimaryKeyModel):
    transaction = models.ForeignKey(MarketTransaction, on_delete=models.CASCADE, related_name="lifecycle_events")
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    action = models.CharField(max_length=40)
    from_status = models.CharField(max_length=30)
    to_status = models.CharField(max_length=30)
    verification_hash = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
