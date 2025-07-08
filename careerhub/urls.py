from django.urls import path
from .views import *

urlpatterns = [
    path('jobs/', JobListCreateView.as_view(), name='add-job'),
    path('jobs/<int:pk>/', JobUpdateDeleteView.as_view(), name='job-update-delete'),
    path('jobs/<int:job_id>/apply/', ApplyJobView.as_view(), name='apply-job'),
    path('jobs/<int:job_id>/withdraw/', WithdrawJobApplicationView.as_view(), name='withdraw-job'),
    path('jobs/<int:job_id>/save/', SaveJobView.as_view(), name='save-job'),
    path('my-jobs/applied/', AppliedJobsView.as_view(), name='applied-jobs'),
    path('my-jobs/interview/', InterviewJobsView.as_view(), name='interview-jobs'),
    path('my-jobs/saved/', SavedJobsView.as_view(), name='saved-jobs'),
    path('reminders/', ReminderListCreateView.as_view(), name='reminder-list-create'),
    path('reminders/<int:pk>/', ReminderRetrieveUpdateDestroyView.as_view(), name='reminder-detail'),
    path('candidates/',JobCandidatesListView.as_view(),name='candiates-jobs'),
    path('applications/<int:pk>/interview/', ChangeStatusToInterviewView.as_view(), name='change-to-interview'),
    path('applications/<int:pk>/reject/', RejectApplication.as_view(), name='Reject-candidate'),
    path("interviews/", InterviewListView.as_view(), name="list-intervvieww"),
    path("interviews/add/", ChangeStatusToInterviewView.as_view(), name="add-interview"),
    path("interviews/<int:pk>/", InterviewRetrieveUpdateDeleteView.as_view()),
    path("interviews/<int:pk>/complete/", MarkInterviewCompleted.as_view()),
    path("interviews/<int:pk>/accept/", MarkInterviewAccepted.as_view()),
    path("interviews/<int:pk>/reject/", MarkInterviewRejected.as_view()),
    path("dashboard/", OrganizationDashboardView.as_view(), name="organization-dashboard"),
    path('events/', EventListCreateView.as_view(), name='event-list-create'),
    path('events/<int:pk>/', EventRetrieveUpdateDestroyView.as_view(), name='event-detail'),
    path('notes/', NoteListCreateView.as_view(), name='note-list-create'),
    path('notes/<int:pk>/', NoteRetrieveUpdateDestroyView.as_view(), name='note-detail'),
    path("latest-jobs/", LatestJobsView.as_view(), name="latest-jobs"),
]

