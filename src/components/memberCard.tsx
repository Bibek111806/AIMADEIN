import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Users,
  MessageCircle,
  UserPlus,
  Eye,
  MapPin,
  Briefcase,
} from "lucide-react";
function MemberCard({ member }) {
  const navigate = useNavigate();
  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={member.avatar} />
            <AvatarFallback>
              {member.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-gray-600">{member.title}</p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Briefcase className="h-4 w-4 mr-1" />
                  <span className="mr-3">{member.company}</span>
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{member.location}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {member.isConnection ? (
                  <Badge variant="default">Connected</Badge>
                ) : (
                  <Button size="sm" variant="outline">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Connect
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={member.isFollowing ? "default" : "outline"}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {member.isFollowing ? "Following" : "Follow"}
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {member.skills.map((skill: string) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                <Users className="h-4 w-4 inline mr-1" />
                {member.connections} connections
              </p>
              <div className="flex space-x-2">
                <Button size="sm" variant="ghost"  onClick={()=>navigate('/chats/'+member.id)}>
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </Button>
                
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export default MemberCard;
