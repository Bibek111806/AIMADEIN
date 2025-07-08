from rest_framework import generics, permissions,status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Connection
from .serializers import *
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from rest_framework import filters
from careerhub.models import JobApplication,Event
from careerhub.serializers import JobApplicationSerializer,EventSerializer
from django.utils import timezone
class UserPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
class ConnectionListCreateView(generics.ListCreateAPIView):
    serializer_class = ConnectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Connection.objects.filter(
            Q(sender=user) | Q(receiver=user)
        )

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class ConnectionUpdateView(generics.UpdateAPIView):
    queryset = Connection.objects.all()
    serializer_class = ConnectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        connection = self.get_object()

        if connection.receiver != request.user:
            return Response(
                {"error": "Not allowed."},
                status=status.HTTP_403_FORBIDDEN,
            )

        status_value = request.data.get('status')
        if status_value not in ['accepted', 'rejected']:
            return Response(
                {"error": "Invalid status."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if status_value == 'rejected':
            connection.delete()
            return Response(
                {"message": "Connection request rejected and deleted."},
                status=status.HTTP_204_NO_CONTENT,
            )
        else:
            connection.status = 'accepted'
            connection.save()
            return Response(self.get_serializer(connection).data)
class UserListView(generics.ListAPIView):
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = UserPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'email','company_name']


    def get_queryset(self):
        user = self.request.user

        # Start with public profiles
        qs = User.objects.filter(profile_visibility='public')

        # Organization-only profiles
        if user.role == 'organization':
            qs = qs | User.objects.filter(
                profile_visibility='organization',
                role='organization'
            )

        # Connections-only profiles
        connection_user_ids = Connection.objects.filter(
            (
                Q(sender=user) |
                Q(receiver=user)
            ),
            status='accepted'
        ).values_list('sender', 'receiver')

        connection_ids = set()
        for sender_id, receiver_id in connection_user_ids:
            if sender_id != user.id:
                connection_ids.add(sender_id)
            if receiver_id != user.id:
                connection_ids.add(receiver_id)

        if connection_ids:
            qs = qs | User.objects.filter(
                profile_visibility='connection',
                id__in=list(connection_ids)
            )

        # exclude self
        qs = qs.exclude(id=user.id)

        return qs.distinct()
    
class GroupCreateView(generics.CreateAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

    def perform_create(self, serializer):
        group = serializer.save(moderator=self.request.user)
        # Moderator auto joins the group
        GroupMembership.objects.create(
            group=group,
            user=self.request.user,
            status='approved'
        )
class GroupJoinView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        group = Group.objects.get(pk=pk)

        # check if already member
        existing = GroupMembership.objects.filter(group=group, user=request.user)
        if existing.exists():
            return Response({"detail": "Already requested or joined."}, status=status.HTTP_400_BAD_REQUEST)

        status_val = 'approved' if group.type == "Public" else 'pending'

        GroupMembership.objects.create(
            group=group,
            user=request.user,
            status=status_val
        )
        return Response({"detail": f"Request {'sent' if status_val=='pending' else 'approved'}."})
class ApproveRejectMembershipView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, membership_id):
        action = request.data.get("action")
        if action not in ["approve", "reject"]:
            return Response({"detail": "Invalid action."}, status=400)

        membership = GroupMembership.objects.filter(id=membership_id).first()
        if not membership:
            return Response({"detail": "Membership not found."}, status=404)

        # Only group moderator can approve/reject
        if membership.group.moderator != request.user:
            return Response({"detail": "Permission denied."}, status=403)

        if action == "approve":
            membership.status = "approved"
            membership.save()
            return Response({"detail": "Membership approved."})

        if action == "reject":
            membership.delete()
            return Response({"detail": "Membership rejected (deleted)."})
class PendingRequestsForModeratorView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = GroupMembershipSerializer

    def get_queryset(self):
        return GroupMembership.objects.filter(
            group__moderator=self.request.user,
            status="pending"
        ).select_related("group", "user")
class GroupLeaveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        group = Group.objects.get(pk=pk)
        membership = GroupMembership.objects.filter(group=group, user=request.user)
        if not membership.exists():
            return Response({"error": "Not a member."}, status=status.HTTP_400_BAD_REQUEST)

        membership.delete()
        return Response({"detail": "Left the group."})
class GroupListView(generics.ListAPIView):
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Group.objects.all()
    pagination_class = UserPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
class GroupDetailView(generics.RetrieveAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "pk"  # or "id" if you prefer
class CommunityPostListCreateView(generics.ListCreateAPIView):
    serializer_class = CommunityPostSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = UserPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description']

    def get_queryset(self):
        user = self.request.user
        qs = CommunityPost.objects.filter(visibility='public')

        connection_ids = Connection.objects.filter(
            Q(sender=user) | Q(receiver=user),
            status='accepted'
        ).values_list('sender', 'receiver')

        connected_user_ids = set()
        for s, r in connection_ids:
            if s != user.id:
                connected_user_ids.add(s)
            if r != user.id:
                connected_user_ids.add(r)

        if connected_user_ids:
            qs = qs | CommunityPost.objects.filter(
                visibility='connections',
                author__id__in=connected_user_ids
            )

        group_ids = GroupMembership.objects.filter(
            user=user,
            status='approved'
        ).values_list('group_id', flat=True)

        if group_ids:
            qs = qs | CommunityPost.objects.filter(
                visibility='groups',
                author__groups__id__in=group_ids
            )

        return qs.distinct()



class CommunityPostLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        post = CommunityPost.objects.filter(pk=pk).first()
        if not post:
            return Response({"detail": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

        like, created = CommunityPostLike.objects.get_or_create(
            post=post,
            user=request.user
        )
        if created:
            return Response({"detail": "Post liked."})
        else:
            like.delete()
            return Response({"detail": "Post unliked."})
class CommunityPostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CommunityPost.objects.all()
    serializer_class = CommunityPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        # only allow edit/delete if owner
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            if obj.author != self.request.user:
                raise permissions.PermissionDenied("Not allowed.")
        return obj
class PrivateMessageListView(generics.ListAPIView):
    serializer_class = PrivateMessageSerializer

    def get_queryset(self):
        user = self.request.user.id
        other_id = self.kwargs["user_id"]
        return PrivateMessage.objects.filter(
            Q(sender=user, receiver=other_id) |
            Q(sender=other_id, receiver=user)
        ).order_by("timestamp")

class GroupMessageListView(generics.ListAPIView):
    serializer_class = GroupMessageSerializer

    def get_queryset(self):
        group_id = self.kwargs["group_id"]
        return GroupMessage.objects.filter(
            group_id=group_id
        ).order_by("timestamp")
class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserListSerializer
    lookup_field = "id"
class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Total job applications by this user
        total_job_applications = JobApplication.objects.filter(user=user).count()

        # Total network connections with this user
        total_connections = Connection.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).count()

        # Total events
        total_events = Event.objects.all().count()

        # Latest 4 job applications
        recent_job_apps = JobApplication.objects.filter(user=user).order_by('-applied_at')[:4]
        recent_job_apps_data = JobApplicationSerializer(recent_job_apps, many=True).data

        # Upcoming 4 events
        upcoming_events = Event.objects.filter(date__gte=timezone.now()).order_by('date')[:4]
        upcoming_events_data = EventSerializer(upcoming_events, many=True).data

        data = {
            'total_job_applications': total_job_applications,
            'total_connections': total_connections,
            'total_events': total_events,
            'recent_job_applications': recent_job_apps_data,
            'upcoming_events': upcoming_events_data,
        }

        return Response(data)