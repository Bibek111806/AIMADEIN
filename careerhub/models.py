from django.db import models
from django.conf import settings
from accounts.models import Files
JOB_TYPE_CHOICES = [
    ('full_time', 'Full-time'),
    ('part_time', 'Part-time'),
    ('freelance', 'Freelance'),
    ('contract', 'Contract'),
    ('temporary', 'Temporary'),
]

CATEGORY_CHOICES = [
    ('job', 'Job'),
    ('internship', 'Internship'),
    ('volunteering', 'Volunteering'),
    ('project', 'Project'),
]

class Job(models.Model):
    organization = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255)

    # Salary range
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # Experience
    experience_required = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)  # e.g., 2.5 years

    # Job metadata
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)

    # Tags and details
    work_tags = models.JSONField(default=list, blank=True)
    requirements = models.JSONField(default=list, blank=True)
    responsibilities = models.JSONField(default=list, blank=True)
    skills_required = models.JSONField(default=list, blank=True)
    perks = models.JSONField(default=list, blank=True)

    deadline = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.category})"
    
class JobApplication(models.Model):
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('interview', 'Interview'),
        ('offered', 'Offered'),
        ('rejected', 'Rejected'),
    ]

    job = models.ForeignKey(Job, on_delete=models.CASCADE,related_name="jobs")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,related_name="user")
    resume = models.ForeignKey(Files, on_delete=models.SET_NULL, null=True, blank=False, limit_choices_to={'file_type': 'resume'},related_name="resume")
    applied_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    class Meta:
        unique_together = ('job', 'user')

class SavedJob(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('job', 'user')
class Reminder(models.Model):
    PRIORITY_CHOICES = [('low', 'Low'), ('medium', 'Medium'), ('high', 'High')]
    TYPE_CHOICES = [('personal', 'Personal'), ('followup', 'Follow-up'), ('deadline', 'Deadline')]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reminders')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_date = models.DateField()
    due_time = models.TimeField(blank=True, null=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='personal')
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

INTERVIEW_MODE_CHOICES = [
    ('online', 'Online'),
    ('offline', 'Offline'),
    ('zoom', 'Zoom'),
    ('google_meet', 'Google Meet'),
    ('phone_call', 'Phone Call'),
]

STATUS_CHOICES = [
    ('scheduled', 'Scheduled'),
    ('completed', 'Completed'),
    ('accepted', 'Accepted'),
    ('rejected', 'Rejected'),
]

class Interview(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    organization = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
      
    )
    position = models.CharField(max_length=255)
    date = models.DateField()
    time = models.TimeField()
    duration_minutes = models.PositiveIntegerField(
        help_text="Duration in minutes",
        null=True,
        blank=True
    )
    interview_mode = models.CharField(
        max_length=50,
        choices=INTERVIEW_MODE_CHOICES
    )
    meeting_link = models.URLField(
        max_length=500,
        blank=True,
        null=True
    )
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='scheduled'
    )
    job_application = models.ForeignKey(
        'JobApplication',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='interviews'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Interview with {self.name} for {self.position} on {self.date}"
    
EVENT_TYPES = [
    ('interview', 'Interview'),
    ('event', 'Event'),
    ('deadline', 'Deadline'),
    ('education', 'Education'),
]

class Event(models.Model):
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=50, choices=EVENT_TYPES)
    date = models.DateField()
    time = models.CharField(max_length=50)  # e.g. "2:00 PM"
    duration = models.CharField(max_length=50)  # e.g. "1 hour"
    location = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL,  on_delete=models.CASCADE, related_name="events")
  

    def __str__(self):
        return self.title
class Note(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notes'
    )
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
