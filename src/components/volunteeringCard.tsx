import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Eye,
  Send,
  MapPin,
  Building2,
  Users,
  Bookmark,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function VolunteeringCard({ opportunity }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-500" />
              {opportunity.title}
            </CardTitle>
            <div className="flex items-center text-gray-600 mb-2">
              <Building2 className="h-4 w-4 mr-1" />
              <span className="mr-4">{opportunity.organization}</span>
              <MapPin className="h-4 w-4 mr-1" />
              <span className="mr-4">{opportunity.location}</span>
              <Users className="h-4 w-4 mr-1" />
              <span>{opportunity.commitment}</span>
            </div>
            <p className="text-sm text-gray-500">
              Duration: {opportunity.duration} • {opportunity.posted}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Badge variant="outline">{opportunity.cause}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">
          {opportunity.description}
        </CardDescription>
        <div className="flex flex-wrap gap-2 mb-4">
          {opportunity.skills.map((skill: string) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
            <Button size="sm">
              <Send className="h-4 w-4 mr-1" />
              Apply to Volunteer
            </Button>
          </div>
          <Button size="sm" variant="ghost">
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
export default VolunteeringCard;
