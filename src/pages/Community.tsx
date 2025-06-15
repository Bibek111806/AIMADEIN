
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,

} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Calendar
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import MemberCard from '@/components/memberCard';
import GroupCard from '@/components/groupCard';

const Community = () => {
  const [activeTab, setActiveTab] = useState('members');
  const [searchTerm, setSearchTerm] = useState('');

  const mockMembers = [
    {
      id: 1,
      name: 'Alice Johnson',
      title: 'ML Engineer',
      company: 'TechCorp',
      location: 'Hamilton, ON',
      skills: ['Python', 'TensorFlow', 'Computer Vision'],
      connections: 145,
      isConnection: false,
      isFollowing: true,
      avatar: null
    },
    {
      id: 2,
      name: 'Bob Chen',
      title: 'AI Research Scientist',
      company: 'DataFlow',
      location: 'Remote',
      skills: ['Deep Learning', 'NLP', 'PyTorch'],
      connections: 289,
      isConnection: true,
      isFollowing: false,
      avatar: null
    },
    {
      id: 3,
      name: 'Carol Davis',
      title: 'Product Manager',
      company: 'StartupAI',
      location: 'Sydney, NS',
      skills: ['Product Strategy', 'AI Ethics', 'UX'],
      connections: 67,
      isConnection: false,
      isFollowing: false,
      avatar: null
    }
  ];

  const mockGroups = [
    {
      id: 1,
      name: 'AI Ethics Discussion',
      description: 'Discussing ethical implications of AI technology',
      members: 234,
      moderator: 'Dr. Sarah Wilson',
      type: 'Public',
      lastActivity: '2 hours ago',
      isMember: true
    },
    {
      id: 2,
      name: 'Machine Learning Beginners',
      description: 'Learning group for ML newcomers',
      members: 567,
      moderator: 'Michael Chang',
      type: 'Public',
      lastActivity: '30 minutes ago',
      isMember: false
    },
    {
      id: 3,
      name: 'SF Bay Area AI Professionals',
      description: 'Local networking and meetups',
      members: 89,
      moderator: 'Lisa Park',
      type: 'Location-based',
      lastActivity: '1 day ago',
      isMember: true
    }
  ];
;

 

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community</h1>
            <p className="text-gray-600 mt-1">Connect with AI professionals and join groups</p>
          </div>
          <div className="flex ">

            <Button>Create Group</Button>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search members, groups, discussions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Community Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="members">Members Directory</TabsTrigger>
            <TabsTrigger value="groups">Groups Directory</TabsTrigger>
            <TabsTrigger value="connections">My Connections</TabsTrigger>
            <TabsTrigger value="posts">Community Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="mt-6">
            <div className="space-y-4">
              {mockMembers.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="groups" className="mt-6">
            <div className="space-y-4">
              {mockGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="connections" className="mt-6">
            <div className="space-y-4">
              {mockMembers.filter(m => m.isConnection).map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="posts" className="mt-6">
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">Community Posts</h3>
                <p className="text-gray-600 mb-4">Share insights and engage with the community</p>
                <Button>Create Post</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Community;
