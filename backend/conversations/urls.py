from django.urls import path

from conversations.views import AssistantChatView, ConversationListView


urlpatterns = [
    path("chat/", AssistantChatView.as_view(), name="assistant-chat"),
    path("conversations/", ConversationListView.as_view(), name="assistant-conversations"),
]
