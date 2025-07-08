from django.urls import path
from .views import *
urlpatterns = [
    path('members/',UserListView.as_view()),
    path('connections/',ConnectionListCreateView.as_view()),
    path('connections/<int:pk>/',ConnectionUpdateView.as_view()),
    path('groups/', GroupListView.as_view()),
    path('groups/<int:pk>/', GroupDetailView.as_view()),
    path('groups/create/', GroupCreateView.as_view()),
    path('groups/<int:pk>/join/', GroupJoinView.as_view()),
    path('groups/<int:pk>/leave/', GroupLeaveView.as_view()),
    path("memberships/<int:membership_id>/action/", ApproveRejectMembershipView.as_view(), name="membership-action"),
    path("moderator/pending-requests/", PendingRequestsForModeratorView.as_view(), name="pending-requests"),
    path('community-posts/', CommunityPostListCreateView.as_view()),
    path('community-posts/<int:pk>/like/', CommunityPostLikeView.as_view()),
    path('community-posts/<int:pk>/', CommunityPostDetailView.as_view()),
    path(
        "chat/private/<int:user_id>/",
        PrivateMessageListView.as_view(),
        name="private-message-history"
    ),
    
    # Group messages history
    path(
        "chat/group/<int:group_id>/",
        GroupMessageListView.as_view(),
        name="group-message-history"
    ),
    path('users/<int:id>/',UserDetailView.as_view()),
    path('dashboard/individual/',DashboardStatsView.as_view()),
]
