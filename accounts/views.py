from django.core.mail import send_mail
from django.conf import settings
from .serializers import *
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import generics,permissions,status
from .models import Skills
from django.contrib.sessions.models import Session
from django.contrib.sessions.backends.db import SessionStore
from django.utils import timezone
from .utils import *
from django.contrib.auth import login
# for register user
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.set_email_otp()
            user.save()

            send_mail(
                'Verify your email',
                f'Your verification code is: {user.email_otp}',
                settings.DEFAULT_FROM_EMAIL,
                [user.email]
            )

            return Response({'message': 'Registered. Email OTP sent.'}, status=201)
        return Response(serializer.errors, status=400)
# for otp resend 
class ResendOTPView(APIView):
    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': f"{serializer.validated_data['type'].capitalize()} OTP resent."})
        return Response(serializer.errors, status=400)

# for email verification
class VerifyEmailView(APIView):
    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Email verified. Phone OTP sent.'})
        return Response(serializer.errors, status=400)
#to check email and phone is already verified or not
class CheckVerificationStatusView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response(
                {'email': 'This field is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'email': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not user.email_verified:
            return Response(
                {'detail': 'Email is not verified yet.'},
                status=status.HTTP_403_FORBIDDEN
            )

        return Response({
            'email__verified': user.email_verified,
            'phone_verified': user.phone_verified,
        }, status=status.HTTP_200_OK)
# for phone number verification
class VerifyPhoneView(APIView):
    def post(self, request):
        serializer = VerifyPhoneSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Phone verified successfully.'})
        return Response(serializer.errors, status=400)
# for login
class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():


            # Add custom session data

            request.session.flush()
            request.session['ip_address'] = get_client_ip(request)
            request.session['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
            request.session['location'] = get_location_from_ip(request.session['ip_address'])
            request.session['last_activity'] = str(timezone.now())
            request.session.save()

            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# Create Skill View
class SkillCreateView(generics.CreateAPIView):
    serializer_class = SkillsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# Delete Skill View
class SkillDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, id):
        try:
            skill = Skills.objects.get(pk=id, user=request.user)
        except Skills.DoesNotExist:
            return Response({"detail": "Skill not found."}, status=status.HTTP_404_NOT_FOUND)
        
        skill.delete()
        return Response({"detail": "Skill deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    
# for listing and creating Education
class EducationListCreateView(generics.ListCreateAPIView):
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Education.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# for retrive,update and delete single Education
class EducationRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Education.objects.filter(user=self.request.user)
    
# for listing and creating work experience
class WorkListCreateView(generics.ListCreateAPIView):
    serializer_class = WorkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Work.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# for retrive,update and delete single work experience
class WorkRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Work.objects.filter(user=self.request.user)
# for listing and creating files 
class FileListCreateView(generics.ListCreateAPIView):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Files.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# for deleting files
class FileDeleteView(generics.DestroyAPIView):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Files.objects.filter(user=self.request.user)
    
class ProfileRetriveUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user
    
class RemoveProfilePictureView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        user = request.user

        if user.profile_picture:
            user.profile_picture = None
            user.save()
            return Response({'message': 'Profile picture removed successfully.'})
        return Response({'message': 'No profile picture to remove.'}, status=400)
    
class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PrivacySettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = PrivacySettingsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
    
class DeleteAccountView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def delete(self, request, *args, **kwargs):
        user = self.get_object()
        user.delete()
        return Response({'message': 'Account deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
class RecentLoginActivityView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        current_session_key = request.session.session_key
        sessions = Session.objects.filter(expire_date__gte=timezone.now())
        user_sessions = []

        for session in sessions:
            session_data = SessionStore(session_key=session.session_key)
            user_id = session_data.get('_auth_user_id')
            print(str(user_id))
            if str(user_id) == str(request.user.id):
                user_sessions.append({
                    'session_key': session.session_key,
                    'ip_address': session_data.get('ip_address', 'Unknown'),
                    'location': session_data.get('location', 'Unknown'),
                    'user_agent': session_data.get('user_agent', 'Unknown'),
                    'last_activity': session.expire_date,
                    'is_current': session.session_key == current_session_key,
                })

        return Response(user_sessions, status=200)

class RevokeSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, session_key):
        current_session_key = request.session.session_key

        if session_key == current_session_key:
            return Response({'error': 'Cannot revoke current session.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            session = Session.objects.get(session_key=session_key)
            session_data = SessionStore(session_key=session.session_key)
            if str(session_data.get('_auth_user_id')) == str(request.user.id):
                session.delete()
                return Response({'message': 'Session revoked successfully.'})
            else:
                return Response({'error': 'Unauthorized session.'}, status=status.HTTP_403_FORBIDDEN)
        except Session.DoesNotExist:
            return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)
        
class ServicesView(generics.CreateAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ServiceDeleteView(generics.DestroyAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        service = super().get_object()
        if service.user != self.request.user:
            raise PermissionDenied("You do not have permission to delete this service.")
        return service

# Organization profile: Retrieve or Update only one profile per user
class OrganizationProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = OrganizationProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, created = OrganizationProfile.objects.get_or_create(user=self.request.user)
        return profile
