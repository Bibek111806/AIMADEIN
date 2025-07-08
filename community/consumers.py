import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from .models import PrivateMessage,Group,GroupMessage

from asgiref.sync import sync_to_async
User = get_user_model()

class PrivateChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            print("Anonymous user. Closing connection.")
            await self.close()
            return

        self.other_user_id = self.scope["url_route"]["kwargs"]["user_id"]
        self.room_name = f"private_{min(self.user.id, int(self.other_user_id))}_{max(self.user.id, int(self.other_user_id))}"
        self.room_group_name = f"chat_{self.room_name}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_text = data["message"]

        # Run synchronous DB save in a thread
        msg = await sync_to_async(PrivateMessage.objects.create)(
            sender=self.user,
            receiver_id=int(self.other_user_id),
            content=message_text
        )
        full_name = " ".join(filter(None, [
            self.user.first_name,
            getattr(self.user, "middle_name", None),
            self.user.last_name
        ])) or getattr(self.user, "company_name", None)

        message_data = {
            "id": msg.id,
            "content": msg.content,
            "timestamp": msg.timestamp.isoformat(),
            "isMe": True,
            "sender": {
                "id": self.user.id,
                "email": self.user.email,
                "full_name": full_name,
                "address": getattr(self.user, "address", None),
                "profile_picture": f"http://localhost:8000"+self.user.profile_picture.url if self.user.profile_picture else None,
                "professional_title": getattr(self.user, "professional_title", None),
            },
            "receiver": {
                "id": int(self.other_user_id),
            },
        }
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message_data,
                "sender_channel_name": self.channel_name,
            }
        )

        await self.send(text_data=json.dumps(message_data))

    async def chat_message(self, event):
        # Don’t send duplicate to sender
        if event.get("sender_channel_name") == self.channel_name:
            return

        message_data = event["message"]
        message_data["isMe"] = False

        await self.send(text_data=json.dumps(message_data))

class GroupChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.group_id = self.scope["url_route"]["kwargs"]["group_id"]
        self.room_group_name = f"group_{self.group_id}"

        if self.user.is_anonymous:
            print("Anonymous user. Closing connection.")
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_text = data["message"]

        group = await Group.objects.aget(id=self.group_id)

        # Save message asynchronously
        msg = await GroupMessage.objects.acreate(
            group=group,
            sender=self.user,
            content=message_text
        )

        full_name = " ".join(filter(None, [
            self.user.first_name,
            getattr(self.user, "middle_name", None),
            self.user.last_name
        ])) or getattr(self.user, "company_name", None)

        message_data = {
            "id": msg.id,
            "content": msg.content,
            "timestamp": msg.timestamp.isoformat(),
            "isMe": True,
            "sender": {
                "id": self.user.id,
                "email": self.user.email,
                "full_name": full_name,
                "address": getattr(self.user, "address", None),
                "profile_picture": f"http://localhost:8000{self.user.profile_picture.url}" if self.user.profile_picture else None,
                "professional_title": getattr(self.user, "professional_title", None),
            },
            "group": {
                "id": group.id,
                "name": group.name,
            },
        }

        # Send message to group excluding sender
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message_data,
                "sender_channel_name": self.channel_name,
            }
        )

        # Echo back to sender
        await self.send(text_data=json.dumps(message_data))

    async def chat_message(self, event):
        # Skip sending duplicate message to the sender
        if event.get("sender_channel_name") == self.channel_name:
            return

        message_data = event["message"]
        message_data["isMe"] = False

        await self.send(text_data=json.dumps(message_data))