import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Edit,
  Trash2,
  Plus,
  Filter,
  Calendar,
  Clock,
  Globe,
  MapPin,
  Video,
  Phone,
  MessageSquare,
  CheckCircle,
  UserCheck,
  UserX,
} from "lucide-react";

import { useInterview } from "@/context/InterviewContext";


const Interview = () => {
  const {
    interviews,
    openModal,
    InterviewModal,
  
    editingInterview,
    setInterviewToDelete,
    interviewToDelete,
    handleDeleteInterview,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    updateInterviewStatus,
  } = useInterview();

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch =
      interview.candidateName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      interview.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      interview.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Interview Management
              </h1>
              <p className="text-gray-600 mt-2">
                Schedule and manage candidate interviews
              </p>
            </div>
            <Button onClick={() => openModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by candidate name or position..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interviews List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredInterviews.map((interview) => (
              <Card
                key={interview.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {interview.candidateName}
                      </CardTitle>
                      <CardDescription>{interview.position}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(interview.status)}>
                        {interview.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openModal(interview)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setInterviewToDelete(interview)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      <span>{interview.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-green-500" />
                      <span>
                        {interview.time} ({interview.duration}min)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm">
                    {interview.mode.toLowerCase() === "online" && (
                      <Globe className="h-4 w-4 mr-2 text-blue-500" />
                    )}
                    {["zoom", "google meet"].includes(
                      interview.mode.toLowerCase()
                    ) && <Video className="h-4 w-4 mr-2 text-blue-500" />}
                    {interview.mode.toLowerCase() === "offline" && (
                      <MapPin className="h-4 w-4 mr-2 text-red-500" />
                    )}
                    {interview.mode.toLowerCase() === "phone call" && (
                      <Phone className="h-4 w-4 mr-2 text-green-500" />
                    )}
                    <span>{interview.mode}</span>
                  </div>

                  {interview.notes && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <MessageSquare className="h-4 w-4 inline mr-1" />
                      {interview.notes}
                    </div>
                  )}

                  {interview.status === "scheduled" && (
                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateInterviewStatus(interview.id, "Completed")
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Complete
                      </Button>
                    </div>
                  )}

                  {interview.status === "completed" && (
                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-green-50 hover:bg-green-100"
                        onClick={() =>
                          updateInterviewStatus(interview.id, "Accepted")
                        }
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-red-50 hover:bg-red-100"
                        onClick={() =>
                          updateInterviewStatus(interview.id, "Rejected")
                        }
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {interview.meetingLink &&
                    interview.status === "scheduled" && (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          window.open(interview.meetingLink, "_blank")
                        }
                      >
                        <Video className="h-4 w-4 mr-1" />
                        Join Meeting
                      </Button>
                    )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredInterviews.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No interviews found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or schedule a new
                  interview.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Interview Modal */}
          {InterviewModal}

    
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Interview;
