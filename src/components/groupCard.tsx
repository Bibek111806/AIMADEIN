import {
  Users,
  MessageCircle,
  UserPlus,
  Star,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
function GroupCard({ group }) {
  const navigate = useNavigate();
  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold mr-3">{group.name}</h3>
              <Badge variant="outline">{group.type}</Badge>
              {group.isMember && <Badge className="ml-2">Member</Badge>}
            </div>
            <p className="text-gray-600 mb-3">{group.description}</p>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              <span className="mr-4">{group.members} members</span>
              <Star className="h-4 w-4 mr-1" />
              <span className="mr-4">Moderator: {group.moderator}</span>
              <span>Last activity: {group.lastActivity}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {group.isMember ? (
              <>
                <Button size="sm" onClick={()=>navigate('/chats/'+group.id)}>
                  <MessageCircle className="h-4 w-4 mr-1"  />
                  Enter Group
                </Button>
                <Button size="sm" variant="outline">
                  Leave
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline">
                <UserPlus className="h-4 w-4 mr-1" />
                Join Group
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export default GroupCard;
