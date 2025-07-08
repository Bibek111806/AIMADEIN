import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Users,
  MessageCircle,
  UserPlus,
  MapPin,
  Star,
  ThumbsUp,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CreateGroupModal from "@/components/CreateGroupModal";
import CreatePostModal from "@/components/CreatePostModal";
import EditPostModal from "@/components/EditPostModal";
import GroupJoinRequests from "@/components/GroupJoinRequests";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useAuth } from "@/context/authContext";

const getCategoryColor = (category) => {
  switch (category?.toLowerCase()) {
    case "question":
      return "bg-blue-100 text-blue-800";
    case "project showcase":
      return "bg-green-100 text-green-800";
    case "discussion":
      return "bg-purple-100 text-purple-800";
    case "job opportunity":
      return "bg-orange-100 text-orange-800";
    case "news":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("members");
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState([]);
  const [memberCount, setMemberCount] = useState(0);
  const [memberPage, setMemberPage] = useState(1);
  const [groups, setGroups] = useState([]);
  const [groupCount, setGroupCount] = useState(0);
  const [groupPage, setGroupPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [postCount, setPostCount] = useState(0);
  const [postPage, setPostPage] = useState(1);
  const [connections, setConnections] = useState([]);
  const [editPostId, setEditPostId] = useState<number | null>(null);

  const pageSize = 10;

  const fetchMembers = async (search = "", page = 1) => {
    try {
      const res = await api.get(
        `/members/?page=${page}&page_size=${pageSize}&search=${search}`
      );
      setMembers(res.data?.results || []);
      setMemberCount(res.data?.count || 0);
    } catch {
      setMembers([]);
    }
  };

  const fetchGroups = async (search = "", page = 1) => {
    try {
      const res = await api.get(
        `/groups/?page=${page}&page_size=${pageSize}&search=${search}`
      );
      setGroups(res.data?.results || []);
      setGroupCount(res.data?.count || 0);
    } catch {
      setGroups([]);
    }
  };

  const fetchPosts = async (search = "", page = 1) => {
    try {
      const res = await api.get(
        `/community-posts/?page=${page}&page_size=${pageSize}&search=${search}`
      );
      setPosts(res.data?.results || []);
      setPostCount(res.data?.count || 0);
    } catch {
      setPosts([]);
    }
  };

  const fetchConnections = async () => {
    try {
      const res = await api.get(`/connections/`);
      setConnections(res.data || []);
    } catch {
      setConnections([]);
    }
  };

  useEffect(() => {
    if (activeTab === "members") fetchMembers(searchTerm, memberPage);
    if (activeTab === "groups") fetchGroups(searchTerm, groupPage);
    if (activeTab === "posts") fetchPosts(searchTerm, postPage);
    if (activeTab === "connections") fetchConnections();
  }, [activeTab, memberPage, groupPage, postPage, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setMemberPage(1);
    setGroupPage(1);
    setPostPage(1);
  };

  const handleSendConnection = async (memberId) => {
    try {
      await api.post("/connections/", { receiver: memberId });
      toast({ title: "Connection request sent" });
      fetchMembers(searchTerm, memberPage);
    } catch {
      toast({ title: "Error sending request", variant: "destructive" });
    }
  };

  const handleUpdateConnection = async (id, status) => {
    try {
      await api.patch(`/connections/${id}/`, { status });
      toast({ title: `Connection ${status}` });
      fetchMembers(searchTerm, memberPage);
      fetchConnections();
    } catch {
      toast({ title: "Error updating connection", variant: "destructive" });
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await api.post(`/groups/${groupId}/join/`);
      toast({ title: "Joined group" });
      fetchGroups(searchTerm, groupPage);
    } catch {
      toast({ title: "Error joining group", variant: "destructive" });
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      await api.post(`/groups/${groupId}/leave/`);
      toast({ title: "Left group" });
      fetchGroups(searchTerm, groupPage);
    } catch {
      toast({ title: "Error leaving group", variant: "destructive" });
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      await api.post(`/community-posts/${postId}/like/`);
      fetchPosts(searchTerm, postPage);
    } catch {
      toast({ title: "Error liking post", variant: "destructive" });
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/community-posts/${postId}/`);
      toast({ title: "Post deleted" });
      fetchPosts(searchTerm, postPage);
    } catch {
      toast({ title: "Error deleting post", variant: "destructive" });
    }
  };

  const MemberActions = ({ member }) => {
    const status = member.connection_status;
    const senderId = member.connection_sender_id;
    const receiverId = member.connection_receiver_id;
    const connectionId = member.connection_id;

    if (status === "accepted") {
      return <Badge variant="default">Connected</Badge>;
    }
    if (status === "pending") {
      if (receiverId === user.id) {
        return (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUpdateConnection(connectionId, "accepted")}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleUpdateConnection(connectionId, "rejected")}
            >
              Reject
            </Button>
          </>
        );
      }
      if (senderId === user.id) {
        return <Badge variant="outline">Request Sent</Badge>;
      }
    }
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleSendConnection(member.id)}
      >
        <UserPlus className="h-4 w-4 mr-1" />
        Connect
      </Button>
    );
  };

  const MemberCard = ({ member }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar
            className="h-16 w-16 cursor-pointer"
            onClick={() => navigate(`/user/${member.id}`)}
          >
            <AvatarImage src={member.profile_picture} />
            <AvatarFallback>
              {(member.full_name || member.email || "")
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3
                  className="text-lg font-semibold cursor-pointer hover:text-blue-600"
                  onClick={() => navigate(`/user/${member.id}`)}
                >
                  {member.full_name || member.email}
                </h3>
                <p className="text-gray-600">
                  {member.professional_title || "N/A"}
                </p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{member.address || "N/A"}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <MemberActions member={member} />
              </div>
            </div>
            {member.role === "individual" && (
              <div className="flex flex-wrap gap-2 mb-3">
                {(member.skills || []).map((skill) => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                <Users className="h-4 w-4 inline mr-1" />
                {member.total_connections} connections
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate(`/chats/private/${member.id}`)}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const GroupCard = ({ group }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex space-x-4">
          <Avatar className="h-16 w-16 cursor-pointer">
            <AvatarImage src={group.image} />
            <AvatarFallback>
              {(group.name || "")
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold mr-3">{group.name}</h3>
                  <Badge variant="outline">{group.type}</Badge>
                  {group.is_member && (
                    <Badge className="ml-2">Member</Badge>
                  )}
                  {!group.is_member && group.has_pending_request && (
                    <Badge className="ml-2" variant="secondary">
                      Request Pending
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 mb-3">
                  {group.description}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  <span className="mr-4">
                    {group.members_count} members
                  </span>
                  <Star className="h-4 w-4 mr-1" />
                  <span className="mr-4">
                    Moderator: {group.moderator?.full_name}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {group.is_member ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => navigate('/chats/group/' + group.id)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Enter Group
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLeaveGroup(group.id)}
                    >
                      Leave
                    </Button>
                  </>
                ) : group.has_pending_request ? (
                  <Button size="sm" variant="outline" disabled>
                    Request Pending
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleJoinGroup(group.id)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Join Group
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PostCard = ({ post }) => {
    const author = post.author || {};
    const images = post.images || [];

    const initials = author.full_name
      ? author.full_name
          .split(" ")
          .map((n) => n[0])
          .join("")
      : author.email?.[0] || "?";

    return (
      <Card key={post.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={author.profile_picture} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="font-semibold">
                  {author.full_name || author.email}
                </h4>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">
                  {author.professional_title || "N/A"}
                </span>
                <span className="text-sm text-gray-500">•</span>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{new Date(post.created_at).toLocaleString()}</span>
                </div>
              </div>
              <div className="mb-3">
                <Badge
                  className={getCategoryColor(post.category)}
                  variant="secondary"
                >
                  {post.category?.toUpperCase()}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
              <p className="text-gray-700 mb-4">{post.content}</p>
              {images.length > 0 && (
                <div className="mb-4">
                  {images.length === 1 ? (
                    <img
                      src={images[0].image}
                      alt="Post attachment"
                      className="w-full max-w-md h-48 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-w-lg">
                      {images.map((img, i) => (
                        <img
                          key={i}
                          src={img.image}
                          alt={`Post ${i + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleLike(post.id)}
                  className={
                    post.is_liked_by_me ? "text-blue-600" : "text-gray-500"
                  }
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {post.likes_count}
                </Button>
                {author.id === user?.id && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditPostId(post.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community</h1>
            <p className="text-gray-600 mt-1">
              Connect with AI professionals and join groups
            </p>
          </div>
          <CreateGroupModal onGroupCreated={() => fetchGroups(searchTerm, groupPage)}>
            <Button>Create Group</Button>
          </CreateGroupModal>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search members, groups, discussions..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="connections">My Connections</TabsTrigger>
            <TabsTrigger value="posts">Community Posts</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="mt-6">
            <div className="space-y-4">
              {members.map((m) => (
                <MemberCard key={m.id} member={m} />
              ))}
            </div>
            <PaginationComponent
              page={memberPage}
              total={Math.ceil(memberCount / pageSize)}
              setPage={setMemberPage}
            />
          </TabsContent>

          <TabsContent value="groups" className="mt-6">
            <div className="space-y-4">
              {groups.map((g) => (
                <GroupCard key={g.id} group={g} />
              ))}
            </div>
            <PaginationComponent
              page={groupPage}
              total={Math.ceil(groupCount / pageSize)}
              setPage={setGroupPage}
            />
          </TabsContent>

          <TabsContent value="connections" className="mt-6">
            <div className="space-y-4">
              {connections.map((conn) => {
                const userDetails = conn.details;
                if (!userDetails) return null;
                const memberWithConnection = {
                  ...userDetails,
                  connection_status: conn.status,
                  connection_sender_id: conn.sender,
                  connection_receiver_id: conn.receiver,
                  connection_id: conn.id,
                };
                return (
                  <MemberCard key={conn.id} member={memberWithConnection} />
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="posts" className="mt-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">Community Posts</h3>
              <CreatePostModal onPostCreated={() => fetchPosts(searchTerm, postPage)}>
                <Button>Create Post</Button>
              </CreatePostModal>
            </div>
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <PaginationComponent
              page={postPage}
              total={Math.ceil(postCount / pageSize)}
              setPage={setPostPage}
            />
          </TabsContent>

          <TabsContent value="moderation" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Moderation Dashboard
                </h3>
                <p className="text-gray-600">
                  Manage group join requests and moderate content
                </p>
              </div>
              <GroupJoinRequests />
            </div>
          </TabsContent>
        </Tabs>
        <EditPostModal
          open={!!editPostId}
          postId={editPostId}
          onClose={() => setEditPostId(null)}
          onPostUpdated={() => fetchPosts(searchTerm, postPage)}
        />
      </div>
    </DashboardLayout>
  );
};

// Generic pagination component
const PaginationComponent = ({ page, total, setPage }) => {
  if (total <= 1) return null;
  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPage(Math.max(page - 1, 1));
            }}
          />
        </PaginationItem>
        {[...Array(total)].map((_, i) => (
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={page === i + 1}
              onClick={(e) => {
                e.preventDefault();
                setPage(i + 1);
              }}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPage(Math.min(page + 1, total));
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default Community;
