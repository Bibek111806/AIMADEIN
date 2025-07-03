import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Video,
  MapPin,
  Phone,
  MessageSquare,
  CheckCircle,
  UserCheck,
  UserX,
  Filter,
  Globe,
} from "lucide-react";

interface Interview {
  id: number;
  candidateName: string;
  candidateEmail: string;
  position: string;
  date: string;
  time: string;
  duration: string;
  mode: string;
  status: string;
  notes?: string;
  meetingLink?: string;
}

const Interview = () => {
  const { toast } = useToast();

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(
    null
  );
  const [interviewToDelete, setInterviewToDelete] =
    useState<Interview | null>(null);

  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const [interviewForm, setInterviewForm] = useState({
    candidateName: "",
    candidateEmail: "",
    position: "",
    date: "",
    time: "",
    duration: "60",
    mode: "online",
    notes: "",
    meetingLink: "",
  });

  const interviewModes = [
    { label: "Online", value: "online" },
    { label: "Offline", value: "offline" },
    { label: "Zoom", value: "zoom" },
    { label: "Google Meet", value: "google_meet" },
    { label: "Phone Call", value: "phone_call" },
  ];

  useEffect(() => {
    fetchInterviews();
  }, [searchTerm, filterStatus]);

  const fetchInterviews = async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (filterStatus !== "all") {
        params.status = filterStatus;
      }

      const queryString = new URLSearchParams(params).toString();

      const res = await api.get(
        `/interviews/${queryString ? `?${queryString}` : ""}`
      );
      const data = res.data;

      const mapped: Interview[] = data.map((item: any) => ({
        id: item.id,
        candidateName: item.name,
        candidateEmail: item.email,
        position: item.position,
        date: item.date,
        time: item.time,
        duration: item.duration_minutes?.toString() || "",
        mode: item.interview_mode,
        status: item.status,
        notes: item.notes,
        meetingLink: item.meeting_link,
      }));

      setInterviews(mapped);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to fetch interviews.",
        variant: "destructive",
      });
    }
  };

  const handleSaveInterview = async () => {
    setFormErrors({});

    if (!interviewForm.candidateName || !interviewForm.date || !interviewForm.time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingInterview) {
        await api.patch(`/interviews/${editingInterview.id}/`, {
          name: interviewForm.candidateName,
          email: interviewForm.candidateEmail,
          position: interviewForm.position,
          date: interviewForm.date,
          time: interviewForm.time,
          duration_minutes: parseInt(interviewForm.duration),
          interview_mode: interviewForm.mode,
          meeting_link: interviewForm.meetingLink,
          notes: interviewForm.notes,
        });
        toast({
          title: "Success",
          description: "Interview updated successfully.",
        });
      } else {
        await api.patch(`/interviews/add/`, {
          name: interviewForm.candidateName,
          email: interviewForm.candidateEmail,
          position: interviewForm.position,
          date: interviewForm.date,
          time: interviewForm.time,
          duration_minutes: parseInt(interviewForm.duration),
          interview_mode: interviewForm.mode,
          meeting_link: interviewForm.meetingLink,
          notes: interviewForm.notes,
        });
        toast({
          title: "Success",
          description: "Interview scheduled successfully.",
        });
      }
      setIsModalOpen(false);
      fetchInterviews();
    } catch (error: any) {
      console.error(error);
      if (error?.response?.status === 400 && error?.response?.data) {
        setFormErrors(error.response.data);
      } else {
        toast({
          title: "Error",
          description: "Could not save interview.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteInterview = async () => {
    if (interviewToDelete) {
      try {
        await api.delete(`/interviews/${interviewToDelete.id}/`);
        toast({
          title: "Success",
          description: "Interview deleted.",
        });
        setInterviewToDelete(null);
        fetchInterviews();
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Could not delete interview.",
          variant: "destructive",
        });
      }
    }
  };

  const updateInterviewStatus = async (id: number, newStatus: string) => {
    try {
      let endpoint = `/interviews/${id}/`;
      let payload: any = {};

      if (newStatus.toLowerCase() === "completed") {
        endpoint = `/interviews/${id}/complete/`;
      } else if (newStatus.toLowerCase() === "accepted") {
        endpoint = `/interviews/${id}/accept/`;
      } else if (newStatus.toLowerCase() === "rejected") {
        endpoint = `/interviews/${id}/reject/`;
      } else {
        payload.status = newStatus;
      }

      if (["completed", "accepted", "rejected"].includes(newStatus.toLowerCase())) {
        await api.patch(endpoint);
      } else {
        await api.patch(endpoint, payload);
      }

      toast({
        title: "Success",
        description: `Interview marked as ${newStatus}.`,
      });
      fetchInterviews();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  const openModal = (interview: Interview | null = null) => {
    setFormErrors({});
    if (interview) {
      setInterviewForm({
        candidateName: interview.candidateName,
        candidateEmail: interview.candidateEmail,
        position: interview.position,
        date: interview.date,
        time: interview.time,
        duration: interview.duration,
        mode: interview.mode,
        notes: interview.notes || "",
        meetingLink: interview.meetingLink || "",
      });
      setEditingInterview(interview);
    } else {
      setInterviewForm({
        candidateName: "",
        candidateEmail: "",
        position: "",
        date: "",
        time: "",
        duration: "60",
        mode: "online",
        notes: "",
        meetingLink: "",
      });
      setEditingInterview(null);
    }
    setIsModalOpen(true);
  };

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch =
      interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      interview.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "Completed":
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "Accepted":
      case "accepted":
        return "bg-green-100 text-green-800";
      case "Rejected":
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
                    {["zoom", "google meet"].includes(interview.mode.toLowerCase()) && (
                      <Video className="h-4 w-4 mr-2 text-blue-500" />
                    )}
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
                  Try adjusting your search criteria or schedule a new interview.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Dialog Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingInterview ? "Edit Interview" : "Schedule New Interview"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
                <div>
                  <Label htmlFor="candidateName">Candidate Name *</Label>
                  <Input
                    id="candidateName"
                    value={interviewForm.candidateName}
                    onChange={(e) =>
                      setInterviewForm({ ...interviewForm, candidateName: e.target.value })
                    }
                  />
                  {formErrors.name && (
                    <p className="text-red-600 text-xs mt-1">
                      {formErrors.name.join(" ")}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="candidateEmail">Candidate Email</Label>
                  <Input
                    id="candidateEmail"
                    type="email"
                    value={interviewForm.candidateEmail}
                    onChange={(e) =>
                      setInterviewForm({ ...interviewForm, candidateEmail: e.target.value })
                    }
                  />
                  {formErrors.email && (
                    <p className="text-red-600 text-xs mt-1">
                      {formErrors.email.join(" ")}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={interviewForm.position}
                    onChange={(e) =>
                      setInterviewForm({ ...interviewForm, position: e.target.value })
                    }
                  />
                  {formErrors.position && (
                    <p className="text-red-600 text-xs mt-1">
                      {formErrors.position.join(" ")}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={interviewForm.date}
                      onChange={(e) =>
                        setInterviewForm({ ...interviewForm, date: e.target.value })
                      }
                    />
                    {formErrors.date && (
                      <p className="text-red-600 text-xs mt-1">
                        {formErrors.date.join(" ")}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={interviewForm.time}
                      onChange={(e) =>
                        setInterviewForm({ ...interviewForm, time: e.target.value })
                      }
                    />
                    {formErrors.time && (
                      <p className="text-red-600 text-xs mt-1">
                        {formErrors.time.join(" ")}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (min)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={interviewForm.duration}
                      onChange={(e) =>
                        setInterviewForm({ ...interviewForm, duration: e.target.value })
                      }
                    />
                    {formErrors.duration_minutes && (
                      <p className="text-red-600 text-xs mt-1">
                        {formErrors.duration_minutes.join(" ")}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="mode">Interview Mode</Label>
                  <select
                    id="mode"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={interviewForm.mode}
                    onChange={(e) =>
                      setInterviewForm({ ...interviewForm, mode: e.target.value })
                    }
                  >
                    {interviewModes.map((mode) => (
                      <option key={mode.value} value={mode.value}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.interview_mode && (
                    <p className="text-red-600 text-xs mt-1">
                      {formErrors.interview_mode.join(" ")}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="meetingLink">Meeting Link</Label>
                  <Input
                    id="meetingLink"
                    value={interviewForm.meetingLink}
                    onChange={(e) =>
                      setInterviewForm({ ...interviewForm, meetingLink: e.target.value })
                    }
                    placeholder="https://meet.google.com/..."
                  />
                  {formErrors.meeting_link && (
                    <p className="text-red-600 text-xs mt-1">
                      {formErrors.meeting_link.join(" ")}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    className="w-full h-20 px-3 py-2 rounded-md border border-input bg-background resize-none"
                    value={interviewForm.notes}
                    onChange={(e) =>
                      setInterviewForm({ ...interviewForm, notes: e.target.value })
                    }
                    placeholder="Interview notes or preparation details..."
                  />
                  {formErrors.notes && (
                    <p className="text-red-600 text-xs mt-1">
                      {formErrors.notes.join(" ")}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveInterview}>
                  {editingInterview ? "Update Interview" : "Schedule Interview"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Modal */}
          <AlertDialog
            open={!!interviewToDelete}
            onOpenChange={() => setInterviewToDelete(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Interview</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this interview? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteInterview}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Interview;
