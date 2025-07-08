import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const GroupJoinRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      const res = await api.get(`/moderator/pending-requests/`);
      const data = res.data;
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Error",
        description: "Could not fetch group join requests.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (
    requestId: number,
    userName: string,
    action: "approve" | "reject"
  ) => {
    try {
      await api.post(`/memberships/${requestId}/action/`, {
        action,
      });

      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, status: action === "approve" ? "approved" : "rejected" }
            : req
        )
      );

      toast({
        title: action === "approve" ? "Request Approved" : "Request Rejected",
        description:
          action === "approve"
            ? `${userName} has been added to the group.`
            : `${userName}'s join request has been rejected.`,
        variant: action === "approve" ? "default" : "destructive",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: `Failed to ${action} request.`,
        variant: "destructive",
      });
    }
  };

  const pendingRequests = requests.filter(
    (req) => req.status === "pending"
  );

  if (pendingRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Group Join Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            No pending join requests
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Group Join Requests
          <Badge variant="secondary" className="ml-2">
            {pendingRequests.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingRequests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={request.user?.profile_picture || undefined}
                />
                <AvatarFallback>
                  {(request.user?.full_name || "User")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">
                  {request.user?.full_name || "Unknown User"}
                </h4>
                <p className="text-sm text-gray-500">
                  {request.user?.professional_title || "No title"}
                </p>
                <p className="text-xs text-gray-400">
                  Wants to join{" "}
                  <span className="font-medium">
                    {request.group?.name || "Unknown Group"}
                  </span>{" "}
                  •{" "}
                  {new Date(request.joined_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={() =>
                  handleAction(request.id, request.user?.full_name, "approve")
                }
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() =>
                  handleAction(request.id, request.user?.full_name, "reject")
                }
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default GroupJoinRequests;
