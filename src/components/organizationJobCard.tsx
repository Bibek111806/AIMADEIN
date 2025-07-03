import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pencil,
  Trash2,
  Users,
  Clock,
  MapPin,
  Building2,
  DollarSign,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function OrganizationJobCard({
  job,
  onEdit,
  onDelete,
}: {
  job: any;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "expired":
        return "bg-red-100 text-red-800";
      case "active":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const showSalary = job.category === "job";
  const showPerks = !["freelance", "temporary"].includes(job.job_type);
  const showSkills = job.skills_required?.length > 0;

  return (
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
              {showSalary && (
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
            <Badge
              className={`${getStatusColor(
                job.status
              )} text-xs px-2 py-0.5 rounded-full`}
            >
              {job.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <CardDescription className="mb-4">{job.description}</CardDescription>

        {showSkills && (
          <div className="mb-2">
        
            <div className="flex flex-wrap gap-2">
              {job.skills_required.map((skill: string) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

  

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate(`/jobs/${job.id}`)} >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate(`/candidates?job_id=${job.id}`)}>
              <Users className="h-4 w-4 mr-1" />
              {job.applicant_count+' '}
               Candidates
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default OrganizationJobCard;
