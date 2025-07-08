from rest_framework import generics, status,permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from django.db.models import Q
from .models import *
from .serializers import *
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
class JobPagination(PageNumberPagination):
    page_size = 10                # or any size you prefer
    page_size_query_param = 'page_size'
    max_page_size = 100
class JobListCreateView(generics.ListCreateAPIView):
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = JobPagination

    def get_queryset(self):
        user = self.request.user

        queryset = Job.objects.all().order_by('-created_at')

        if user.role == 'organization':
            queryset = queryset.filter(organization=user)
        else:
            category = self.request.query_params.get('category')
            job_type = self.request.query_params.get('type')
            experience = self.request.query_params.get('experience')
            location = self.request.query_params.get('location')
            search = self.request.query_params.get('search')

            if category:
                queryset = queryset.filter(category__iexact=category)

            if job_type:
                queryset = queryset.filter(job_type__iexact=job_type)

            if experience:
                queryset = queryset.filter(experience_required__gte=int(experience))

            if location:
                queryset = queryset.filter(location__icontains=location)

            if search:
                queryset = queryset.filter(
                    Q(title__icontains=search) |
                    Q(description__icontains=search)
                )

        return queryset

    def perform_create(self, serializer):
        if self.request.user.role != 'organization':
            raise PermissionError("Only organizations can post jobs.")
        serializer.save(organization=self.request.user)
class JobUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj = super().get_object()

        # Allow read-only access to individual users for any job
        if self.request.method in ['GET']:
            return obj

        # For update/delete (PATCH/PUT/DELETE), only allow if user is the owner organization
        if self.request.user.role == 'organization' and obj.organization == self.request.user:
            return obj

        raise PermissionDenied("You are not allowed to modify this job.")
class ApplyJobView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, job_id):
        job = Job.objects.filter(id=job_id).first()
        if not job:
            return Response({"detail": "Job not found"}, status=404)

        # Prevent duplicate application
        if JobApplication.objects.filter(user=request.user, job=job).exists():
            return Response({"detail": "You have already applied to this job."}, status=400)

        resume_id = request.data.get('resume')
        resume = None

        if resume_id:
            try:
                resume = Files.objects.get(id=resume_id, file_type='resume')
            except Files.DoesNotExist:
                return Response({"detail": "Resume file not found."}, status=400)

        application = JobApplication.objects.create(
            user=request.user,
            job=job,
            status="applied",
            resume=resume
        )
        serializer = JobApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class WithdrawJobApplicationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, job_id):
        application = JobApplication.objects.filter(user=request.user, job_id=job_id).first()
        if not application:
            return Response({"detail": "Application not found."}, status=404)

        if application.status == "interview":
            return Response({"detail": "You cannot withdraw after interview stage."}, status=400)

        application.delete()
        return Response({"detail": "Application withdrawn successfully."})
    
class SaveJobView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, job_id):
        job = Job.objects.filter(id=job_id).first()
        if not job:
            return Response({"detail": "Job not found"}, status=404)

        saved_job = SavedJob.objects.filter(user=request.user, job=job).first()

        if saved_job:
            saved_job.delete()
            return Response({
                "detail": "Job unsaved",
                "is_saved": False
            }, status=200)
        else:
            SavedJob.objects.create(user=request.user, job=job)
            return Response({
                "detail": "Job saved",
                "is_saved": True
            }, status=201)
    
class AppliedJobsView(generics.ListAPIView):
    serializer_class = AppliedJobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = JobApplication.objects.filter(
            user=self.request.user,
            status='applied'
        ).select_related(
            'job',
            'job__organization',
            'job__organization__organization_profile'
        )

        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(job__category__iexact=category)

        return queryset



class InterviewJobsView(generics.ListAPIView):
    serializer_class = AppliedJobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = JobApplication.objects.filter(
            user=self.request.user,
            status='interview'
        ).select_related(
            'job',
            'job__organization',
            'job__organization__organization_profile'
        )

        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(job__category__iexact=category)

        return queryset



class SavedJobsView(generics.ListAPIView):
    serializer_class = SavedJobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = SavedJob.objects.filter(
            user=self.request.user
        ).select_related(
            'job',
            'job__organization',
            'job__organization__organization_profile'
        )

        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(job__category__iexact=category)

        return queryset

    
class ReminderListCreateView(generics.ListCreateAPIView):
    serializer_class = ReminderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reminder.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ReminderRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReminderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reminder.objects.filter(user=self.request.user)
    
class JobCandidatesListView(generics.ListAPIView):
    serializer_class = CandidatesSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        queryset = JobApplication.objects.filter(
            job__organization=user
        ).select_related('job', 'user', 'resume')

        job_id = self.request.query_params.get('job_id')
        if job_id:
            queryset = queryset.filter(job_id=job_id)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) |
                Q(user__middle_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__skills__name__icontains=search)
            ).distinct()

        return queryset
    
class ChangeStatusToInterviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk=None):
        job_application = None

        #  schedule from job application
        if pk:
            try:
                job_application = JobApplication.objects.get(pk=pk)
            except JobApplication.DoesNotExist:
                return Response(
                    {"detail": "Application not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Update Job Application status
            job_application.status = 'interview'
            job_application.save()

            # Extract name, email, position from job application
            user_obj = job_application.user
            name_parts = filter(None, [user_obj.first_name, user_obj.middle_name, user_obj.last_name])
            name = " ".join(name_parts)
            email = user_obj.email
            position = job_application.job.title

            # Inject those values into request data
            initial_data = request.data.copy()
            initial_data["name"] = name
            initial_data["email"] = email
            initial_data["position"] = position
            initial_data["organization"] = request.user.id
            initial_data["job_application"] = job_application.id

        else:
            # Manual interview → these values must be provided in request
            initial_data = request.data.copy()
            initial_data["organization"] = request.user.id
            initial_data["job_application"] = None

        # Always set status to scheduled
        initial_data["status"] = "scheduled"

        # Use serializer for validation
        serializer = InterviewSerializer(data=initial_data)
        serializer.is_valid(raise_exception=True)
        interview = serializer.save(organization=request.user)

        response_data = {
            "detail": "Interview scheduled successfully.",
            "interview_id": interview.id,
        }

        if job_application:
            job_application_serializer = CandidatesSerializer(job_application, context={"request": request})
            response_data["application"] = job_application_serializer.data

        return Response(response_data, status=status.HTTP_200_OK)

class InterviewListView(generics.ListAPIView):
    serializer_class = InterviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # superuser can see all
        if user.is_superuser:
            queryset = Interview.objects.all()
        else:
            # only interviews for this organization
            queryset = Interview.objects.filter(organization=user)

        # manually filter by status if provided
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        # manually filter by job_application if provided
        job_app_id = self.request.query_params.get('job_application')
        if job_app_id:
            queryset = queryset.filter(job_application_id=job_app_id)

        # manually search name or position
        search_term = self.request.query_params.get('search')
        if search_term:
            queryset = queryset.filter(
                Q(name__icontains=search_term) |
                Q(position__icontains=search_term)
            )

        return queryset.order_by('-date', '-time')
    
class InterviewRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = InterviewSerializer

    def get_queryset(self):
        # ✅ Limit to only interviews belonging to the logged-in user
        return Interview.objects.filter(organization=self.request.user)

    def update(self, request, *args, **kwargs):
        interview = self.get_object()

        # ✅ Prevent editing if accepted or rejected
        if interview.status in ["accepted", "rejected"]:
            return Response(
                {"detail": "Cannot edit an interview once accepted or rejected."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        interview = self.get_object()

        if interview.status in ["accepted", "rejected"]:
            return Response(
                {"detail": "Cannot delete an interview once accepted or rejected."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().destroy(request, *args, **kwargs)

#  Mark as Completed
class MarkInterviewCompleted(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            interview = Interview.objects.get(pk=pk, organization=request.user)
        except Interview.DoesNotExist:
            return Response({"detail": "Interview not found."}, status=404)

        if interview.status != "scheduled":
            return Response(
                {"detail": "Only scheduled interviews can be marked as completed."},
                status=400
            )

        interview.status = "completed"
        interview.save()

        serializer = InterviewSerializer(interview)
        return Response(serializer.data)


class MarkInterviewAccepted(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            interview = Interview.objects.get(pk=pk, organization=request.user)
        except Interview.DoesNotExist:
            return Response({"detail": "Interview not found."}, status=404)

        if interview.status != "completed":
            return Response(
                {"detail": "Only completed interviews can be accepted."},
                status=400
            )

        interview.status = "accepted"
        interview.save()

        # ✅ Update related job application status
        if interview.job_application:
            interview.job_application.status = "offered"  
            interview.job_application.save()

        serializer = InterviewSerializer(interview)
        return Response(serializer.data)
class MarkInterviewRejected(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            interview = Interview.objects.get(pk=pk, organization=request.user)
        except Interview.DoesNotExist:
            return Response({"detail": "Interview not found."}, status=404)

        if interview.status != "completed":
            return Response(
                {"detail": "Only completed interviews can be rejected."},
                status=400
            )

        interview.status = "rejected"
        interview.save()

        # ✅ Update related job application status
        if interview.job_application:
            interview.job_application.status = "rejected"
            interview.job_application.save()

        serializer = InterviewSerializer(interview)
        return Response(serializer.data)
class RejectApplication(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        job_app = get_object_or_404(JobApplication, pk=pk)
        
        # Check if the logged-in user is the owner of the job
        if job_app.job.organization != request.user:
            return Response(
                {'detail': 'You do not have permission to reject this application.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        job_app.status = 'rejected'
        job_app.save()

        return Response({'message': 'Application rejected successfully.'}, status=status.HTTP_200_OK)

class OrganizationDashboardView(APIView):
    def get(self, request):
        organization = request.user

        # Active jobs
        active_jobs = (
            Job.objects
            .filter(organization=organization, deadline__gte=date.today())
            .order_by('-created_at')[:4]
        )
        active_jobs_serialized = JobSerializer(
            active_jobs,
            many=True,
            context={'request': request}
        ).data

        # Total applications
        total_applications = (
            JobApplication.objects
            .filter(job__organization=organization)
            .count()
        )

        # Total interviews
        total_interviews = (
            Interview.objects
            .filter(job_application__job__organization=organization)
            .count()
        )

        # Recent candidates
        recent_candidates = (
            JobApplication.objects
            .select_related('user', 'job')
            .filter(job__organization=organization)
            .order_by('-applied_at')[:6]
        )
        candidates_data = []
        for app in recent_candidates:
            candidates_data.append({
                "id": app.id,
                "user": {
                    "first_name": app.user.first_name,
                    "middle_name": app.user.middle_name,
                    "last_name": app.user.last_name,
                    "email": app.user.email,
                },
                "applied": timesince(app.applied_at) + " ago" if app.applied_at else "",
                "stage": app.status,
                "job_title": app.job.title if app.job else "",
            })

        # Upcoming interviews
        upcoming_interviews = (
            Interview.objects
            .filter(organization=organization)
            .order_by('date')[:6]
        )
        interview_data = []
        for interview in upcoming_interviews:
            interview_data.append({
                "id": interview.id,
                "candidate": interview.name,
                "position": interview.position,
                "time": f"{interview.date} {interview.time}",
                "type": interview.interview_mode,
                "status": interview.status,
            })

        return Response({
            "active_jobs_count": active_jobs.count(),
            "total_applications": total_applications,
            "total_interviews": total_interviews,
            "active_jobs": active_jobs_serialized,
            "recent_candidates": candidates_data,
            "upcoming_interviews": interview_data,
        })
class EventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.all().order_by("date")
    serializer_class = EventSerializer

class EventRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
class NoteListCreateView(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NoteRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user)
    
class LatestJobsView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return (
            Job.objects
            .filter(
                category="job",
                deadline__gte=timezone.now()
            )
            .order_by("-created_at")[:6]
        )