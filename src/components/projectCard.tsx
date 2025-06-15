import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderOpen,
  Eye,
  Clock,
  Users,
  Building2,
  Star,
  Bookmark,
  GitBranch,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ProjectCard({ project }) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "Advanced":
        return "bg-orange-100 text-orange-800";
      case "Expert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  return (
    <Card key={project.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 flex items-center">
              <FolderOpen className="h-5 w-5 mr-2" />
              {project.title}
            </CardTitle>
            <div className="flex items-center text-gray-600 mb-2">
              <Building2 className="h-4 w-4 mr-1" />
              <span className="mr-4">{project.organization}</span>
              <Users className="h-4 w-4 mr-1" />
              <span className="mr-4">{project.contributors} contributors</span>
              <Clock className="h-4 w-4 mr-1" />
              <span>{project.duration}</span>
            </div>
            <p className="text-sm text-gray-500">{project.posted}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Badge variant="outline">{project.type}</Badge>
            <Badge className={getDifficultyColor(project.difficulty)}>
              {project.difficulty}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">
          {project.description}
        </CardDescription>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.skills.map((skill: string) => (
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
            {project.status === "not-applied" && (
              <Button size="sm">
                <GitBranch className="h-4 w-4 mr-1" />
                Join Project
              </Button>
            )}
            {project.status === "applied" && (
              <Button size="sm" variant="secondary">
                <Star className="h-4 w-4 mr-1" />
                Application Sent
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
export default ProjectCard;
