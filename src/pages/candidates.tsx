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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, User, FileText, Eye, Filter } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useSearchParams } from "react-router-dom";

const Candidates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams] = useSearchParams();
  const jobParam = searchParams.get("job_id");

  const [selectedJob, setSelectedJob] = useState(
    jobParam ? parseInt(jobParam) : "all"
  );
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Interview form fields
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [interviewMode, setInterviewMode] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [statusValue, setStatusValue] = useState("scheduled");

  const [showResumeModal, setShowResumeModal] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get("/jobs/");
        const jobList = response.data?.results || [];
        setJobs([
          { id: "all", title: "All Jobs" },
          ...jobList.map((job) => ({
            id: job.id,
            title: job.title,
          })),
        ]);
      } catch (error) {
        console.error("Error fetching jobs", error);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        let url = "/candidates/";
        const params = new URLSearchParams();
        if (selectedJob !== "all") {
          params.append("job_id", selectedJob);
        }
        if (searchTerm) {
          params.append("search", searchTerm);
        }
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        const response = await api.get(url);
        setCandidates(response.data || []);
      } catch (error) {
        console.error("Error fetching candidates", error);
      }
    };

    fetchCandidates();
  }, [selectedJob, searchTerm]);

  useEffect(() => {
    if (jobParam) {
      setSelectedJob(parseInt(jobParam));
    }
  }, [jobParam]);

  const getStatusColor = (status) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-800";
      case "interview":
        return "bg-orange-100 text-orange-800";
      case "offered":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleChangeToInterview = (candidate) => {
    setSelectedCandidate(candidate);
    setDate("");
    setTime("");
    setDurationMinutes("");
    setInterviewMode("");
    setMeetingLink("");
    setInterviewNotes("");
    setStatusValue("scheduled");
    setDialogOpen(true);
  };

  const confirmChangeToInterview = async () => {
    if (!selectedCandidate) return;

    setLoading(true);
    try {
      const payload = {
        date,
        time,
        duration_minutes: durationMinutes,
        interview_mode: interviewMode,
        meeting_link: meetingLink,
        notes: interviewNotes,
        status: statusValue,
      };

      const response = await api.patch(
        `/applications/${selectedCandidate.id}/interview/`,
        payload
      );

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === selectedCandidate.id ? response.data : c
        )
      );

      setDialogOpen(false);
    } catch (error) {
      console.error("Error changing status", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (candidate) => {
    if (!candidate) return;

    setLoading(true);
    try {
      const response = await api.patch(
        `/applications/${candidate.id}/reject/`
      );

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidate.id ? response.data : c
        )
      );
    } catch (error) {
      console.error("Error rejecting candidate", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
            <p className="text-gray-600 mt-2">
              Manage applicants for your job postings
            </p>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search candidates by name or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={selectedJob}
                    onChange={(e) =>
                      setSelectedJob(
                        e.target.value === "all"
                          ? "all"
                          : parseInt(e.target.value)
                      )
                    }
                    className="px-3 py-2 border rounded-md bg-white"
                  >
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Candidates List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {candidates.map((candidate) => (
              <Card
                key={candidate.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {candidate.user
                            ? `${candidate.user.first_name || ""} ${candidate.user.middle_name || ""} ${candidate.user.last_name || ""}`
                            : "Unknown User"}
                        </CardTitle>
                        <CardDescription>
                          {candidate.user?.email || "N/A"}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(candidate.status)}>
                      {candidate.status_display || candidate.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Position:</span>
                      <p className="text-gray-600">
                        {candidate.job?.title || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Experience:</span>
                      <p className="text-gray-600">
                        {candidate.job?.experience_required || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Location:</span>
                      <p className="text-gray-600">
                        {candidate.job?.location || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Applied:</span>
                      <p className="text-gray-600">
                        {candidate.applied_at
                          ? new Date(candidate.applied_at).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-sm">Skills:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(candidate.user?.skills || []).length > 0 ? (
                        candidate.user.skills.map((skill) => (
                          <Badge
                            key={skill.id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">
                          No skills listed
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="h-4 w-4 mr-1" />
                      Resume
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (candidate.resume?.file) {
                            window.open(candidate.resume.file, "_blank");
                          } else {
                            alert("This candidate has not uploaded a resume.");
                          }
                        }}
                        disabled={!candidate.resume?.file}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Resume
                      </Button>
                      {candidate.status === "applied" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleChangeToInterview(candidate)}
                          >
                            Change to Interview
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReject(candidate)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {candidates.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No candidates found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or job filter.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Dialog for Change to Interview */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Status to Interview</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Change status of{" "}
                  <strong>
                    {selectedCandidate?.user
                      ? `${selectedCandidate.user.first_name || ""} ${selectedCandidate.user.middle_name || ""} ${selectedCandidate.user.last_name || ""}`
                      : "Unknown User"}
                  </strong>{" "}
                  to{" "}
                  <span className="text-orange-600 font-semibold">
                    Interview
                  </span>
                  .
                </p>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Interview Date
                  </label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Interview Time
                  </label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Interview Mode
                  </label>
                  <select
                    value={interviewMode}
                    onChange={(e) => setInterviewMode(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  >
                    <option value="">Select mode</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="zoom">Zoom</option>
                    <option value="google_meet">Google Meet</option>
                    <option value="phone_call">Phone Call</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Meeting Link
                  </label>
                  <Input
                    type="text"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Interview Notes
                  </label>
                  <textarea
                    value={interviewNotes}
                    onChange={(e) => setInterviewNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmChangeToInterview} disabled={loading}>
                  {loading ? "Updating..." : "Confirm"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Candidates;
