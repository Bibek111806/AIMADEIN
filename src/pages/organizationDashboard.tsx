import {
  Users,
  Briefcase,
  Calendar,
  TrendingUp,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { useJobManager } from "@/context/JobManagerContext";
import { useAuth } from "@/context/authContext";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useDashboard } from "@/context/DashboardContext";
import { useInterview } from "@/context/InterviewContext";
import { useNavigate } from "react-router-dom";
const OrganizationDashboard = () => {
  const {user} = useAuth();
  const { openCreateModal, openEditModal, openDeleteModal } = useJobManager();
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    activeJobs,
    recentCandidates,
    upcomingInterviews,
    stats
  } = useDashboard();
    const {
    openModal,
    setInterviewToDelete,
    InterviewModal,
    interviews,
  } = useInterview();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg p-6 text-white">
          <h2 className="text-3xl font-bold mb-2">{user?.company_name} Dashboard 🏢</h2>
          <p className="text-indigo-100 text-lg">
            Manage your talent acquisition and team growth
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                  </p>
                  </div>
                  <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Jobs */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Active Job Postings
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() =>
                    openCreateModal()
                  }
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Job
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeJobs.slice(0, 4).map((job) => (
                <div key={job.id} className="space-y-2 p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">{job.title}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          job.status === "active" ? "default" : "secondary"
                        }
                      >
                        {job.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          openEditModal(job)
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={()=>openDeleteModal(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {job.applications || 0} applications
                  </p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Posted {job.posted || "recently"}</span>
                    <span>Deadline: {job.deadline || "N/A"}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Candidates */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Recent Candidates
                </CardTitle>
              </div>
              <CardDescription>
                Latest applicants in your pipeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentCandidates.slice(0, 4).map((candidate) => (
                <div key={candidate.id} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-sm">
                        {candidate.user?.first_name}{" "}
                        {candidate.user?.middle_name}{" "}
                        {candidate.user?.last_name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {candidate.user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">
                      {candidate.stage || "Applied"}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {candidate.applied}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Interviews */}
         <Card className="border-0 shadow-sm">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle className="flex items-center">
        <Calendar className="mr-2 h-5 w-5" />
        Upcoming Interviews
      </CardTitle>
      <Button
        size="sm"
        onClick={() => openModal()}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Interview
      </Button>
    </div>
    <CardDescription>
      Don&apos;t miss these scheduled interviews
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {upcomingInterviews.slice(0, 4).map((interview) => (
      <div key={interview.id} className="space-y-2 p-3 border rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-sm">
              {interview.candidate}
            </h4>
            <p className="text-xs text-gray-600">
              {interview.position}
            </p>
          </div>
       
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{interview.status}</Badge>
                 {!["accepted", "rejected"].includes(
            interview.status?.toLowerCase() || ""
          ) && (
            <>
            <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const full = interviews.find((i) => i.id === interview.id);
              if (full) {
                openModal(full);
              } else {
                toast({
                  title: "Interview not found.",
                  description: "Cannot load full interview details.",
                  variant: "destructive",
                });
              }
            }}
            >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const full = interviews.find((i) => i.id === interview.id);
                if (full) {
                  setInterviewToDelete(full);
                } else {
                  toast({
                    title: "Interview not found.",
                    description: "Cannot delete this interview.",
                    variant: "destructive",
                  });
                }
              }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
          </>
          )}
            </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {interview.time}
          </span>
        </div>
      </div>
    ))}
  </CardContent>
</Card>

        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                className="justify-start"
                variant="outline"
                onClick={() =>
                  openCreateModal()
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Post New Job
              </Button>
              <Button
                className="justify-start"
                variant="outline"
                onClick={() => navigate('/candidates')}
              >
                <Users className="mr-2 h-4 w-4" />
                Review Candidates
              </Button>
              <Button
                className="justify-start"
                variant="outline"
                onClick={() => openModal()}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Interviews
              </Button>
            </div>
          </CardContent>
        </Card>
        {InterviewModal}
      </div>
    </DashboardLayout>
  );
};

export default OrganizationDashboard;
