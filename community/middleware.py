import urllib.parse

from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()

@database_sync_to_async
def get_user(token_key):
    try:
        token = AccessToken(token_key)
        user_id = token["user_id"]
        user = User.objects.get(id=user_id)
        return user
    except Exception as e:
        print("Token auth error:", e)
        return AnonymousUser()

class TokenAuthMiddleware:
    """
    Custom token auth middleware for Django Channels 3.
    """

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        query_params = urllib.parse.parse_qs(query_string)
        token_list = query_params.get("token")

        if token_list:
            token_key = token_list[0]
            user = await get_user(token_key)
            scope["user"] = user
            print("✅ Authenticated user:", user)
        else:
            scope["user"] = AnonymousUser()
            print("❌ No token found in WebSocket query!")

        return await self.inner(scope, receive, send)
