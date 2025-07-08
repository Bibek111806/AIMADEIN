from rest_framework import serializers
from .models import *
from .sms import send_phone_otp
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
import mimetypes

# Registration serializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = [
            'email', 'phone', 'password', 'role',

            # Individual fields
            'first_name', 'middle_name', 'last_name',
            'professional_title',  

            # Organization fields
            'company_name', 
        ]

    def validate(self, data):
        role = data.get('role')

        if role == 'individual':
            required_fields = ['first_name', 'last_name']
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError({field: f"{field} is required for individual users."})
        
        if role == 'organization':
            if not data.get('company_name'):
                raise serializers.ValidationError({'company_name': "Company name is required for organization users."})

        return data

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
# resend otp serializer
class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    type = serializers.ChoiceField(choices=['email', 'phone'])

    def validate(self, data):
        email = data['email']
        otp_type = data['type']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found.")

        now = timezone.now()

        if otp_type == 'email':
            if user.email_verified:
                raise serializers.ValidationError("Email already verified.")
            if user.email_otp_created and now - user.email_otp_created < timedelta(minutes=1):
                raise serializers.ValidationError("Please wait 1 minute before resending email OTP.")
        elif otp_type == 'phone':
            if not user.email_verified:
                raise serializers.ValidationError("Verify email first.")
            if user.phone_verified:
                raise serializers.ValidationError("Phone already verified.")
            if user.phone_otp_created and now - user.phone_otp_created < timedelta(minutes=1):
                raise serializers.ValidationError("Please wait 1 minute before resending phone OTP.")

        self.user = user
        return data

    def save(self):
        user = self.user
        if self.validated_data['type'] == 'email':
            user.set_email_otp()
            user.save()
            send_mail(
                'Verify your email',
                f'Your email verification code is: {user.email_otp}',
                'admin@example.com',
                [user.email]
            )
        else:
            user.set_phone_otp()
            user.save()
            send_phone_otp(user.phone, user.phone_otp)
        return user

# verify email serializer
class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    email_otp = serializers.CharField()

    def validate(self, data):
        try:
            user = User.objects.get(email=data['email'])
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found.")

        if user.email_verified:
            raise serializers.ValidationError("Email already verified.")

        if timezone.now() - user.email_otp_created > timedelta(minutes=10):
            raise serializers.ValidationError("Email OTP expired.")

        if user.email_otp_attempts >= 5:
            raise serializers.ValidationError("Too many incorrect attempts.")

        if user.email_otp != data['email_otp']:
            user.email_otp_attempts += 1
            user.save()
            raise serializers.ValidationError("Invalid email OTP.")

        self.user = user
        return data

    def save(self):
        user = self.user
        user.email_verified = True
        user.email_otp = None
        user.email_otp_attempts = 0
        user.set_phone_otp()
        user.save()
        send_phone_otp(user.phone, user.phone_otp)
        return user

# verify phone serializer
class VerifyPhoneSerializer(serializers.Serializer):
    email = serializers.EmailField()
    phone_otp = serializers.CharField()

    def validate(self, data):
        try:
            user = User.objects.get(email=data['email'])
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found.")

        if not user.email_verified:
            raise serializers.ValidationError("Email must be verified first.")
        if user.phone_verified:
            raise serializers.ValidationError("Phone already verified.")
        if timezone.now() - user.phone_otp_created > timedelta(minutes=10):
            raise serializers.ValidationError("Phone OTP expired.")
        if user.phone_otp_attempts >= 5:
            raise serializers.ValidationError("Too many incorrect attempts.")
        if user.phone_otp != data['phone_otp']:
            user.phone_otp_attempts += 1
            user.save()
            raise serializers.ValidationError("Invalid phone OTP.")

        self.user = user
        return data

    def save(self):
        user = self.user
        user.phone_verified = True
        user.phone_otp = None
        user.phone_otp_attempts = 0
        user.save()
        return user

# login serializer
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        user = authenticate(email=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.email_verified:
            raise serializers.ValidationError("Email is not verified.")

        if not user.phone_verified:
            raise serializers.ValidationError("Phone number is not verified.")

        refresh = RefreshToken.for_user(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "role": user.role,
            "email": user.email,
        }

# skills serializer
class SkillsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skills
        fields = ['id','name','user']
        read_only_fields = ['user']

    def validate_name(self, value):
        user = self.context['request'].user
        if Skills.objects.filter(user=user, name__iexact=value).exists():
            raise serializers.ValidationError("Skills already exists.")
        return value
# education serializer
class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'
        read_only_fields = ['user']

    def validate(self, data):
        start = data.get('start_year')
        end = data.get('end_year')
        if end is not None and end < start:
            raise serializers.ValidationError("End year cannot be before start year.")
        return data
# work serializer
class WorkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Work
        fields = '__all__'
        read_only_fields = ['user']

    def validate(self, data):
        start = data.get('start_year')
        end = data.get('end_year')

        # If end_year is blank or None, set it to "present"
        if not end:
            data['end_year'] = "present"
        elif isinstance(end, int) and isinstance(start, int) and end < start:
            raise serializers.ValidationError("End year cannot be before start year.")
        
        return data

ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',                         # .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  # .docx
    'image/png',
    'image/jpeg',
    'image/jpg'
]

ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg']
# File serializer
class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Files
        fields = '__all__'
        read_only_fields = ['user', 'uploaded_at']

    def validate_file(self, value):
        # Check MIME type
        mime_type, _ = mimetypes.guess_type(value.name)
        ext = value.name.lower().split('.')[-1]
        
        if mime_type not in ALLOWED_MIME_TYPES:
            raise serializers.ValidationError(f"Unsupported file type: {mime_type}")

        if not any(value.name.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS):
            raise serializers.ValidationError("Unsupported file extension.")
        
        return value
class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'name']

    def validate_name(self, value):
        user = self.context['request'].user
        if user.role != 'organization':
            raise serializers.ValidationError("Only organizations can add services.")

        if not hasattr(user, 'organization_profile'):
            raise serializers.ValidationError("Organization profile not found.")

        if user.services.filter(name__iexact=value).exists():
            raise serializers.ValidationError("Service name already exists for your organization.")

        return value

class OrganizationProfileSerializer(serializers.ModelSerializer):


    class Meta:
        model = OrganizationProfile
        fields = [
            'founding_year',
            'industry_type',
            'contact_person',
      
        ]
   

# profile update serializer
class ProfileUpdateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    phone = serializers.CharField(required=True)
    skills = SkillsSerializer(many=True, read_only=True)
    educations = EducationSerializer(many=True, read_only=True)
    works = WorkSerializer(many=True, read_only=True)
    uploaded_files = FileSerializer(many=True, read_only=True)
    organization_profile = OrganizationProfileSerializer(read_only=True)
    services = ServiceSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'company_name',
            'first_name', 'middle_name', 'last_name',
            'professional_title',
            'email', 'phone', 'address', 'bio', 'role',
            'profile_picture',
            'skills', 'educations', 'uploaded_files','works','profile_visibility','show_email','show_phone','organization_profile','services'
        ]
        read_only_fields = ['role', 'skills', 'educations', 'uploaded_files','works','profile_visibility','show_email','show_phone','organization_profile','services']

    def validate(self, data):
        role = self.instance.role  # current user role

        # Check missing values either from update payload or existing instance
        def is_missing(field):
            return not data.get(field) and not getattr(self.instance, field, None)

        if role == 'individual':
            missing_fields = {}
            if is_missing('first_name'):
                missing_fields['first_name'] = 'First name is required for individuals.'
            if is_missing('last_name'):
                missing_fields['last_name'] = 'Last name is required for individuals.'
            if missing_fields:
                raise serializers.ValidationError(missing_fields)

        elif role == 'organization':
            if is_missing('company_name'):
                raise serializers.ValidationError({
                    'company_name': 'Company name is required for organizations.'
                })

        return data

    def validate_email(self, value):
        user = self.instance
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("Email is already in use.")
        return value

    def validate_phone(self, value):
        user = self.instance
        if User.objects.exclude(pk=user.pk).filter(phone=value).exists():
            raise serializers.ValidationError("Phone is already in use.")
        return value
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)
    confirm_password = serializers.CharField(required=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def update(self, instance, validated_data):
        instance.set_password(validated_data['new_password'])
        instance.save()
        return instance
    
class PrivacySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['profile_visibility', 'show_email', 'show_phone']

class SessionInfoSerializer(serializers.Serializer):
    session_key = serializers.CharField()
    ip_address = serializers.CharField()
    location = serializers.CharField()
    user_agent = serializers.CharField()
    last_activity = serializers.DateTimeField()
    is_current = serializers.BooleanField()


