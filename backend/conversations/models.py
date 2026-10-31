from django.conf import settings
from django.db import models

from common.models import UUIDPrimaryKeyModel


class Conversation(UUIDPrimaryKeyModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="conversations")
    title = models.CharField(max_length=180, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]


class Message(UUIDPrimaryKeyModel):
    class Role(models.TextChoices):
        USER = "user", "User"
        ASSISTANT = "assistant", "Assistant"

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=12, choices=Role.choices)
    content = models.TextField()
    card_type = models.CharField(max_length=40, null=True, blank=True)
    card_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
