from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Job
from .serializers import JobSerializer

class JobCreateView(generics.CreateAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if getattr(user, 'user_type', None) != 'organization':
            raise PermissionDenied("Only users with type 'organization' can post jobs.")
        serializer.save(organization=user)
