from django.db import transaction
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ai.agents.coordinator import AgentCoordinator
from conversations.models import Conversation, Message
from conversations.serializers import AssistantChatRequestSerializer, ConversationSerializer, MessageSerializer


class AssistantChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AssistantChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        conversation_id = serializer.validated_data.get("conversation_id")

        with transaction.atomic():
            if conversation_id:
                conversation = Conversation.objects.filter(id=conversation_id, user=request.user).first()
                if conversation is None:
                    return Response({"detail": "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)
            else:
                title = serializer.validated_data["message"][:180]
                conversation = Conversation.objects.create(user=request.user, title=title)

            conversation_history = [
                {
                    "role": message.role,
                    "content": message.content,
                    "card_type": message.card_type,
                    "card_data": message.card_data,
                }
                for message in conversation.messages.order_by("created_at")
            ]
            user_message = Message.objects.create(
                conversation=conversation,
                role=Message.Role.USER,
                content=serializer.validated_data["message"],
            )
            result = AgentCoordinator().run(
                request.user,
                user_message.content,
                str(conversation.id),
                serializer.validated_data["explanation_level"],
                serializer.validated_data["language"],
                conversation_history,
            )
            assistant_message = Message.objects.create(
                conversation=conversation,
                role=Message.Role.ASSISTANT,
                content=result["content"],
                card_type=result["card_type"],
                card_data=result["card_data"],
            )
            conversation.save(update_fields=["updated_at"])

        return Response(
            {
                "conversation": ConversationSerializer(conversation).data,
                "message": MessageSerializer(assistant_message).data,
                "farmer_explanation": result["farmer_explanation"],
                "explanation_level": serializer.validated_data["explanation_level"],
                "language": serializer.validated_data["language"],
            },
            status=status.HTTP_201_CREATED,
        )


class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = Conversation.objects.filter(user=request.user).prefetch_related("messages")
        return Response(ConversationSerializer(conversations, many=True).data)
