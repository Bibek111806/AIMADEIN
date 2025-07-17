import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bookmark,
  Building2,
  Clock,
  DollarSign,
  Eye,
  MapPin,
  Send,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

function JobCard({ job, onUpdate }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      api.get("accounts/files/?type=resume").then((res) => {
        setResumes(res.data);
      });
    }
  }, [open]);

  const isInternshipOrVolunteering = ["internship", "volunteering"].includes(
    job.category?.toLowerCase()
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "applied":
        return "bg-blue-100 text-blue-800";
      case "saved":
        return "bg-yellow-100 text-yellow-800";
      case "interview":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPrimaryStatus = (job) => {
    if (job.interviewed) return "Interview";
    if (job.applied) return "Applied";
    if (job.saved) return "Saved";
    return "New";
  };

  const handleApply = async () => {
    try {
      let resumeId = selectedResume;

      if (uploadedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("file_type", "resume");

        const res = await api.post("accounts/files/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        resumeId = res.data.id;
        setUploading(false);
      }

      if (!resumeId) {
        toast({
          title: "Select or upload a resume",
          variant: "destructive",
        });
        return;
      }

      await api.post(`/jobs/${job.id}/apply/`, {
        resume: resumeId,
      });

      toast({ title: "Applied successfully!" });
      onUpdate?.(job.id, { applied: true });
      setOpen(false);
      setSelectedResume(null);
      setUploadedFile(null);
    } catch {
      toast({ title: "Apply failed", variant: "destructive" });
      setUploading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      await api.post(`/jobs/${job.id}/withdraw/`);
      toast({ title: "Withdrawn successfully." });
      onUpdate?.(job.id, { applied: false });
    } catch {
      toast({ title: "Withdraw failed", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    try {
      const res = await api.post(`/jobs/${job.id}/save/`);
      const newSavedState = res.data.is_saved;

      toast({
        title: newSavedState ? "Saved to your list." : "Removed from saved.",
      });

      onUpdate?.(job.id, { saved: newSavedState });
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/jobs/${job.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Job link copied to clipboard." });
  };

  return (
    <>
      <Card className="mb-4 hover:shadow-md transition-shadow h-full flex flex-col justify-between">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{job.title}</CardTitle>
              <div className="flex flex-wrap items-center text-gray-600 text-sm gap-2 mb-2">
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-1" />
                  {job.organization_details.company_name}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.location}
                </div>
                {!isInternshipOrVolunteering && (
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {job.salary_min} - {job.salary_max}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center text-sm text-gray-500 gap-2">
                <Clock className="h-4 w-4 mr-1" />
                <span>{job.time_ago}</span>
                <Badge variant="outline" className="ml-2">
                  {job.job_type}
                </Badge>
                <Badge variant="outline" className="ml-2">
                  {job.category}
                </Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={job.saved ? "destructive" : "outline"}
                size="sm"
                onClick={handleSave}
              >
                <Bookmark className="h-4 w-4 mr-1" />
                {job.saved ? "Unsave" : "Save"}
              </Button>
              <Badge
                className={`${getStatusColor(
                  getPrimaryStatus(job)
                )} text-xs px-2 py-0.5 rounded-full`}
              >
                {getPrimaryStatus(job)}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <CardDescription className="mb-4">{job.description}</CardDescription>

          {job.skills_required?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills_required.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>

              {!job.applied && !job.interviewed && (
                <Button size="sm" onClick={() => setOpen(true)}>
                  <Send className="h-4 w-4 mr-1" />
                  Easy Apply
                </Button>
              )}

              {job.applied && !job.interviewed && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleWithdraw}
                >
                  <X className="h-4 w-4 mr-1" />
                  Withdraw
                </Button>
              )}
            </div>

            <Button size="sm" variant="ghost" onClick={handleShare}>
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resume Selection Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Resume</DialogTitle>
          </DialogHeader>

          {resumes.length === 0 ? (
            <p className="text-sm text-gray-500">
              No resumes uploaded. Please upload one to apply.
            </p>
          ) : (
            <RadioGroup
              value={selectedResume}
              onValueChange={setSelectedResume}
              className="space-y-2"
            >
              {resumes.map((resume) => (
                <div key={resume.id} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={resume.id.toString()}
                    id={`resume-${resume.id}`}
                  />
                  <Label htmlFor={`resume-${resume.id}`} className="text-sm">
                    {resume.file.split("/").pop().replace(/^\d+_\d+_/, "")}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          <div className="text-sm text-gray-500 mt-4 mb-2">
            or upload a new resume
          </div>

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setUploadedFile(file);
                setSelectedResume(null);
              }
            }}
          />

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={(!selectedResume && !uploadedFile) || uploading}
            >
              {uploading ? "Applying..." : "Apply Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default JobCard;
