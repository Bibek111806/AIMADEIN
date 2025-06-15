from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class Job(models.Model):
    JOB_TYPE_CHOICES = [
        ('full-time', 'Full Time'),
        ('part-time', 'Part Time'),
        ('internship', 'Internship'),
        ('freelance', 'Freelance'),
        ('volunteering', 'Volunteering'),
    ]

    title = models.CharField(max_length=255)
    organization = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'organization'})
    description = models.TextField()
    location = models.CharField(max_length=255)
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES)
    salary = models.CharField(max_length=100, blank=True, null=True)
    
    requirements = models.JSONField(default=list, blank=True)
    responsibilities = models.JSONField(default=list, blank=True)
    required_skills = models.JSONField(default=list, blank=True)
    benefits_and_perks = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title