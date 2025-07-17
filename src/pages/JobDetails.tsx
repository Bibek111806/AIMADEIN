import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Send,
  Share2,
  X,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/authContext";

const JobDetails = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);

  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [uploadedResumes, setUploadedResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [localResume, setLocalResume] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}/`);
        setJob(res.data);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load job details",
          variant: "destructive",
        });
      }
    };

    const fetchResumes = async () => {
      try {
        const res = await api.get(`accounts/files/?type=resume`);
        setUploadedResumes(res.data);
      } catch {
        toast({ title: "Failed to load resumes", variant: "destructive" });
      }
    };

    if (id) fetchJob();
    if (user?.role === "individual") fetchResumes();
  }, [id]);

  const openResumeModal = () => setResumeModalOpen(true);
  const closeResumeModal = () => {
    setResumeModalOpen(false);
    setLocalResume(null);
    setSelectedResumeId(null);
  };

  const confirmApply = async () => {
    const formData = new FormData();

    if (localResume) {
      formData.append("resume_file", localResume);
    } else if (selectedResumeId) {
      formData.append("resume", selectedResumeId);
    } else {
      toast({ title: "Please select or upload a resume", variant: "destructive" });
      return;
    }

    try {
      setUploading(true);
      await api.post(`/jobs/${job.id}/apply/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast({ title: "Successfully applied to this job." });
      setJob((prev) => ({ ...prev, applied: true }));
      setUploading(false);
      closeResumeModal();
    } catch {
      toast({ title: "Apply failed", variant: "destructive" });
      setUploading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      await api.post(`/jobs/${job.id}/withdraw/`);
      toast({ title: "Withdrawn from job." });
      setJob((prev) => ({ ...prev, applied: false }));
    } catch {
      toast({ title: "Withdraw failed", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    try {
      const res = await api.post(`/jobs/${job.id}/save/`);
      const newSaved = res.data.is_saved;
      toast({
        title: newSaved ? "Job saved." : "Job removed from saved list.",
      });
      setJob((prev) => ({ ...prev, saved: newSaved }));
    } catch {
      toast({
        title: "Save job failed",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/jobs/${job.id}`);
    toast({ title: "Job link copied to clipboard." });
  };

  if (!job) return <DashboardLayout>Loading...</DashboardLayout>;

  const showSalary = job.category === "job" || job.category === "project";
  const showPerks = job.category === "job" && !["freelance", "temporary"].includes(job.job_type);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate("/jobs")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-3">{job.title || "N/A"}</CardTitle>
                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-1" />
                    {job.organization_details?.company_name || "N/A"}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location || "N/A"}
                  </div>
                  {showSalary && (
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {job.salary_min || "N/A"} - {job.salary_max || "N/A"}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {job.time_ago || "N/A"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{job.job_type || "N/A"}</Badge>
                  <Badge variant="secondary">{job.category || "N/A"}</Badge>
                </div>
              </div>
              <div className="flex">
                {user?.role === "individual" && (
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {user?.role === "individual" && (
              <div className="flex gap-3 flex-wrap">
                {!job.applied && !job.interviewed && (
                  <Button size="lg" onClick={openResumeModal}>
                    <Send className="h-4 w-4 mr-2" />
                    Apply Now
                  </Button>
                )}

                {job.applied && !job.interviewed && (
                  <Button size="lg" variant="destructive" onClick={handleWithdraw}>
                    <X className="h-4 w-4 mr-2" />
                    Withdraw
                  </Button>
                )}

                <Button variant="outline" size="lg" onClick={handleSave}>
                  {job.saved ? "Unsave Job" : "Save Job"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resume Modal */}
        {resumeModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
              <h2 className="text-xl font-bold mb-4">Choose Resume</h2>

              <div className="space-y-3 mb-4">
                {uploadedResumes.map((res) => (
                  <div key={res.id} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="resume"
                      value={res.id}
                      checked={selectedResumeId === res.id}
                      onChange={() => {
                        setSelectedResumeId(res.id);
                        setLocalResume(null);
                      }}
                    />
                    <span>
                      {res.file.split("/").pop().replace(/^\d+_\d+_/, "")}
                    </span>
                  </div>
                ))}

                <div>
                  <label className="block font-medium mb-1">Upload Resume</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLocalResume(file);
                        setSelectedResumeId(null);
                      }
                    }}
                  />
                  {localResume && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected File: <strong>{localResume.name}</strong>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeResumeModal}>Cancel</Button>
                <Button onClick={confirmApply} disabled={(!selectedResumeId && !localResume) || uploading}>
                  {uploading ? "Applying..." : "Submit"}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {job.description || "N/A"}
                </p>
              </CardContent>
            </Card>

            {job.requirements?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.requirements.map((req: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {job.responsibilities?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.responsibilities.map((resp: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {resp}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {job.skills_required?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required.map((skill: string) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium">Company Name:</span>
                  <p className="text-gray-600">{job.organization_details?.company_name || "N/A"}</p>
                </div>
                <div>
                  <span className="font-medium">Founded:</span>
                  <p className="text-gray-600">{job.organization_details?.organization_profile?.founding_year || "N/A"}</p>
                </div>
                <div>
                  <span className="font-medium">Industry:</span>
                  <p className="text-gray-600">{job.organization_details?.organization_profile?.industry_type || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            {showPerks && job.perks?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits & Perks</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.perks.map((perk: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {perk}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobDetails;
