from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.urls import path
from .views import *
urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('check-verification-status/', CheckVerificationStatusView.as_view(), name='check-verification-status'),
    path('verify/email/', VerifyEmailView.as_view(), name='verify-email'),
    path('verify/phone/', VerifyPhoneView.as_view(), name='verify-phone'),
    path('resend-otp/', ResendOTPView.as_view(),name="resend-otp"),
    path('login/', LoginView.as_view(),name="login"),
    path('skills/', SkillCreateView.as_view(),name="create-skills"),
    path('skills/<int:id>/', SkillDeleteView.as_view(),name="delete-skills"),
    path('education/', EducationListCreateView.as_view(), name='education-list-create'),
    path('education/<int:pk>/', EducationRetrieveUpdateDestroyView.as_view(), name='education-update-retrive-delete'),
    path('work/', WorkListCreateView.as_view(), name='Work-list-create'),
    path('work/<int:pk>/', WorkRetrieveUpdateDestroyView.as_view(), name='Work-update-retrive-delete'),
    path('files/', FileListCreateView.as_view(), name='file-list-create'),
    path('files/<int:pk>/', FileDeleteView.as_view(), name='file-delete'),
    path('profile/', ProfileRetriveUpdateView.as_view(), name='update-profile'),
    path('profile-picture/delete/', RemoveProfilePictureView.as_view(), name='remove-profile-picture'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('privacy/', PrivacySettingsView.as_view(), name='privacy-settings'),
    path('delete/', DeleteAccountView.as_view(), name='delete-account'),
    path('sessions/', RecentLoginActivityView.as_view(), name='session-activity'),
    path('sessions/<str:session_key>/revoke/', RevokeSessionView.as_view(), name='revoke-session'),
    path('organization/profile/', OrganizationProfileView.as_view(), name='organization-profile'),
    path('organization/services/', ServicesView.as_view(), name='org-services'),
    path('organization/services/<int:pk>/', ServiceDeleteView.as_view(), name='services-delete'),
]
