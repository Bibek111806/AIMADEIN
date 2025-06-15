
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 

} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import VolunteeringCard from '@/components/volunteeringCard';
const Volunteering = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  const mockVolunteering = [
    {
      id: 1,
      title: 'AI for Good - Education Initiative',
      organization: 'TechForGood Foundation',
      location: 'Remote',
      commitment: '5 hours/week',
      duration: '6 months',
      posted: '2 days ago',
      description: 'Help develop AI tools for educational purposes in underserved communities...',
      skills: ['Python', 'Machine Learning', 'Education'],
      status: 'not-applied',
      cause: 'Education'
    },
    {
      id: 2,
      title: 'Data Science for Climate Research',
      organization: 'Climate Change Institute',
      location: 'Regina,  SK',
      commitment: '10 hours/week',
      duration: '1 year',
      posted: '5 days ago',
      description: 'Analyze climate data to support research initiatives...',
      skills: ['Data Science', 'Python', 'Climate Research'],
      status: 'saved',
      cause: 'Environment'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Volunteering</h1>
            <p className="text-gray-600 mt-1">Make a difference with your AI and tech skills</p>
          </div>
          <Button>Post Volunteer Opportunity</Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search volunteer opportunities..." className="pl-10" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All Opportunities</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="applied">Applied</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="viewed">Viewed</TabsTrigger>
            <TabsTrigger value="hidden">Hidden</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              {mockVolunteering.map((opportunity) => (
                <VolunteeringCard key={opportunity.id} opportunity={opportunity}/>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Volunteering;
