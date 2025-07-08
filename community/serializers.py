from rest_framework import serializers
from .models import *
from django.contrib.auth import get_user_model
from accounts.serializers import SkillsSerializer
from django.db import models

User = get_user_model()

class ConnectionSerializer(serializers.ModelSerializer):
    sender_email = serializers.CharField(source='sender.email', read_only=True)
    receiver_email = serializers.CharField(source='receiver.email', read_only=True)
    details = serializers.SerializerMethodField()

    class Meta:
        model = Connection
        fields = [
            'id',
            'sender',
            'sender_email',
            'receiver',
            'receiver_email',
            'status',
            'created_at',
            'details',
        ]
        read_only_fields = ['sender', 'sender_email', 'created_at']

    def get_details(self, obj):
        request = self.context.get('request')
        user = request.user if request else None

        # Figure out if current user is sender or receiver
        if user == obj.sender:
            other_user = obj.receiver
        elif user == obj.receiver:
            other_user = obj.sender
        else:
            return None

        return UserListSerializer(other_user, context=self.context).data


class UserListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    total_connections = serializers.SerializerMethodField()
    connection_status = serializers.SerializerMethodField()
    connection_sender_id = serializers.SerializerMethodField()
    connection_receiver_id = serializers.SerializerMethodField()
    connection_id = serializers.SerializerMethodField()

    skills = SkillsSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'full_name',
            'address',
            'professional_title',
            'profile_picture',
            'total_connections',
            'skills',
            'role',
            'connection_status',
            'connection_sender_id',
            'connection_receiver_id',
            'connection_id'
        ]

    def get_full_name(self, obj):
        return " ".join(filter(None, [
            obj.first_name,
            obj.middle_name,
            obj.last_name
        ])) or obj.company_name

    def get_total_connections(self, obj):
        return Connection.objects.filter(
            models.Q(sender=obj, status='accepted') |
            models.Q(receiver=obj, status='accepted')
        ).count()

    def get_connection_status(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return "none"

        user = request.user

        connection = Connection.objects.filter(
            (
                models.Q(sender=user, receiver=obj) |
                models.Q(sender=obj, receiver=user)
            )
        ).first()

        if connection:
            return connection.status

        return "none"

    def get_connection_sender_id(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None

        user = request.user

        connection = Connection.objects.filter(
            (
                models.Q(sender=user, receiver=obj) |
                models.Q(sender=obj, receiver=user)
            )
        ).first()

        return connection.sender.id if connection else None

    def get_connection_receiver_id(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None

        user = request.user

        connection = Connection.objects.filter(
            (
                models.Q(sender=user, receiver=obj) |
                models.Q(sender=obj, receiver=user)
            )
        ).first()

        return connection.receiver.id if connection else None

    def get_connection_id(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None

        user = request.user

        connection = Connection.objects.filter(
            (
                models.Q(sender=user, receiver=obj) |
                models.Q(sender=obj, receiver=user)
            )
        ).first()

        return connection.id if connection else None




class GroupSerializer(serializers.ModelSerializer):
    members_count = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()
    has_pending_request = serializers.SerializerMethodField()
    moderator = UserListSerializer(read_only=True)

    class Meta:
        model = Group
        fields = '__all__'

    def get_members_count(self, obj):
        return GroupMembership.objects.filter(
            group=obj, status="approved"
        ).count()

    def get_is_member(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return GroupMembership.objects.filter(
                group=obj, user=user, status="approved"
            ).exists()
        return False

    def get_has_pending_request(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return GroupMembership.objects.filter(
                group=obj, user=user, status="pending"
            ).exists()
        return False

class GroupMembershipSerializer(serializers.ModelSerializer):
    user = UserListSerializer(read_only=True)
    group = GroupSerializer(read_only=True)

    class Meta:
        model = GroupMembership
        fields = '__all__'

class CommunityPostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityPostImage
        fields = ['id', 'image']


class CommunityPostSerializer(serializers.ModelSerializer):
    author = UserListSerializer(read_only=True)
    images = CommunityPostImageSerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()
    is_liked_by_me = serializers.SerializerMethodField()

    class Meta:
        model = CommunityPost
        fields = [
            'id',
            'author',
            'title',
            'category',
            'content',
            'visibility',
            'images',
            'likes_count',
            'is_liked_by_me',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'likes_count', 'is_liked_by_me']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_is_liked_by_me(self, obj):
        user = self.context['request'].user
        return obj.likes.filter(user=user).exists()

    def create(self, validated_data):
        request = self.context.get('request')
        images_data = request.FILES.getlist('images') if request else []

        # ensure author only provided once
        post = CommunityPost.objects.create(
            author=request.user,
            **validated_data
        )

        for image_file in images_data:
            CommunityPostImage.objects.create(post=post, image=image_file)

        return post

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.category = validated_data.get('category', instance.category)
        instance.content = validated_data.get('content', instance.content)
        instance.visibility = validated_data.get('visibility', instance.visibility)
        instance.save()

        return instance
class PrivateMessageSerializer(serializers.ModelSerializer):
    sender = UserListSerializer()
    receiver = UserListSerializer()
    isMe = serializers.SerializerMethodField()

    class Meta:
        model = PrivateMessage
        fields = "__all__"

    def get_isMe(self, obj):
        request = self.context.get("request")
        if request and hasattr(request, "user") and request.user.is_authenticated:
            return obj.sender_id == request.user.id
        return False

class GroupMessageSerializer(serializers.ModelSerializer):
    sender = UserListSerializer()
    isMe = serializers.SerializerMethodField()

    class Meta:
        model = GroupMessage
        fields = "__all__"

    def get_isMe(self, obj):
        request = self.context.get("request")
        if request and hasattr(request, "user") and request.user.is_authenticated:
            return obj.sender_id == request.user.id
        return False