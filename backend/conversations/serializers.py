from rest_framework import serializers

from conversations.models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "role", "content", "card_type", "card_data", "created_at"]


class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ["id", "title", "created_at", "updated_at", "messages"]


class AssistantChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(trim_whitespace=True, max_length=4000)
    conversation_id = serializers.UUIDField(required=False)
    explanation_level = serializers.ChoiceField(choices=["simple", "detailed", "technical"], default="simple", required=False)
    language = serializers.ChoiceField(choices=["en", "kn"], default="en", required=False)

    def validate_message(self, value):
        if not value:
            raise serializers.ValidationError("Message cannot be empty.")
        return value
