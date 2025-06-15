from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
import random
import os
from django.dispatch import receiver
from django.db.models.signals import post_delete,pre_save
from .utils import *

class UserManager(BaseUserManager):
    def create_user(self, email, phone, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        if not phone:
            raise ValueError("Phone is required")
        email = self.normalize_email(email)
        user = self.model(email=email, phone=phone, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, phone, password=None, **extra_fields):
        extra_fields.setdefault('role', 'system_admin')
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_staff', True)
        return self.create_user(email, phone, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('individual', 'Individual'),
        ('organization', 'Organization'),
        ('system_admin', 'System Admin'),
    ]

    # Core fields
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    profile_picture = models.ImageField(upload_to=user_profile_path, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)

    # Individual fields
    first_name = models.CharField(max_length=50, blank=True, null=True)
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50, blank=True, null=True)
    professional_title = models.CharField(max_length=100, blank=True, null=True)

    # Organization fields
    company_name = models.CharField(max_length=255, blank=True, null=True)

    # OTP and tracking
    email_otp = models.CharField(max_length=6, blank=True, null=True)
    phone_otp = models.CharField(max_length=6, blank=True, null=True)
    email_otp_created = models.DateTimeField(blank=True, null=True)
    phone_otp_created = models.DateTimeField(blank=True, null=True)
    email_otp_attempts = models.IntegerField(default=0)
    phone_otp_attempts = models.IntegerField(default=0)
    # visibility fields
    PROFILE_VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('organization', 'Organization Only'),
        ('connection', 'Connections Only'),
    ]
    
    profile_visibility = models.CharField(
        max_length=20,
        choices=PROFILE_VISIBILITY_CHOICES,
        default='public'
    )
    show_email = models.BooleanField(default=True)
    show_phone = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['phone']

    objects = UserManager()

    def __str__(self):
        return self.email

    def generate_otp(self):
        return str(random.randint(100000, 999999))

    def set_email_otp(self):
        self.email_otp = self.generate_otp()
        self.email_otp_created = timezone.now()
        self.email_otp_attempts = 0

    def set_phone_otp(self):
        self.phone_otp = self.generate_otp()
        self.phone_otp_created = timezone.now()
        self.phone_otp_attempts = 0

class Skills(models.Model):
    name = models.CharField(max_length=50)
    user = models.ForeignKey(User,on_delete=models.CASCADE, related_name='skills')
    class Meta:
        unique_together = ('user', 'name')  
    
    def __str__(self):
        return self.name

class Education(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='educations' )
    institution = models.CharField(max_length=255)
    degree = models.CharField(max_length=255)
    start_year = models.PositiveIntegerField()
    end_year = models.PositiveIntegerField(null=True, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['-start_year']

    def __str__(self):
        return f"{self.user.email}-{self.degree}-{self.institution}"
class Work(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='works')
    company = models.CharField(max_length=255)
    post = models.CharField(max_length=255)
    start_year = models.PositiveIntegerField()
    end_year = models.PositiveIntegerField(null=True, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['-start_year']

    def __str__(self):
        return f"{self.user.email}-{self.post}-{self.company}"



class Files(models.Model):
    FILE_TYPE_CHOICES = [
        ('resume', 'Resume'),
        ('certificate', 'Certificate'),
        ('transcript', 'Transcript'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_files')
    file = models.FileField(upload_to=file_path)
    file_type = models.CharField(max_length=20, choices=FILE_TYPE_CHOICES)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.file_type} - {self.file.name}"
    
# To delete files when file model data is deleted   
@receiver(post_delete, sender=Files)
def delete_file_on_model_delete(sender, instance, **kwargs):
    if instance.file:
        if os.path.isfile(instance.file.path):
            os.remove(instance.file.path)

@receiver(post_delete, sender=User)
def delete_profile_picture_on_user_delete(sender, instance, **kwargs):
    if instance.profile_picture:
        if os.path.isfile(instance.profile_picture.path):
            os.remove(instance.profile_picture.path)


@receiver(pre_save, sender=User)
def delete_old_profile_picture_on_change(sender, instance, **kwargs):
    if not instance.pk:
        return  # New user

    try:
        old_user = User.objects.get(pk=instance.pk)
    except User.DoesNotExist:
        return

    old_file = old_user.profile_picture
    new_file = instance.profile_picture

    if old_file and old_file != new_file and os.path.isfile(old_file.path):
        os.remove(old_file.path)

