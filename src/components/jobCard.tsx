import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Heart,
  Eye,
  Send,
  Clock,
  MapPin,
  Building2,
  DollarSign,
  Bookmark,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function JobCard({ job }) {
  const navigate = useNavigate();
  const getStatusColor = (status: string) => {
    switch (status) {
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

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow h-full flex flex-col justify-between">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{job.title}</CardTitle>
            <div className="flex flex-wrap items-center text-gray-600 text-sm gap-2 mb-2">
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-1" />
                {job.company}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {job.location}
              </div>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                {job.salary}
              </div>
            </div>
            <div className="flex flex-wrap items-center text-sm text-gray-500 gap-2">
              <Clock className="h-4 w-4 mr-1" />
              <span>{job.posted}</span>
              <Badge variant="outline" className="ml-2">{job.type}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm">
              <Bookmark className="h-4 w-4" />
            </Button>

            <Badge className={`${getStatusColor(job.status)} text-xs px-2 py-0.5 rounded-full`}>
              {job.status === "not-applied" ? "New" : job.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">{job.description}</CardDescription>
        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.map((skill: string) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate(`/jobs/${job.id}`)}>
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
            {job.status === "not-applied" && (
              <Button size="sm">
                <Send className="h-4 w-4 mr-1" />
                Easy Apply
              </Button>
            )}
            {job.status === "applied" && (
              <Button size="sm" variant="destructive">
                <X className="h-4 w-4 mr-1" />
                Withdraw
              </Button>
            )}
          </div>
          <Button size="sm" variant="ghost">
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default JobCard;
