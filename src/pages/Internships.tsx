import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import JobCard from '@/components/jobCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Heart, 
  Eye, 
  Send, 
  Clock, 
  MapPin, 
  Building2,
  GraduationCap,
  Bookmark,
  X
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Internships = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  const mockInternships = [
    {
      id: 1,
      title: 'AI Research Intern',
      company: 'Google Research',
      location: 'Ottawa, ON',
      duration: '3 months',
      salary: '$8,000/month',
      posted: '1 day ago',
      description: 'Work on cutting-edge AI research projects...',
      skills: ['Python', 'Research', 'TensorFlow'],
      status: 'not-applied'
    },
    {
      id: 2,
      title: 'ML Engineering Intern',
      company: 'Microsoft',
      location: 'Laval, QC',
      duration: '12 weeks',
      salary: '$7,500/month',
      posted: '3 days ago',
      description: 'Build machine learning systems...',
      skills: ['Python', 'Azure', 'Machine Learning'],
      status: 'saved'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Internships</h1>
            <p className="text-gray-600 mt-1">Find AI and tech internship opportunities</p>
          </div>
          <Button>Post Internship</Button>
        </div>

        {/* Search and Filters - similar to Jobs */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search internships..." className="pl-10" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All Internships</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="applied">Applied</TabsTrigger>
            <TabsTrigger value="interview">Interviews</TabsTrigger>
            <TabsTrigger value="viewed">Viewed</TabsTrigger>
            <TabsTrigger value="hidden">Hidden</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              {mockInternships.map((internship) => (
           
                <JobCard key={internship.id} job={internship} />
            
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Internships;
