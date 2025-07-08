from rest_framework import serializers
from datetime import date, datetime
from django.utils.timesince import timesince
from .models import *
from accounts.serializers import ProfileUpdateSerializer,FileSerializer


class JobSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()
    organization_details = ProfileUpdateSerializer(read_only=True, source='organization')
    applied = serializers.SerializerMethodField()  
    saved = serializers.SerializerMethodField()
    interviewed = serializers.SerializerMethodField()
    applicant_count = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ['organization', 'created_at', 'organization_details']

    def get_status(self, obj):
        return "expired" if obj.deadline and obj.deadline < date.today() else "active"

    def get_time_ago(self, obj):
        if obj.created_at:
            return timesince(obj.created_at) + " ago"
        return ""

    def get_applied(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated and user.role == 'individual':
            return JobApplication.objects.filter(user=user, job=obj).exists()
        return False

    def get_saved(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated and user.role == 'individual':
            return SavedJob.objects.filter(user=user, job=obj).exists()
        return False

    def get_interviewed(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated and user.role == 'individual':
            return JobApplication.objects.filter(user=user, job=obj, status='interview').exists()
        return False

    def get_applicant_count(self, obj):
        count = JobApplication.objects.filter(job=obj).count()
        if count < 1000:
            return str(count)
        else:
            return f"{count // 1000}k"

    def validate(self, data):
        category = data.get('category')
        salary_min = data.get('salary_min')
        salary_max = data.get('salary_max')
        experience = data.get('experience_required')

        if category == 'job':
            if salary_min is None or salary_max is None:
                raise serializers.ValidationError("Salary is required for Job category.")
            if experience is None:
                raise serializers.ValidationError("Experience is required for Job category.")

        if category == 'internship':
            pass

        if category  == 'volunteering':
            if salary_min or salary_max:
                raise serializers.ValidationError(f"Salary not allowed for {category}.")
            if experience:
                raise serializers.ValidationError(f"Experience not required for {category}.")
        if category == 'project':

            if experience is None:
                raise serializers.ValidationError("Experience is required for Project.")
        return data

class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ['id', 'job', 'status', 'applied_at']
        read_only_fields = ['user', 'status', 'applied_at']

class AppliedJobSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)

    class Meta:
        model = JobApplication
        fields = ['id', 'status', 'created_at', 'job']


class SavedJobSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)

    class Meta:
        model = SavedJob
        fields = ['id', 'created_at', 'job']

class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = '__all__'
        read_only_fields = ['user', 'created_at']

class CandidatesSerializer(serializers.ModelSerializer):
    job = JobSerializer()
    user = ProfileUpdateSerializer()
    resume = FileSerializer()
    class Meta:
        model=JobApplication
        fields= '__all__'
class InterviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interview
        fields = [
            'id',
            'name',
            'email',
            'position',
            'date',
            'time',
            'duration_minutes',
            'interview_mode',
            'meeting_link',
            'notes',
            'status',
            'created_at',
            'updated_at',
        ]
class EventSerializer(serializers.ModelSerializer):

    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ['user']

    def create(self, validated_data):
        user = self.context['request'].user
        return Event.objects.create(user=user, **validated_data)
        
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'title', 'content', 'created_at']