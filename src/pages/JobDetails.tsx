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
    if (id) fetchJob();
  }, [id]);

  const handleApply = async () => {
    try {
      await api.post(`/jobs/${job.id}/apply/`);
      toast({ title: "Successfully applied to this job." });
      setJob((prev) => ({ ...prev, applied: true }));
    } catch {
      toast({ title: "Apply failed", variant: "destructive" });
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
      await api.post(`/jobs/${job.id}/save/`);
      const newSaved = !job.saved;
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
  const showPerks =
    job.category === "job" &&
    !["freelance", "temporary"].includes(job.job_type);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="outline"
          onClick={() => navigate("/jobs")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-3">{job.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-1" />
                    {job.organization_details.company_name}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </div>
                  {showSalary && (
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {job.salary_min} - {job.salary_max}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {job.time_ago}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{job.job_type}</Badge>
                  <Badge variant="secondary">{job.category}</Badge>
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
                {!job.applied ? (
                  <Button size="lg" onClick={handleApply}>
                    <Send className="h-4 w-4 mr-2" />
                    Apply Now
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={handleWithdraw}
                  >
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {job.description}
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
                      <li
                        key={index}
                        className="flex items-start"
                      >
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
                    {job.responsibilities.map(
                      (resp: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-start"
                        >
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {resp}
                        </li>
                      )
                    )}
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
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
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
                  <p className="text-gray-600">
                    {job.organization_details.company_name}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Founded:</span>
                  <p className="text-gray-600">
                    {
                      job.organization_details.organization_profile
                        .founding_year
                    }
                  </p>
                </div>
                <div>
                  <span className="font-medium">Industry:</span>
                  <p className="text-gray-600">
                    {
                      job.organization_details.organization_profile
                        .industry_type
                    }
                  </p>
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
                      <li
                        key={index}
                        className="flex items-start"
                      >
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
